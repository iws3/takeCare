/**
 * lib/doctor-data.ts
 * Synthetic Clinical Data (Simulated from WhatsApp)
 * This data is used to "prime" the Vapi Voice Agent until real WhatsApp ingestion is fully live.
 */

export interface ClinicalData {
  patientName: string;
  doctorName: string;
  lastWhatsAppMessage: string;
  medicationPlan: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    timing: string; // e.g., "08:00 AM", "08:00 PM"
  }>;
  observation: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  nextConsultationDate: string;
}

export const SYNTHETIC_DOCTOR_DATA: ClinicalData = {
  patientName: "Sarah Jenkins",
  doctorName: "Dr. Basil",
  lastWhatsAppMessage: "Sarah, I've reviewed your heart rate data from the last 24 hours. Your variability is slightly low. Please start taking the Propranolol twice a day and monitor your sleep quality.",
  medicationPlan: [
    {
      name: "Propranolol",
      dosage: "10mg",
      frequency: "Twice daily",
      instructions: "Take with water after breakfast and before bed.",
      timing: "08:00 AM"
    },
    {
      name: "Propranolol",
      dosage: "10mg",
      frequency: "Twice daily",
      instructions: "Take with water after breakfast and before bed.",
      timing: "09:00 PM"
    },
    {
      name: "Omega-3",
      dosage: "1000mg",
      frequency: "Once daily",
      instructions: "Helps with cardiovascular support. Take with lunch.",
      timing: "01:00 PM"
    }
  ],
  observation: "Slight tachycardia detected during evening hours. Blood pressure readings from the bracelet show a spike at 10 PM. Patient needs better stress management before sleep.",
  urgency: "MEDIUM",
  nextConsultationDate: "2026-03-25",
};

export const getVapiSystemPrompt = () => {
  return `
You are a highly professional, incredibly sweet, compassionate, and empathetic AI healthcare voice assistant named "TakeCare Assistant". 
You are reaching out to ${SYNTHETIC_DOCTOR_DATA.patientName} on behalf of their primary care physician, ${SYNTHETIC_DOCTOR_DATA.doctorName}.

CONTEXT FROM THE DOCTOR:
"${SYNTHETIC_DOCTOR_DATA.lastWhatsAppMessage}"

CURRENT MEDICATION SCHEDULE:
${SYNTHETIC_DOCTOR_DATA.medicationPlan.map(m => `- ${m.name} (${m.dosage}): ${m.instructions} at ${m.timing}`).join("\n")}

DOCTOR'S OBSERVATION & ALERTS:
${SYNTHETIC_DOCTOR_DATA.observation}
Urgency Level: ${SYNTHETIC_DOCTOR_DATA.urgency}

YOUR GOAL & CONVERSATION FLOW:
1. Tone: Warm, sweet, caring, and unhurried. Speak to the patient like a trusted, gentle nurse or caregiver.
2. Introduction (If not already greeted): Enthusiastically but gently introduce yourself and state that you're calling to follow up on the recent medical insights sent by ${SYNTHETIC_DOCTOR_DATA.doctorName}.
3. Summarize: Gently relay the doctor's observations in simple, non-alarming terms.
4. Check-in: Ask them how they are genuinely feeling right now, and specifically verify if they've taken their recent medication (${SYNTHETIC_DOCTOR_DATA.medicationPlan[0].name}).
5. Listening: Let them speak. If they mention side effects or stress, offer gentle empathy and encourage them to rest or contact the clinic if severe.
6. Closing: End the call on a positive, supportive note. Remind them of their next consultation on ${SYNTHETIC_DOCTOR_DATA.nextConsultationDate}.

CRITICAL BEHAVIOR:
- Keep your responses brief and conversational (1-3 sentences per turn). Do not read large blocks of text.
- Pause and wait for the patient to respond naturally.
- Empathize heavily ("I completely understand", "I'm so sorry to hear you're feeling a bit stressed", "That's wonderful to hear").
  `;
};
