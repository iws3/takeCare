"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type for creating a user
export async function ensureUser(clerkId: string, email: string, name?: string) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: { email, name },
    create: { clerkId, email, name },
  });
}

// Store Personalization
export async function savePersonalization(clerkId: string, data: {
  healthGoals?: string[];
  bloodType?: string;
  allergies?: string[];
  emergencyPhone?: string;
  theme?: string;
}) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  return await prisma.personalization.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: {
      ...data,
    },
  });
}

// Store Medical Record
export async function createMedicalRecord(clerkId: string, data: {
  type: string;
  url: string;
  fileName: string;
  description?: string;
  extractedText?: string;
}) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const record = await prisma.medicalRecord.create({
    data: {
      userId: user.id,
      ...data
    }
  });

  revalidatePath("/dashboard");
  return record;
}

// Fetch user medical history
export async function getMedicalHistory(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      medicalRecords: {
        orderBy: { createdAt: "desc" },
        include: { analysis: true }
      },
      personalization: true
    }
  });

  return user;
}

// Update User Profile
export async function updateProfile(clerkId: string, data: {
  name?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}) {
  return await prisma.user.update({
    where: { clerkId },
    data: { ...data },
  });
}

// Check if user has already personalized
export async function hasPersonalized(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { personalization: true }
  });
  return !!user?.personalization;
}

// Add Analysis result

export async function addAnalysis(recordId: string, analysisData: {
  summary: string;
  severity?: string;
  recommendations?: string[];
  rawJson?: any;
}) {
  return await prisma.analysis.create({
    data: {
      medicalRecordId: recordId,
      ...analysisData
    }
  });
}
