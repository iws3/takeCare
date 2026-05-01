import { prisma } from '@/lib/prisma';

export async function buildPatientContext(userId: string) {
  try {
    const [personalization, medicalRecords, doctorIntel] = await Promise.all([
      prisma.personalization.findUnique({ where: { userId } }),
      prisma.medicalRecord.count({ where: { userId } }),
      prisma.doctorIntelligence.findUnique({ where: { userId } }),
    ]);

    let profile = '';

    if (personalization) {
      profile += `Health Goals: ${personalization.healthGoals.join(', ')}\n`;
      profile += `Blood Type: ${personalization.bloodType || 'Unknown'}\n`;
      profile += `Allergies: ${personalization.allergies.join(', ') || 'None reported'}\n`;
    }

    if (doctorIntel) {
      profile += `\nLatest Clinical Summary: ${doctorIntel.summary}\n`;
    }

    return {
      profile: profile || 'No personalization data available yet.',
      hasData: !!(personalization || medicalRecords > 0),
      recordCount: medicalRecords,
    };
  } catch (error) {
    console.error('[PatientContext] Error building context:', error);
    return {
      profile: 'Error loading health profile.',
      hasData: false,
      recordCount: 0,
    };
  }
}
