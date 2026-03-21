import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Convert uploaded files to the AI SDK content parts format
    const parts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use type: "file" for PDFs, and "image" for images
        if (file.type.startsWith("image/")) {
          return {
            type: "image" as const,
            image: buffer,
            mimeType: file.type,
          };
        } else {
          return {
            type: "file" as const,
            data: buffer,
            mimeType: file.type,
          };
        }
      })
    );

    const promptText = `
You are a highly capable AI medical data extraction and analysis specialist acting as the knowledge ingestion engine for the 'TakeCare' healthcare RAG system.

Please carefully review the attached medical records (images, scans, or PDFs). Execute the following tasks:

1. **Extract All Raw Text:** Transcribe the medical data verbatim for RAG indexing. Do not omit numerical values, dates, or clinical jargon.
2. **Clinical Summary:** Provide a structured, concise breakdown of the patient's condition, chief complaints, and past medical history.
3. **Key Diagnoses & Lab Results:** Highlight out-of-range lab values, specific diagnoses, and test impressions in a clear list.
4. **Actionable Recommendations:** Summarize the provider's plan, prescribed medications, follow-up instructions, or red flags that require immediate attention.

Output the result in beautiful, clear Markdown formatting. 
`;

    // Initialize content array with the prompt
    const content: any[] = [{ type: "text", text: promptText }, ...parts];

    // Request analysis using Gemini 1.5 Flash from Google AI SDK
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    return NextResponse.json({ analysis: result.text });
  } catch (error) {
    console.error("Error analyzing medical record:", error);
    return NextResponse.json(
      { error: "Failed to analyze medical record. Please ensure you have a valid GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 500 }
    );
  }
}
