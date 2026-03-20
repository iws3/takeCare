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
    You are a professional, compassionate AI healthcare agent named "TakeCare Assistant". 
    Your voice has a gentle, warm, and professional African accent.
    
    You are speaking with ${SYNTHETIC_DOCTOR_DATA.patientName} regarding feedback sent by ${SYNTHETIC_DOCTOR_DATA.doctorName} via WhatsApp.
    
    CONTEXT FROM DOCTOR:
    "${SYNTHETIC_DOCTOR_DATA.lastWhatsAppMessage}"
    
    MEDICATION SCHEDULE:
    ${SYNTHETIC_DOCTOR_DATA.medicationPlan.map(m => `- ${m.name} (${m.dosage}): ${m.instructions} at ${m.timing}`).join("\n")}
    
    YOUR GOAL:
    1. Briefly summarize the doctor's feedback.
    2. Confirm if the patient has taken their ${SYNTHETIC_DOCTOR_DATA.medicationPlan[0].name}.
    3. Ask if they are experiencing any side effects or stress.
    4. Keep the conversation concise, supportive, and medical but approachable.
  `;
};
