"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function syncSession(clerkId: string) {
  const cookieStore = await cookies();
  cookieStore.set("takecare-clerk-id", clerkId, { path: "/" });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { personalization: true }
  });

  const isPersonalized = !!(user && user.personalization);
  if (isPersonalized) {
    const cookieStore2 = await cookies();
    cookieStore2.set("takecare-personalized", "true", { path: "/" });
  } else {
    const cookieStore3 = await cookies();
    cookieStore3.delete("takecare-personalized");
  }
  return { personalized: isPersonalized };
}

export async function initSession() {
  const guestClerkId = `guest-${Math.random().toString(36).substring(2, 11)}`;
  const cookieStore = await cookies();
  cookieStore.set("takecare-clerk-id", guestClerkId, { path: "/" });
  return { clerkId: guestClerkId };
}

export async function loginAnonymous() {
  const { clerkId } = await initSession();
  const cookieStore = await cookies();
  cookieStore.set("takecare-personalized", "true", { path: "/" }); 
  return { clerkId };
}

// Type for creating a user
export async function ensureUser(clerkId: string, email: string, name?: string) {
  // 1. Try to find user by email first (this is our primary identity)
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    // We found the user by email. Update their clerkId to match the current session.
    // This effectively "logs them in" or "merges" their current session with their permanent account.
    user = await prisma.user.update({
      where: { id: user.id },
      data: { 
        clerkId, 
        name: name || user.name 
      },
    });
  } else {
    // 2. No user with this email. Check if a user with this clerkId exists.
    user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (user) {
       // Update guest user with their new email/name
       user = await prisma.user.update({
         where: { id: user.id },
         data: { email, name: name || user.name }
       });
    } else {
       // 3. Create fresh user
       user = await prisma.user.create({
         data: { clerkId, email, name },
       });
    }
  }

  const personalized = user.clerkId ? await hasPersonalized(user.clerkId) : false;
  const cookieStore = await cookies();
  if (user.clerkId) {
    cookieStore.set("takecare-clerk-id", user.clerkId, { path: "/" });
  }
  if (personalized) {
    cookieStore.set("takecare-personalized", "true", { path: "/" });
  }

  return user;
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

  const result = await prisma.personalization.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: {
      ...data,
    },
  });

  // Update cookie after personalization
  const cookieStore = await cookies();
  cookieStore.set("takecare-personalized", "true", { path: "/" });

  return result;
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
  const res = await prisma.user.update({
    where: { clerkId },
    data: { ...data },
  });
  revalidatePath("/dashboard");
  return res;
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

export async function restoreSessionByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { personalization: true }
  });

  if (user) {
    const cookieStore = await cookies();
    if (user.clerkId) {
      cookieStore.set("takecare-clerk-id", user.clerkId, { path: "/" });
    }
    if (user.personalization) {
      const cookieStore2 = await cookies();
      cookieStore2.set("takecare-personalized", "true", { path: "/" });
    }
    return { success: true, clerkId: user.clerkId };
  }

  return { success: false };
}
export async function deleteUser(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  await prisma.user.delete({
    where: { id: user.id }
  });

  revalidatePath("/");
  return { success: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("takecare-clerk-id");
  cookieStore.delete("takecare-personalized");
}
