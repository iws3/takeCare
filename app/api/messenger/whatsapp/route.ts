import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { whatsappNumber, contactName, doctorName } = await req.json();

    // --- FAANG-Level Validation & Normalization ---
    if (!whatsappNumber || !doctorName) {
      return NextResponse.json({ error: "Missing required fields: whatsappNumber or doctorName" }, { status: 400 });
    }

    // Standardize to E.164 format (remove everything except digits)
    const digitsOnly = whatsappNumber.replace(/\D/g, "");
    
    // Most WhatsApp APIs expect the number WITHOUT the leading "+" for the parameter, 
    // but WITH the country code. We'll ensure it's at least 10 digits.
    if (digitsOnly.length < 10) {
      return NextResponse.json({ error: "Invalid phone number format. Please include country code." }, { status: 400 });
    }

    const apiKey = process.env.SANDESH_API_KEY;
    const campaignName = process.env.SANDESH_CAMPAIGN_NAME;

    if (!apiKey || !campaignName) {
      return NextResponse.json({ 
        error: "Server configuration missing: SANDESH_API_KEY or SANDESH_CAMPAIGN_NAME not set in .env.local" 
      }, { status: 500 });
    }

    // Sandesh AI API endpoint
    const url = "https://api.sandeshai.com/whatsapp/campaign/api/";

    // FAANG Practice: Log the outbound intent (masking PI)
    console.log(`[WhatsApp] Sending invitation to: ${digitsOnly.slice(0, 4)}...${digitsOnly.slice(-2)} using campaign: ${campaignName}`);

    // Template variables: 1 -> Doctor Name, 2 -> Patient Name, 3 -> Interaction Purpose
    const payload = {
      apiKey: apiKey,
      campaignName: campaignName,
      whatsappNumber: digitsOnly,
      contactName: contactName || doctorName,
      templateVariables: [doctorName, "Sarah Jenkins", "Health Consultation"],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle Sandesh AI's specific error responses
    // They often return 200 but with success: false in some cases, so we check both
    if (!response.ok || data.success === false) {
      console.error("[WhatsApp API Error]", data);
      return NextResponse.json({ 
        error: data.msg || data.message || "Failed to deliver message via WhatsApp gateway.", 
        details: data 
      }, { status: response.status === 200 ? 422 : response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[WhatsApp Route Panic]", error);
    return NextResponse.json({ error: "Internal Gateway Error", message: error.message }, { status: 500 });
  }
}
