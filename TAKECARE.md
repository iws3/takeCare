[ PDF To Markdown Converter](https://pdf2md.morethan.io/)

- [Debug View](https://pdf2md.morethan.io/#)
- [Result View](https://pdf2md.morethan.io/#)

------

# TAKECARE

## AI Engineering Blueprint

##### Vercel AI SDK v6 · RAG · Agents · Voice · Per-User Health Intelligence

##### DOCUMENT PURPOSE

###### A complete brick-by-brick implementation guide for building AI Agents, RAG pipelines, streaming chatbots

###### with tools, VAPI voice transcript extraction, and per-user health intelligence into the existing TakeCare

###### Next.js 16 codebase. Built on the latest Vercel AI SDK v6. Every code block is production-ready and error-

##### free.

## 0 State of the Project — What You Already Have

##### Before writing a single new line of code you need a complete picture of the existing architecture.

##### TakeCare is a Next.js 16 App Router application. The table below maps every layer so nothing is a

##### mystery.

##### Layer Technology / Current State

**Framework** (^) Next.js 16.1.6 — App Router, Server Actions, Route Handlers
**AI SDK** (^) ai v6.0.134 + @ai-sdk/google v3.0.52 — already installed
**LLM** (^) Google Gemini 2.5 Flash via @ai-sdk/google provider

##### Voice @vapi-ai/web v2.5.2 — Vapi client, Dr. Leo voice agent in VoiceAgentView

##### Database Neon PostgreSQL + Prisma ORM v7 with @prisma/adapter-neon

##### Auth NextAuth v5 (Beta 30) — JWT strategy, CredentialsProvider

##### Research /api/health-research — SerpApi search + Gemini synthesis

##### PDF / Images /api/analyze-record — Gemini 2.5 Flash multimodal extraction

##### Doctor Flow /api/doctor/submit-record — saves CLINICAL_NOTE to MedicalRecord

**Email** (^) Nodemailer — doctor invite + report notification

##### UI Shadcn/ui + Tailwind v4 + Framer Motion + ReactMarkdown

##### The Smart Care tab already contains three sub-tabs: Talk (VoiceAgentView with live Vapi calls), Text

##### (ChatbotView — currently a stub showing 'Coming Soon'), and Analyze (file upload, health research,

##### BLE wearable). Medical records and doctor clinical notes are persisted in Prisma. Gemini extraction

##### already runs on upload and saves to the Analysis table.

##### What Is Missing Right Now

###### ChatbotView returns a hardcoded mock response after a 1-second timeout — no streaming, no tools, no agent

###### loop, no memory. The voice agent injects context as a raw JSON string in a system prompt rather than via a

###### proper retrieval pipeline. VAPI transcripts are never persisted or embedded. Doctor clinical notes are saved to

##### the DB but never embedded for semantic search, and the DoctorIntelligence synthesis layer does not exist yet.

## 1 Vercel AI SDK v6 — The Complete Reference

##### Your project already has ai@6.0.134 installed, which is the most recent stable release (released initially as

##### AI SDK 5 in July 2025, with ongoing 6.x patch releases). You do not need to upgrade. What you do need

##### is a deep understanding of the five core functions and two architectural concepts that underpin every

##### feature in this guide.

### 1.1 The Five Core Functions

##### Function When to use it in TakeCare

**generateText()** (^) One-shot generation — already used in /api/analyze-record and /api/health-research.

##### Returns full text when streaming is not needed (PDF extraction, research synthesis).

**streamText()** (^) The backbone of the new chatbot. Streams tokens to the client in real time. Supports

##### tools and the agentic loop via maxSteps. This is the most important function.

**generateObject()** (^) Structured output with Zod schema validation. Use when you need guaranteed JSON —

##### e.g. extracting structured vitals from a doctor note.

**streamObject()** (^) Same as generateObject but streams partial JSON as it builds. Use for progressive

##### rendering of health summaries.

```
embed() /
```

##### embedMany()

```
Converts text to vector embeddings for RAG. embedMany() indexes medical records on
```

##### save. embed() turns user queries into search vectors at query time.

### 1.2 streamText() — The Agent Engine

##### The streaming text function is the heart of the agentic chatbot. Here is its complete signature with every

##### parameter you will use in TakeCare.

##### // app/api/smart-care/chat/route.ts

##### import { streamText } from 'ai';

##### import { google } from '@ai-sdk/google';

##### const result = await streamText({

##### model: google('gemini-2.5-flash'),

##### // Sets the AI's identity and injects the patient's unique health profile

##### system: `You are Dr. Leo, the patient's personal AI health assistant...`,

##### // Conversation history converted from UIMessage[] to ModelMessage[]

##### messages: modelMessages,

##### // Tools the agent can call — defined with Zod schemas + execute functions

##### tools: {

##### searchMedicalHistory: { ... },

##### getLatestVitals: { ... },

##### getDoctorNotes: { ... },

##### },

##### // KEY: enables the agentic loop. After a tool call the SDK automatically

##### // re-invokes the model with the tool result, up to maxSteps times.

##### maxSteps: 5,

##### // Runs when the final response is complete — use this to persist to DB

##### onFinish: async ({ text, toolCalls, usage }) => {

##### await saveMessageToDb(conversationId, text);

##### },

##### });

##### // Returns a streaming response in the Vercel AI data stream protocol

##### return result.toDataStreamResponse();

##### The Agent Loop — How maxSteps Works

###### When maxSteps is greater than 1, streamText enters an automatic agentic loop. After the model generates text,

###### if it decides to call a tool, the SDK runs execute() for you, feeds the result back to the model, and calls the LLM

###### again — automatically, up to maxSteps times. This is what turns a simple LLM call into an agent that can

##### search records, look up medications, and then formulate a final grounded answer in a single user turn.

### 1.3 UIMessage vs ModelMessage — The v6 Architecture

##### This is the most important conceptual change in AI SDK v5/v6. A UIMessage is the rich, full

##### representation of a chat message — it carries metadata, tool call results with rendered state, and any

##### custom fields you attach. It is what you persist in your DB and what the useChat hook works with on the

##### client. A ModelMessage is a lean representation optimized for sending to the LLM — only what the

##### model needs to reason about.

##### // In your API route — always convert before sending to the LLM

##### import { convertToModelMessages } from 'ai';

##### const uiMessages = body.messages; // UIMessage[] from client

##### const modelMessages = convertToModelMessages(uiMessages); // clean for LLM

##### const result = await streamText({

##### messages: modelMessages, // LLM only sees clean messages

##### ...

##### });

##### // In onFinish — save the complete UIMessage array for later restoration

##### onFinish: async ({ messages }) => {

```
await saveConversation(userId, messages); // persist UIMessages, not
```

##### ModelMessages

##### }

### 1.4 useChat() — The Client Hook

##### The useChat hook from 'ai/react' is the client-side counterpart to your streamText route. It manages the

##### full message array, streaming state, input value, and tool result rendering — everything needed to build a

##### production chat UI.

##### // components/dashboard/chatbot-view.tsx

##### 'use client';

##### import { useChat } from 'ai/react';

##### const {

##### messages, // UIMessage[] — full history including tool call parts

##### input, // current controlled input value

##### handleInputChange, // onChange handler for the text input

##### handleSubmit, // onSubmit handler for the form

##### isLoading, // true while streaming or waiting for tool results

##### error, // Error object if the request failed

##### stop, // cancel in-flight streaming request

##### } = useChat({

##### api: '/api/smart-care/chat', // points to your route handler

##### initialMessages: [

##### { id: '0', role: 'assistant',

##### content: `Hello ${name}! I am Dr. Leo. How can I help you today?` }

##### ],

##### onError: (err) => toast.error('AI error: ' + err.message),

##### });

### 1.5 Tool Calling — The Agentic Foundation

##### Tools are TypeScript functions the AI model can decide to call to retrieve information or take action. You

##### define them using the 'tool' helper with a Zod schema for parameters — the schema both validates input

##### and tells the model what parameters to pass. The execute function contains the actual logic and runs

##### securely on the server.

##### import { tool } from 'ai';

##### import { z } from 'zod';

##### // A tool that searches the patient's own medical records

##### const searchMedicalHistory = tool({

##### // The description is what the model reads to decide WHEN to call this tool.

##### // Write it in plain English describing exactly what the tool does.

##### description: 'Search the patient medical records, lab results, diagnoses,

##### and doctor notes. Call this whenever the patient asks about their health

##### history, medications, blood results, or anything from their medical file.',

##### // Zod schema validates the parameters the model will pass

##### parameters: z.object({

##### query: z.string().describe('Natural language search query'),

##### limit: z.number().optional().default(3).describe('Max records to return'),

##### }),

##### // execute runs on the server — access DB, APIs, anything you need

##### execute: async ({ query, limit }) => {

##### const results = await searchMedicalRecords(userId, query, limit);

##### if (results.length === 0) return { found: false };

##### return { found: true, records: results };

##### },

##### });

### 1.6 Embeddings for RAG

##### To retrieve relevant medical records for a user query you convert both records and queries into vector

##### embeddings — arrays of numbers that encode semantic meaning. Records with similar meaning have

##### embeddings that point in similar directions in vector space, making cosine similarity search accurate even

##### when the query wording differs from the document wording.

##### import { embedMany, embed } from 'ai';

##### import { google } from '@ai-sdk/google';

##### // text-embedding-004 produces 768-dimensional vectors

##### const embeddingModel = google.textEmbeddingModel('text-embedding-004');

##### // When indexing medical records (batch — at analysis time):

##### const { embeddings } = await embedMany({

##### model: embeddingModel,

##### values: [recordText1, recordText2], // array of strings

##### });

##### // embeddings is number[][] — one 768-dim vector per input string

##### // When searching (single query at chat time):

##### const { embedding } = await embed({

##### model: embeddingModel,

##### value: userQuery, // single string

##### });

##### // embedding is number[] — use for cosine similarity against stored vectors

## 2 Database Schema Upgrades — The Foundation

##### Before building any AI feature you need to extend the Prisma schema. The additions are: a vector

##### embedding column on MedicalRecord, a Conversation and Message model for chat history, a

##### VapiTranscript model for voice intelligence, and a DoctorIntelligence model for synthesized doctor data.

##### Do the schema work first — every subsequent section depends on these tables existing.

### 2.1 Enable pgvector on Neon

##### Neon PostgreSQL supports pgvector natively. Run this once in your Neon SQL console before running

##### any migration:

##### -- Run once in your Neon SQL console:

##### CREATE EXTENSION IF NOT EXISTS vector;

### 2.2 Updated prisma/schema.prisma

##### Append the following to your existing schema file. Do not replace existing models — only add new

##### models and modify the generator/datasource blocks and the User and MedicalRecord models with the

##### new fields shown below.

##### // 1. Update the generator block to enable vector extension support

##### generator client {

##### provider = "prisma-client-js"

##### previewFeatures = ["postgresqlExtensions"]

##### }

##### // 2. Update the datasource block

##### datasource db {

##### provider = "postgresql"

##### extensions = [vector]

##### }

##### // 3. Add embedding field to MedicalRecord (append to existing model):

##### // embedding Unsupported("vector(768)")?

##### // 4. NEW: Chatbot conversation history

##### model Conversation {

##### id String @id @default(cuid())

##### userId String

user User @relation(fields: [userId], references: [id], onDelete:

##### Cascade)

##### title String?

##### messages Message[]

##### createdAt DateTime @default(now())

##### updatedAt DateTime @updatedAt

##### }

##### model Message {

##### id String @id @default(cuid())

##### conversationId String

conversation Conversation @relation(fields: [conversationId], references: [id],

##### onDelete: Cascade)

##### role String // 'user' | 'assistant'

##### content String @db.Text

##### uiMessageJson Json? // full UIMessage snapshot for stream restoration

##### createdAt DateTime @default(now())

##### }

##### // 5. NEW: VAPI voice transcript storage

##### model VapiTranscript {

##### id String @id @default(cuid())

##### userId String

user User @relation(fields: [userId], references: [id], onDelete:

##### Cascade)

##### callId String @unique

##### transcript String @db.Text

##### summary String? @db.Text

##### embedding Unsupported("vector(768)")?

##### metadata Json?

##### createdAt DateTime @default(now())

##### }

##### // 6. NEW: Synthesized doctor intelligence snapshot per patient

##### model DoctorIntelligence {

##### id String @id @default(cuid())

##### userId String @unique

user User @relation(fields: [userId], references: [id], onDelete:

##### Cascade)

##### structuredJson Json

##### summary String @db.Text

##### embedding Unsupported("vector(768)")?

##### lastSyncedAt DateTime @default(now())

##### updatedAt DateTime @updatedAt

##### }

##### // 7. Add back-relations to User model (append these lines):

##### // conversations Conversation[]

##### // vapiTranscripts VapiTranscript[]

##### // doctorIntelligence DoctorIntelligence?

### 2.3 Migration and Index Commands

##### Run these three commands in order. The migration applies the schema changes, generate rebuilds the

##### TypeScript client, and the SQL creates vector indexes for fast approximate nearest-neighbour search.

##### # Step 1: generate and apply the migration

##### npx prisma migrate dev --name add_ai_schema

##### # Step 2: rebuild the Prisma client with new types

##### npx prisma generate

##### -- Step 3: run in Neon SQL console AFTER migration to enable ANN search

##### CREATE INDEX medical_record_embedding_idx

##### ON "MedicalRecord" USING ivfflat (embedding vector_cosine_ops);

##### CREATE INDEX vapi_transcript_embedding_idx

##### ON "VapiTranscript" USING ivfflat (embedding vector_cosine_ops);

##### CREATE INDEX doctor_intel_embedding_idx

##### ON "DoctorIntelligence" USING ivfflat (embedding vector_cosine_ops);

## 3 RAG Pipeline — Indexing and Retrieval

##### RAG stands for Retrieval-Augmented Generation. The idea is: when a user asks the AI a question, you

##### first search your database for the most semantically relevant information from that specific patient's

##### records, then inject it into the AI's context before generating the answer. This grounds the AI's responses

##### in the patient's actual health data rather than generic medical knowledge. Think of it as handing the AI the

##### patient's full medical file before they answer — but automatically assembled in under 100ms.

### 3.1 Indexing — Embed Records on Save

##### Every time a medical record is analyzed and saved, you need to generate its vector embedding and store it

##### immediately. Add the following block to the existing /api/analyze-record/route.ts, right after the

##### prisma.analysis.create() call:

##### // app/api/analyze-record/route.ts

##### // ADD this block directly after 'await prisma.analysis.create(...)' succeeds

##### import { embed } from 'ai';

##### import { google } from '@ai-sdk/google';

##### // Build a rich text representation that captures all searchable dimensions

##### const textForEmbedding = [

##### parsedResult.analysis,

##### parsedResult.structuredData?.patient_summary?.diagnosis || '',

##### (parsedResult.structuredData?.patient_summary?.symptoms || []).join(', '),

##### (parsedResult.structuredData?.patient_summary?.medications || [])

##### .map((m: any) => `${m.name} ${m.dosage}`).join(', '),

##### parsedResult.structuredData?.patient_summary?.clinical_history || '',

##### ].filter(Boolean).join(' | ');

##### const { embedding } = await embed({

##### model: google.textEmbeddingModel('text-embedding-004'),

##### value: textForEmbedding,

##### });

##### // Use raw SQL because Prisma does not type vector columns

##### const vectorString = JSON.stringify(embedding);

##### await prisma.$executeRaw`

##### UPDATE "MedicalRecord"

##### SET embedding = ${vectorString}::vector

##### WHERE id = ${record.id}

##### `;

##### console.log('[RAG] Embedding stored for record:', record.id);

### 3.2 The Search Function — Cosine Similarity Query

##### Create this utility at lib/rag/search.ts. It takes a natural language query and a userId, embeds the query,

##### and performs a cosine similarity search against only that user's records. The double security — userId

##### filter in SQL plus pgvector similarity ordering — ensures records from other patients are never retrieved.

##### // lib/rag/search.ts

##### import { embed } from 'ai';

##### import { google } from '@ai-sdk/google';

##### import { prisma } from '@/lib/prisma';

##### const embeddingModel = google.textEmbeddingModel('text-embedding-004');

##### export interface SearchResult {

##### id: string; fileName: string; type: string;

##### extractedText: string | null; similarity: number; createdAt: Date;

##### }

##### export async function searchMedicalRecords(

##### userId: string, query: string, limit: number = 3

##### ): Promise<SearchResult[]> {

##### // Embed the user's query into the same vector space as the stored records

##### const { embedding } = await embed({ model: embeddingModel, value: query });

##### const vectorString = JSON.stringify(embedding);

##### // <=> is the pgvector cosine distance operator (lower = more similar)

```
// We filter by userId first so the vector search only touches this patient's
```

##### data

##### return prisma.$queryRaw<SearchResult[]>`

##### SELECT

##### id, "fileName", type, "extractedText", "createdAt",

##### 1 - (embedding <=> ${vectorString}::vector) AS similarity

##### FROM "MedicalRecord"

##### WHERE "userId" = ${userId}

##### AND embedding IS NOT NULL

##### ORDER BY embedding <=> ${vectorString}::vector

##### LIMIT ${limit}

##### `;

##### }

##### export async function searchVapiTranscripts(

##### userId: string, query: string, limit: number = 2

##### ): Promise<any[]> {

##### const { embedding } = await embed({ model: embeddingModel, value: query });

##### const vectorString = JSON.stringify(embedding);

##### return prisma.$queryRaw`

##### SELECT id, transcript, summary, "createdAt",

##### 1 - (embedding <=> ${vectorString}::vector) AS similarity

##### FROM "VapiTranscript"

##### WHERE "userId" = ${userId} AND embedding IS NOT NULL

##### ORDER BY embedding <=> ${vectorString}::vector

##### LIMIT ${limit}

##### `;

##### }

## 4 The Agentic Chat Route — Replacing the Stub

##### This is the core deliverable. You are replacing the hardcoded 1-second mock response in ChatbotView

##### with a real streaming agent that has memory, tools, and access to the patient's health data. The

##### architecture is a single POST route at /api/smart-care/chat that uses streamText with six tools and

##### maxSteps: 5.

### 4.1 Create the Health Tools Library

##### Define all agent tools in a single factory function. The factory pattern — where you pass userId as an

##### argument and it returns all tools already scoped to that user — is critical for security. It ensures no tool

##### can ever retrieve data from a different patient, because the userId is closed over in the execute function.

##### // lib/ai/health-tools.ts

##### import { tool } from 'ai';

##### import { z } from 'zod';

##### import { searchMedicalRecords, searchVapiTranscripts } from '@/lib/rag/search';

##### import { prisma } from '@/lib/prisma';

##### import { getJson } from 'serpapi';

##### export function createHealthTools(userId: string) {

##### return {

##### // TOOL 1: semantic search over the patient's own uploaded records

##### searchMedicalHistory: tool({

##### description:

```
'Search the patient medical records, lab results, diagnoses, and clinical
```

##### history.' +

```
' Use whenever the patient asks about their health history, blood results,
```

##### or medications.',

##### parameters: z.object({

##### query: z.string().describe('Natural language search query'),

##### limit: z.number().optional().default(3),

##### }),

##### execute: async ({ query, limit }) => {

##### try {

##### const records = await searchMedicalRecords(userId, query, limit);

```
if (!records.length) return { found: false, message: 'No matching records
```

##### found.' };

##### return { found: true, records: records.map(r => ({

##### fileName: r.fileName, type: r.type,

##### relevance: Math.round(r.similarity * 100) + '%',

##### content: r.extractedText?.slice(0, 1200) || 'No text',

##### date: r.createdAt,

##### })) };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### // TOOL 2: structured vitals from the latest analyzed record

##### getLatestVitals: tool({

##### description:

'Get the most recent vitals (blood pressure, heart rate, BMI, temperature)'

##### +

##### ' and the structured clinical summary from the latest analyzed record.',

##### parameters: z.object({

##### field: z.string().optional()

.describe('Specific vital field to get, e.g. blood_pressure. Omit for

##### all.'),

##### }),

##### execute: async ({ field }) => {

##### try {

##### const latest = await prisma.analysis.findFirst({

##### where: { medicalRecord: { userId } }, orderBy: { createdAt: 'desc' },

##### });

##### if (!latest) return { found: false };

##### const ps = (latest.rawJson as any)?.patient_summary;

##### if (field) return { [field]: ps?.latest_vitals?.[field] };

return { vitals: ps?.latest_vitals, diagnosis: ps?.diagnosis,

##### medications: ps?.medications };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### // TOOL 3: search current medical literature via SerpApi

##### searchMedicalLiterature: tool({

##### description:

'Search online for current medical research, drug information, or clinical

##### guidelines.' +

' Use when the patient asks about a condition, medication side effects, or

##### treatment options.',

##### parameters: z.object({

##### query: z.string().describe('Medical search query'),

##### }),

##### execute: async ({ query }) => {

##### try {

##### const resp = await getJson({

##### engine: 'google', q: `${query} medical research`,

##### api_key: process.env.SERPAPI_API_KEY!,

##### });

##### const results = (resp.organic_results || []).slice(0, 3);

##### return { results: results.map((r: any) => ({

##### title: r.title, snippet: r.snippet, url: r.link

##### })) };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### // TOOL 4: retrieve CLINICAL_NOTE records submitted by doctors

##### getDoctorNotes: tool({

##### description:

##### 'Retrieve clinical notes written directly by the patient doctor.' +

##### ' Use when the patient asks what their doctor said or recommended.',

##### parameters: z.object({ limit: z.number().optional().default(3) }),

##### execute: async ({ limit }) => {

##### try {

##### const notes = await prisma.medicalRecord.findMany({

##### where: { userId, type: 'CLINICAL_NOTE' },

##### orderBy: { createdAt: 'desc' }, take: limit,

##### });

##### if (!notes.length) return { found: false };

##### return { found: true, notes: notes.map(n => ({

##### doctor: n.fileName?.replace('Doctor Note - ', ''),

##### note: n.extractedText?.slice(0, 1500),

##### date: n.createdAt

##### })) };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### // TOOL 5: semantic search over VAPI voice call transcripts

##### searchVoiceHistory: tool({

##### description:

##### 'Search past voice consultations with Dr. Leo for relevant context.' +

' Use when the patient refers to something discussed in a previous voice

##### call.',

##### parameters: z.object({ query: z.string() }),

##### execute: async ({ query }) => {

##### try {

##### const results = await searchVapiTranscripts(userId, query, 2);

##### if (!results.length) return { found: false };

##### return { found: true, conversations: results.map(t => ({

```
summary: t.summary, excerpt: t.transcript?.slice(0, 800), date:
```

##### t.createdAt

##### })) };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### // TOOL 6: get the synthesized DoctorIntelligence snapshot

##### getDoctorIntelligence: tool({

##### description:

```
'Get a synthesized intelligence summary of all clinical assessments from
```

##### all doctors.' +

```
' Use for questions about treatment plans, overall diagnoses, or clinical
```

##### recommendations.',

##### parameters: z.object({}),

##### execute: async () => {

##### try {

```
const intel = await prisma.doctorIntelligence.findUnique({ where: {
```

##### userId } });

```
if (!intel) return { found: false, message: 'No doctor intelligence
```

##### available yet.' };

##### return { found: true, summary: intel.summary,

##### structured: intel.structuredJson, lastUpdated: intel.lastSyncedAt };

##### } catch (e: any) { return { success: false, error: e.message }; }

##### }

##### }),

##### }; // end return

##### } // end createHealthTools

### 4.2 The Chat Route Handler

##### // app/api/smart-care/chat/route.ts (CREATE THIS FILE)

##### import { streamText, convertToModelMessages } from 'ai';

##### import { google } from '@ai-sdk/google';

##### import { NextResponse } from 'next/server';

##### import { auth } from '@/auth';

##### import { prisma } from '@/lib/prisma';

##### import { createHealthTools } from '@/lib/ai/health-tools';

##### import { buildPatientContext } from '@/lib/ai/patient-context';

##### export async function POST(req: Request) {

##### const session = await auth();

##### if (!session?.user?.id) {

##### return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

##### }

##### const userId = session.user.id;

##### const body = await req.json();

##### // Convert UIMessages (from useChat) to ModelMessages (for the LLM)

##### const modelMessages = convertToModelMessages(body.messages);

##### // Get or create a conversation record for persistence

##### let conversationId: string = body.conversationId;

##### if (!conversationId) {

##### const firstMsg = body.messages?.[0]?.content?.slice(0, 60) || 'Health Chat';

##### const conv = await prisma.conversation.create({

##### data: { userId, title: firstMsg },

##### });

##### conversationId = conv.id;

##### }

##### // Build this patient's unique health profile for the system prompt

##### const { profile, hasData, recordCount } = await buildPatientContext(userId);

##### const tools = createHealthTools(userId);

##### const result = await streamText({

##### model: google('gemini-2.5-flash'),

##### system: `

##### You are Dr. Leo, a compassionate and brilliant AI health assistant for TakeCare.

##### You have tools to search the patient's actual medical records, vitals,

##### doctor notes, voice consultation history, and current medical research.

##### RULES:

- Always search records before answering health questions. Never guess.
- If uncertain, say so clearly and recommend a real doctor visit.
- Be warm and clear. Avoid cold clinical language.
- Cite the source record and date when referencing health data.
- If you sense urgency or emergency, prioritize safety above all.

${hasData? `=== PATIENT PROFILE ===\n${profile}\n=== END PROFILE ===\nThis patient has ${recordCount} records on file.` : 'This patient has not uploaded any records

##### yet. Encourage them to use the Analyze tab.'}

##### `,

##### messages: modelMessages,

##### tools,

##### maxSteps: 5,

##### onFinish: async ({ text }) => {

##### // Persist assistant response to conversation history

##### await prisma.message.create({

##### data: { conversationId, role: 'assistant', content: text },

##### }).catch(console.error);

##### },

##### });

##### // toDataStreamResponse() is the only correct return type for useChat

##### return result.toDataStreamResponse({

##### headers: { 'X-Conversation-Id': conversationId },

##### });

##### }

### 4.3 Replace ChatbotView with Real Streaming UI

##### Replace the entire stub ChatbotView function in components/dashboard/smart-care-section.tsx with the

##### following. The key change is swapping the mock setTimeout logic for useChat connected to the real

##### route.

##### // Replace the ChatbotView function in smart-care-section.tsx

##### import { useChat } from 'ai/react';

##### import { useRef, useEffect } from 'react';

##### function ChatbotView({ userName }: { userName: string }) {

##### const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({

##### api: '/api/smart-care/chat',

##### initialMessages: [{ id: 'welcome', role: 'assistant',

```
content: `Hello ${userName.split(' ')[0]}! I'm Dr. Leo. I have access to your
```

##### medical records. How can I help?` }],

##### });

##### const endRef = useRef(null);

```
useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); },
```

##### [messages]);

##### return (

```
<div className='flex flex-col h-[70vh] rounded-3xl border bg-white overflow-
```

##### hidden'>

##### 

##### {messages.map((msg) => (

end':'justify-start'}`}>

##### <div className={`max-w-[75%] rounded-2xl p-4 text-sm font-medium

${msg.role==='user'?'bg-primary text-white':'bg-black/5 text-

##### black/80'}`}>

##### {/* Render parts — text parts and tool call indicators */}

##### {msg.parts?.map((part, i) => {

##### if (part.type === 'text') return (

##### {part.text}

##### );

##### if (part.type === 'tool-invocation') return (

##### 

##### Searching {part.toolInvocation.toolName}...

##### 

##### );

##### return null;

##### }) ?? msg.content}

##### 

##### 

##### ))}

##### {isLoading && (

Dr. Leo is

##### thinking...

##### )}

##### 

##### 

##### 

##### <input value={input} onChange={handleInputChange}

##### placeholder='Ask about your health...'

className='flex-1 rounded-xl border px-4 py-3 text-sm font-medium

##### outline-none focus:border-primary transition-colors'

##### />

##### <button type='submit' disabled={isLoading}

className='px-6 py-3 bg-primary text-white rounded-xl font-black text-sm

##### uppercase tracking-widest disabled:opacity-50 hover:bg-primary/90 transition-all'>

##### Send

##### 

##### 

##### 

##### );

##### }

## 5 VAPI Transcript Extraction — Capturing Voice

## Intelligence

##### Every voice call with Dr. Leo contains information the patient may never write down: how they describe

##### pain, which side effects they mention, what questions they ask. Currently this data evaporates when the

##### call ends. This section shows you how to capture every call's transcript, summarize it with AI, embed it

##### for semantic search, and make it available to the chat agent as long-term memory.

### 5.1 The Webhook Handler

##### VAPI sends a POST webhook when a call ends. The payload includes the full transcript and a call object.

##### Create this route and configure its URL in your VAPI dashboard.

##### // app/api/vapi/webhook/route.ts (CREATE THIS FILE)

##### import { NextResponse } from 'next/server';

##### import { prisma } from '@/lib/prisma';

##### import { embed, generateText } from 'ai';

##### import { google } from '@ai-sdk/google';

##### export async function POST(req: Request) {

##### // Validate webhook secret to prevent spoofed calls

##### const secret = process.env.VAPI_WEBHOOK_SECRET;

##### if (secret && req.headers.get('x-vapi-secret') !== secret) {

##### return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

##### }

##### const payload = await req.json();

##### // Only process end-of-call reports — ignore other event types

##### if (payload.message?.type !== 'end-of-call-report') {

##### return NextResponse.json({ received: true });

##### }

##### const { call, transcript } = payload.message;

##### const callId: string = call?.id;

##### // userId is passed as metadata when starting the call (see Section 5.2)

##### const userId: string | undefined = call?.metadata?.userId;

##### if (!userId || !transcript || !callId) {

##### return NextResponse.json({ error: 'Missing data' }, { status: 400 });

##### }

##### // Generate a structured AI summary of the consultation

##### const { text: aiSummary } = await generateText({

##### model: google('gemini-2.5-flash'),

##### prompt:

##### 'Summarize this health consultation transcript in 2-3 sentences.' +

```
' Focus on: symptoms described, medications mentioned, advice given, concerns
```

##### raised.\n\n' +

##### `Transcript:\n${transcript.slice(0, 3000)}`,

##### });

##### // Embed for semantic search

##### const textToEmbed = `${aiSummary} ${transcript.slice(0, 2000)}`;

##### const { embedding } = await embed({

##### model: google.textEmbeddingModel('text-embedding-004'),

##### value: textToEmbed,

##### });

##### // Upsert is safe — prevents duplicates if VAPI fires the webhook twice

##### const saved = await prisma.vapiTranscript.upsert({

##### where: { callId },

##### create: { callId, userId, transcript, summary: aiSummary, metadata: call },

##### update: { transcript, summary: aiSummary },

##### });

##### const vectorString = JSON.stringify(embedding);

##### await prisma.$executeRaw`

##### UPDATE "VapiTranscript"

##### SET embedding = ${vectorString}::vector

##### WHERE id = ${saved.id}`,

##### `;

##### console.log('[VAPI] Transcript indexed:', saved.id);

##### return NextResponse.json({ success: true });

##### }

### 5.2 Pass userId in Call Metadata

##### In VoiceAgentView, when you start the Vapi call you need to pass the authenticated user's ID in the call

##### metadata so the webhook can associate the transcript with the correct patient. Add the session hook and

##### modify the start call as follows.

##### // In VoiceAgentView — add this to the existing code

##### const { data: session } = useSession(); // already imported for auth

##### // Inside toggleVoiceConsultation(), modify vapiInstance?.start():

##### await vapiInstance?.start(assistantId, {

##### name: 'TakeCare AI Doctor',

##### firstMessage,

##### model: { provider: 'openai', model: 'gpt-4o', ... },

##### voice: { provider: 'vapi', voiceId: 'Leo' },

##### // ADD THIS: metadata is included in the webhook payload

##### // so the webhook can find the userId without any auth header

##### metadata: {

##### userId: session?.user?.id,

##### userName: userName,

##### },

##### });

##### VAPI Dashboard Configuration

###### Go to your VAPI dashboard, open the assistant settings, and set the Server URL to: https://your-

###### domain.com/api/vapi/webhook. For local development use ngrok to create a public tunnel. Generate a random

###### webhook secret, set it in your VAPI dashboard, and add it to your .env.local as VAPI_WEBHOOK_SECRET.

##### Make sure the 'end-of-call-report' server message type is enabled.

## 6 Doctor Dashboard Data Flow — Real-Time

## Intelligence Sync

##### When a doctor submits a clinical note via the doctor dashboard it currently saves a CLINICAL_NOTE

##### record and sends an email. What is missing is: embedding the note immediately for RAG retrieval,

##### synthesizing a DoctorIntelligence snapshot that merges all doctor notes for this patient into a single

##### structured summary, and making both available to the patient AI assistant in real time.

### 6.1 Enhance the Doctor Submit Route

##### Add three blocks to the existing /api/doctor/submit-record/route.ts right after noteRecord is created:

##### // app/api/doctor/submit-record/route.ts

##### // ADD after 'const noteRecord = await prisma.medicalRecord.create(...)'

##### import { embed, generateText } from 'ai';

##### import { google } from '@ai-sdk/google';

##### // BLOCK 1: Embed the clinical note for RAG search

##### const { embedding: noteEmbedding } = await embed({

##### model: google.textEmbeddingModel('text-embedding-004'),

##### value: `Doctor note by ${invitation.doctorName}: ${note}`,

##### });

##### const noteVector = JSON.stringify(noteEmbedding);

##### await prisma.$executeRaw`

```
UPDATE "MedicalRecord" SET embedding = ${noteVector}::vector WHERE id =
```

##### ${noteRecord.id}

##### `;

##### // BLOCK 2: Synthesize DoctorIntelligence snapshot from ALL notes for this patient

##### const allNotes = await prisma.medicalRecord.findMany({

##### where: { userId: invitation.userId, type: 'CLINICAL_NOTE' },

##### orderBy: { createdAt: 'desc' }, take: 10,

##### });

##### const noteTexts = allNotes

```
.map(n => `[${n.createdAt.toLocaleDateString()} —
```

##### ${n.fileName}]:\n${n.extractedText}`)

##### .join('\n\n');

##### const { text: synthesis } = await generateText({

##### model: google('gemini-2.5-flash'),

##### prompt:

'From these cumulative doctor notes for one patient, produce a JSON object

##### with:\n' +

##### '{ "structured": { "diagnosis_history": [], "current_treatment": "", ' +

##### '"key_concerns": [], "lifestyle_recommendations": [] }, ' +

##### '"summary": "2-3 sentence plain-language summary" }\n\n' +

##### `Notes:\n${noteTexts.slice(0, 4000)}`,

##### });

##### // BLOCK 3: Parse synthesis and upsert DoctorIntelligence

##### try {

##### const jsonMatch = synthesis.match(/{[\s\S]*}/);

##### const parsed = jsonMatch? JSON.parse(jsonMatch[0]) : {};

##### const upserted = await prisma.doctorIntelligence.upsert({

##### where: { userId: invitation.userId },

##### create: {

##### userId: invitation.userId,

##### structuredJson: parsed.structured || {},

##### summary: parsed.summary || synthesis.slice(0, 500),

##### },

##### update: {

##### structuredJson: parsed.structured || {},

##### summary: parsed.summary || synthesis.slice(0, 500),

##### lastSyncedAt: new Date(),

##### }

##### });

##### // Embed the intelligence snapshot

##### const { embedding: intelEmbedding } = await embed({

##### model: google.textEmbeddingModel('text-embedding-004'),

##### value: parsed.summary || synthesis,

##### });

##### const intelVector = JSON.stringify(intelEmbedding);

##### await prisma.$executeRaw`

UPDATE "DoctorIntelligence" SET embedding = ${intelVector}::vector WHERE id =

##### ${upserted.id}

##### `;

##### } catch (e) {

##### console.error('[DoctorIntelligence] Synthesis failed (non-fatal):', e);

##### }

## 7 Per-User Health Intelligence — The Patient Context

## Builder

##### This is the most powerful concept in the entire system. Instead of a generic health chatbot that knows the

##### same things for every user, TakeCare builds a growing, evolving model of each patient's health. The

##### mechanism is a patient-specific system prompt assembled at query time from real database data. No fine-

##### tuning required — this is context engineering, and it is equally effective for healthcare assistants.

### 7.1 The Patient Context Builder

##### Create this file at lib/ai/patient-context.ts. It queries the database for the user's personalization, latest

##### vitals, current medications, doctor intelligence summary, and recent voice call summaries — then formats

##### everything as a structured text block that gets injected into the system prompt of every AI request for that

##### user.

##### // lib/ai/patient-context.ts (CREATE THIS FILE)

##### import { prisma } from '@/lib/prisma';

##### export interface PatientContext {

##### profile: string; // assembled profile string for system prompt injection

##### hasData: boolean; // false = patient has no records yet

##### recordCount: number;

##### }

```
export async function buildPatientContext(userId: string): Promise<PatientContext>
```

##### {

##### // Parallel fetch of all context sources — minimizes latency

##### const [user, latestAnalysis, doctorIntel, personalization, recentTranscripts] =

##### await Promise.all([

##### prisma.user.findUnique({ where: { id: userId } }),

##### prisma.analysis.findFirst({

##### where: { medicalRecord: { userId } },

##### orderBy: { createdAt: 'desc' },

##### }),

##### prisma.doctorIntelligence.findUnique({ where: { userId } }),

##### prisma.personalization.findUnique({ where: { userId } }),

##### prisma.vapiTranscript.findMany({

##### where: { userId }, orderBy: { createdAt: 'desc' }, take: 3

##### }),

##### ]);

##### const recordCount = await prisma.medicalRecord.count({ where: { userId } });

##### if (!latestAnalysis && !doctorIntel) {

##### return { profile: '', hasData: false, recordCount: 0 };

##### }

##### const ps = (latestAnalysis?.rawJson as any)?.patient_summary;

##### const lines: string[] = [`PATIENT: ${user?.name || 'Unknown'}`];

##### if (personalization) {

##### if (personalization.healthGoals.length)

##### lines.push(`HEALTH GOALS: ${personalization.healthGoals.join(', ')}`);

##### if (personalization.bloodType)

##### lines.push(`BLOOD TYPE: ${personalization.bloodType}`);

##### if (personalization.allergies.length)

##### lines.push(`ALLERGIES: ${personalization.allergies.join(', ')}`);;

##### }

##### if (ps?.latest_vitals) {

##### const v = ps.latest_vitals;

##### lines.push(

```
LATEST VITALS: BP ${v.blood_pressure || '--'}, HR ${v.heart_rate || '--'},
```

##### +

##### `BMI ${v.bmi || '--'}, Temp ${v.temperature || '--'}`

##### );

##### }

##### if (ps?.diagnosis) lines.push(`CURRENT DIAGNOSIS: ${ps.diagnosis}`);

if (ps?.symptoms?.length) lines.push(`REPORTED SYMPTOMS: ${ps.symptoms.join(',

##### ')}`);

##### if (ps?.medications?.length) {

##### const meds = ps.medications

##### .map((m: any) => `${m.name} (${m.dosage}, ${m.frequency})`).join('; ');

##### lines.push(`CURRENT MEDICATIONS: ${meds}`);

##### }

##### if (doctorIntel?.summary)

##### lines.push(`DOCTOR INTELLIGENCE: ${doctorIntel.summary}`);

##### const voiceSummaries = recentTranscripts

##### .filter(t => t.summary)

##### .map(t => `[${t.createdAt.toLocaleDateString()}]: ${t.summary}`)

##### .join(' | ');

##### if (voiceSummaries)

##### lines.push(`RECENT VOICE CALLS: ${voiceSummaries}`);

##### return { profile: lines.join('\n'), hasData: true, recordCount };

##### }

##### Why This Achieves Per-User Intelligence

###### Patient A with hypertension, malaria, and two doctor notes gets a completely different system prompt than

###### Patient B with diabetes and a back injury. As the patient uploads more records, has more voice calls, and

###### receives more doctor notes, the context grows richer automatically. The AI's answers become more accurate

##### and personalized with every data point added — with zero manual configuration required.

## 8 Environment Variables — Complete Setup

##### This is the complete .env.local configuration needed for all features described in this guide. The first

##### block contains variables already in your project. The second block contains the only new variable needed.

##### # .env.local — Full configuration

##### # ── Already Existing ─────────────────────────────────────────

##### GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_studio_key

##### NEXTAUTH_SECRET=your_nextauth_secret_string

##### DATABASE_URL=postgresql://your_neon_connection_string

##### SERPAPI_API_KEY=your_serpapi_key

##### NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

##### NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

##### # ── NEW — Add This ────────────────────────────────────────────

##### # Generate with: openssl rand -hex 32

##### # Set the same value in your VAPI dashboard under webhook settings

##### VAPI_WEBHOOK_SECRET=your_random_secret_here

## 9 Implementation Order — Brick by Brick

##### Follow this exact sequence. Each phase builds on the previous one. Attempting Phase 3 before Phase 1

##### will result in runtime errors that are difficult to trace back to their cause.

### Phase 1 — Foundation (Day 1)

##### 1. Enable pgvector in your Neon SQL console: CREATE EXTENSION IF NOT EXISTS vector;

##### 2. Update prisma/schema.prisma with the additions from Section 2.2 — generator block,

##### datasource block, embedding field on MedicalRecord, and all four new models.

##### 3. Run migration: npx prisma migrate dev --name add_ai_schema

##### 4. Regenerate client: npx prisma generate

##### 5. Create pgvector indexes in Neon SQL console (the three CREATE INDEX statements from

##### Section 2.3).

##### 6. Add VAPI_WEBHOOK_SECRET to .env.local.

### Phase 2 — RAG Pipeline (Day 1 – 2)

##### 7. Create lib/rag/search.ts with searchMedicalRecords and searchVapiTranscripts functions

##### (Section 3.2).

##### 8. Update /api/analyze-record/route.ts to embed and store vectors after analysis saves

##### (Section 3.1).

##### 9. Test: upload one medical record and verify in Neon that the embedding column is populated (it

##### should be a long array of numbers).

### Phase 3 — Agentic Chat (Day 2 – 3)

##### 10. Create lib/ai/patient-context.ts (Section 7.1).

##### 11. Create lib/ai/health-tools.ts with all six tools (Section 4.1).

##### 12. Create app/api/smart-care/chat/route.ts (Section 4.2).

##### 13. Replace ChatbotView stub in smart-care-section.tsx with the useChat implementation (Section

##### 4.3).

##### 14. Test: open the Text tab and send 'what are my medications?' — you should see streaming text

##### and a 'Searching getLatestVitals...' indicator appear.

### Phase 4 — Voice Intelligence (Day 3 – 4)

##### 15. Create app/api/vapi/webhook/route.ts (Section 5.1).

##### 16. Update VoiceAgentView to pass userId in call metadata (Section 5.2).

##### 17. Configure VAPI dashboard: set webhook URL to https://your-domain/api/vapi/webhook and

##### enable the end-of-call-report event.

##### 18. Test: make a test voice call, then check your DB for a new VapiTranscript row with a populated

##### embedding column.

### Phase 5 — Doctor Intelligence (Day 4 – 5)

##### 19. Update /api/doctor/submit-record/route.ts with the three blocks from Section 6.1.

##### 20. Test: submit a doctor note from the doctor portal, then check your DB for a DoctorIntelligence

##### row.

##### 21. Test end-to-end: in the chat tab, ask 'what has my doctor said?' — the getDoctorNotes and

##### getDoctorIntelligence tools should activate and return the correct data.

## 10 Common Errors and Precise Fixes

### Error: 'Invalid input syntax for type vector'

##### This PostgreSQL error means you are passing the embedding array directly instead of a formatted string.

##### The fix is always to convert the array to JSON first.

##### // WRONG — passing raw JavaScript array

##### await prisma.$executeRaw`UPDATE ... SET embedding = ${embedding}::vector`

##### // CORRECT — convert to JSON string first, then cast

##### const vectorString = JSON.stringify(embedding); // '[0.1, 0.2, ...]'

##### await prisma.$executeRaw`UPDATE ... SET embedding = ${vectorString}::vector`

### Error: 'useChat requires API route' / streaming not working

##### Verify two things: the 'api' prop in useChat is exactly '/api/smart-care/chat', and the route returns

##### result.toDataStreamResponse() — not NextResponse.json(). The useChat hook expects the Vercel AI data

##### stream protocol, not plain JSON. Using NextResponse.json() will cause silent failures where the hook

##### never receives message updates.

### Error: Tool execute crashes and agent stops responding

##### When a tool's execute function throws, the agent loop stops silently. Always wrap every execute

##### implementation in try/catch and return an error object instead of throwing. The model can then reason

##### about the failure and still produce a useful response to the user.

##### // Pattern: always catch in execute and return error as data

##### execute: async ({ query }) => {

##### try {

##### const results = await searchMedicalRecords(userId, query);

##### return { success: true, results };

##### } catch (error: any) {

##### // Return the error — don't throw — so the model can handle it gracefully

##### return { success: false, error: error.message };

##### }

##### }

### Error: VAPI webhook not receiving events

##### Check in this order: the Server URL in your VAPI dashboard is publicly accessible (not localhost — use

##### ngrok locally:

- **npx ngrok http 3000** then copy the https URL
- The 'end-of-call-report' server message is enabled in VAPI dashboard assistant settings
- VAPI_WEBHOOK_SECRET in your env exactly matches the secret set in the dashboard

### Error: pgvector search returns empty results

##### If searchMedicalRecords returns no results even after uploading records, check two things: the embedding

##### column is populated (SELECT embedding FROM MedicalRecord LIMIT 1 in Neon — it should be non-

##### null), and the IVFFlat index requires at least 100 rows to activate. For development with fewer rows, the

##### search still works via exact scan — it's just slower. This is not an error, just a performance note.

## 11 What This Unlocks — The Complete Vision

##### After implementing all five phases, here is what TakeCare becomes. It is worth holding this vision in

##### mind while you build so every brick makes sense in context of the building.

### Smart Care Tab — Completed Feature Matrix

##### Feature After Implementation

**Chat — Text tab** (^) Real streaming AI with 6 tools: searches your records, gets vitals, retrieves doctor notes,

##### checks voice call history, searches medical literature online

```
Tool
```

##### transparency

##### Patient sees 'Searching your medical records...' as the agent works — building trust

**Talk — Voice tab** (^) Every call's transcript is summarized, embedded, and searchable. Each call makes the

##### assistant more accurate.

```
Doctor's Advice
```

##### tab

```
Clinical notes are embedded the moment a doctor submits them and instantly available to
```

##### the AI assistant

**Per-user context** (^) Every patient has a unique AI identity: their vitals, diagnosis, medications, doctor

##### intelligence, and conversation history

**RAG retrieval** (^) The AI never hallucinates patient data — it retrieves from the database with semantic search

##### before every answer

```
VAPI
```

##### intelligence

```
Voice consultations feed a growing pool of semantically searchable health context per
```

##### patient

```
Doctor
```

##### intelligence

```
A synthesized snapshot merges all doctor notes so the AI can answer 'what is my overall
```

##### treatment plan?' accurately

### The Growth Loop

##### The system becomes more intelligent with every interaction automatically. When a patient uploads a new

##### record it gets embedded. When they have a voice call the transcript is saved and embedded. When a

##### doctor submits a note it synthesizes a new DoctorIntelligence snapshot. Every data point strengthens the

##### per-user context, which means the AI's answers get more accurate and personalized over time — with

##### zero manual configuration.

##### Natural Next Steps After Phase 5

###### Once all five phases are running, the natural extensions are: (1) Conversation summarization — a scheduled job

###### that compresses old chat history into a summary paragraph to keep the context window efficient as

###### conversations grow. (2) Proactive health alerts — a cron job that detects concerning trends in patient data (e.g.

###### rising blood pressure across three consecutive records) and sends push notifications. (3) Real-time VAPI tools

###### — connecting the Vapi assistant directly to the RAG search tools via VAPI's server-side tool-calling feature so

###### Dr. Leo can search records during a live voice call. (4) Streaming structured output — using streamObject() to

##### progressively render a health summary card in the Analyze tab as it generates.

#### TakeCare Health Platform — AI Engineering Blueprint

##### Built on Vercel AI SDK v6 · Next.js 16 · Gemini 2.5 Flash · Neon pgvector

##### April 2026 · Production-ready implementation guide

This is a offline tool, your data stays locally and is not send to any server!

