import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createHealthTools } from '@/lib/ai/health-tools';
import { buildPatientContext } from '@/lib/ai/patient-context';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { messages, conversationId: bodyConversationId } = body;

  const lastUserMessage = messages[messages.length - 1];

  // Get or create a conversation record for persistence
  let conversationId = bodyConversationId;
  if (!conversationId) {
    const firstMsg = lastUserMessage?.content?.slice(0, 60) || 'Health Chat';
    const conv = await prisma.conversation.create({
      data: { userId, title: firstMsg },
    });
    conversationId = conv.id;
  }

  // Persist the user message
  if (lastUserMessage && lastUserMessage.role === 'user') {
    await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: lastUserMessage.content,
      },
    }).catch(console.error);
  }

  // Convert UIMessages (from useChat) to ModelMessages (for the LLM)
  const modelMessages = convertToModelMessages(messages);

  // Build this patient's unique health profile for the system prompt
  const { profile, hasData, recordCount } = await buildPatientContext(userId);
  const tools = createHealthTools(userId);

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    system: `
You are Dr. Leo, a compassionate and brilliant AI health assistant for TakeCare.
You have tools to search the patient's actual medical records, vitals, doctor notes, voice consultation history, and current medical research.

RULES:
- Always search records before answering health questions. Never guess.
- If uncertain, say so clearly and recommend a real doctor visit.
- Be warm and clear. Avoid cold clinical language.
- Cite the source record and date when referencing health data.
- If you sense urgency or emergency, prioritize safety above all.

${
  hasData
    ? `=== PATIENT PROFILE ===\n${profile}\n=== END PROFILE ===\nThis patient has ${recordCount} records on file.`
    : 'This patient has not uploaded any records yet. Encourage them to use the Analyze tab.'
}
`,
    messages: modelMessages,
    tools,
    maxSteps: 5,
    onFinish: async ({ text }) => {
      // Persist assistant response to conversation history
      try {
        await prisma.message.create({
          data: { conversationId, role: 'assistant', content: text },
        });
      } catch (error) {
        console.error('[ChatRoute] Error saving assistant message:', error);
      }
    },
  });

  // toDataStreamResponse() is the only correct return type for useChat
  return result.toDataStreamResponse({
    headers: { 'X-Conversation-Id': conversationId },
  });
}
