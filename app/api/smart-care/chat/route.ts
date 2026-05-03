import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createHealthTools } from '@/lib/ai/health-tools';
import { buildPatientContext } from '@/lib/ai/patient-context';

export async function POST(req: Request) {
  console.log("[ChatAPI] Request received");
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error("[ChatAPI] Auth Error:", err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }

  if (!session?.user?.id) {
    console.error("[ChatAPI] Unauthorized - No session user ID");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log("[ChatAPI] User authorized:", userId);
  
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error("[ChatAPI] Failed to parse JSON body");
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { messages, conversationId: bodyConversationId } = body;
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.error("[ChatAPI] No messages found in request");
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  const lastUserMessage = messages[messages.length - 1];

  // SDK v6 UIMessages use parts[] not content. Extract text from either format.
  function getMessageText(msg: any): string {
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.parts)) {
      const textPart = msg.parts.find((p: any) => p.type === 'text');
      return textPart?.text || '';
    }
    return '';
  }

  // Get or create a conversation record for persistence
  let conversationId = bodyConversationId;
  try {
    if (!conversationId) {
      const firstMsg = getMessageText(lastUserMessage).slice(0, 60) || 'Health Chat';
      const conv = await prisma.conversation.create({
        data: { userId, title: firstMsg },
      });
      conversationId = conv.id;
    }
  } catch (err) {
    console.error("[ChatAPI] Prisma Conversation Error:", err);
    return NextResponse.json({ error: 'Database error: Conversation creation failed' }, { status: 500 });
  }

  // Persist the user message
  try {
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await prisma.message.create({
        data: {
          conversationId,
          role: 'user',
          content: getMessageText(lastUserMessage),
        },
      });
    }
  } catch (err) {
    console.error("[ChatAPI] Prisma Message Error (User):", err);
  }

  // Convert UIMessages (from useChat) to ModelMessages (for the LLM)
  let modelMessages;
  try {
    modelMessages = convertToModelMessages(messages);
  } catch (err) {
    console.error("[ChatAPI] Message conversion error:", err);
    return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
  }

  // Build this patient's unique health profile for the system prompt
  let profile, hasData, recordCount, tools;
  try {
    console.log("[ChatAPI] Building patient context");
    const context = await buildPatientContext(userId);
    profile = context.profile;
    hasData = context.hasData;
    recordCount = context.recordCount;
    tools = createHealthTools(userId);
  } catch (err) {
    console.error("[ChatAPI] Context/Tools Error:", err);
    return NextResponse.json({ error: 'Failed to build AI context' }, { status: 500 });
  }

  try {
    console.log("[ChatAPI] Starting AI stream");
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
          console.log("[ChatAPI] Persisting assistant response");
          await prisma.message.create({
            data: { conversationId, role: 'assistant', content: text },
          });
        } catch (error) {
          console.error('[ChatAPI] Error saving assistant message:', error);
        }
      },
    });

    console.log("[ChatAPI] Stream initialized successfully");
    return result.toDataStreamResponse({
      headers: { 'X-Conversation-Id': conversationId },
    });
  } catch (err: any) {
    console.error("[ChatAPI] StreamText Exception:", err);
    return NextResponse.json({ 
      error: 'AI Generation failed', 
      details: err.message 
    }, { status: 500 });
  }
}
