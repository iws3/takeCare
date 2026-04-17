import { getJson } from "serpapi";
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

    // Initialize SerpApi search
    const apiKey = process.env.SERPAPI_API_KEY || "fb3cd784e9089222a009187a55f866635848bb2909438fa73295c55676ee5256";

    // We add clinical context to the search query if available
    const contextString = medicalContext
      ? `Patient Clinical Context: ${JSON.stringify(medicalContext)}`
      : "";

    // Perform the search using SerpApi (Google Search Engine)
    const searchResponse = await getJson({
      engine: "google",
      q: `${query} medical research`,
      api_key: apiKey,
    });

    const searchResults = searchResponse.organic_results?.slice(0, 5) || [];
    const snippets = searchResults.map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet
    }));

    // 2. Use Gemini to synthesize the search results into a professional report
    const prompt = `
      You are 'TakeCare Health Research AI', a specialist in synthesizing complex medical research into actionable clinical intelligence for patients.
      
      USER RESEARCH GOAL: "${query}"
      PATIENT CLINICAL CONTEXT: ${contextString}
      
      RAW RESEARCH DATA (SerpApi Search Results):
      ${JSON.stringify(snippets, null, 2)}
      
      TASK:
      Synthesize the above research results into a high-end clinical report. 
      The report MUST be structured with the following sections:
      
      ### 🔬 Latest Clinical Insights
      Summarize the most recent and relevant medical findings regarding the user's query based on the search snippets. focus on 2024-2026 data if available.
      
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
      sources: snippets.map(r => ({ title: r.title, url: r.link }))
    });

  } catch (error: any) {
    console.error("Health Research Error:", error);
    return NextResponse.json({ error: "Failed to perform health research" }, { status: 500 });
  }
}
