"use server";

import { getVapiSystemPrompt } from "@/lib/doctor-data";

/**
 * app/actions/vapi.ts
 * Server Action to retrieve the latest clinical context for the Vapi Voice Agent.
 * This can be expanded to create a Vapi Assistant via API if needed.
 */

export async function getVapiConfiguration() {
  try {
    const systemPrompt = getVapiSystemPrompt();
    
    // FAANG Practice: Return a structured configuration object
    // In a real scenario, you might call Vapi API here to create a temporary assistant
    return {
      success: true,
      config: {
        model: "gpt-4-turbo",
        systemPrompt: systemPrompt,
        voice: "adele-african", // Assuming a custom voice or one that matches your description
        temperature: 0.7,
        transcriptionLanguage: "en-US",
        // Additional business logic
        urgency: "MEDIUM",
        doctorName: "Dr. Basil"
      }
    };
  } catch (error: any) {
    console.error("[Vapi Action] Failed to build configuration", error);
    return { success: false, error: "Initialization failed" };
  }
}
