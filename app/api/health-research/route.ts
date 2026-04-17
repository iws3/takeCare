import { tavily } from "@tavily/core";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, medicalContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Initialize Tavily client
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "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" });

    // 1. Perform a context-aware search using Tavily
    // We add clinical context to the search query if available
    const contextString = medicalContext 
      ? `Patient Context: ${JSON.stringify(medicalContext)}` 
      : "";
    
    const searchResponse = await tvly.search(query, {
      searchDepth: "advanced",
      includeAnswer: true,
      maxResults: 5,
    });

    // 2. Use Gemini to synthesize the search results into a professional report
    const prompt = `
      You are 'TakeCare Health Research AI', a specialist in synthesizing complex medical research into actionable clinical intelligence for patients.
      
      USER RESEARCH GOAL: "${query}"
      PATIENT CLINICAL CONTEXT: ${contextString}
      
      RAW RESEARCH DATA (Tavily Results):
      ${JSON.stringify(searchResponse.results, null, 2)}
      
      INITIAL SEARCH SUMMARY:
      ${searchResponse.answer || "No direct answer found."}
      
      TASK:
      Synthesize the above research into a high-end clinical report. 
      The report MUST be structured with the following sections:
      
      ### 🔬 Latest Clinical Insights
      Summarize the most recent and relevant medical findings regarding the user's query. focus on 2024-2026 data if available.
      
      ### 🧬 Personalized Correlation
      Analyze how these findings relate specifically to the patient's context (medications, vitals, or diagnoses). Point out potential benefits or risks.
      
      ### 📋 Recommended Discussion Points
      List 3-4 specific questions or topics the user should bring up with their healthcare provider based on this research.
      
      ### ⚠️ Medical Disclaimer
      State clearly that this is AI-synthesized research for educational purposes and not medical advice.
      
      STYLE GUIDELINES:
      - Use professional yet accessible language.
      - Use Markdown for bolding key terms.
      - Keep it concise but information-dense.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    return NextResponse.json({ 
      report: text,
      sources: searchResponse.results.map(r => ({ title: r.title, url: r.url }))
    });

  } catch (error: any) {
    console.error("Health Research Error:", error);
    return NextResponse.json({ error: "Failed to perform health research" }, { status: 500 });
  }
}
