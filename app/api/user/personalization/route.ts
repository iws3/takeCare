import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { healthGoals, bloodType, allergies, emergencyPhone, theme } = await req.json();

    const personalization = await prisma.personalization.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        healthGoals,
        bloodType,
        allergies,
        emergencyPhone,
        theme,
      },
      create: {
        userId: session.user.id,
        healthGoals: healthGoals || [],
        bloodType: bloodType || null,
        allergies: allergies || [],
        emergencyPhone: emergencyPhone || null,
        theme: theme || "system",
      },
    });

    return NextResponse.json(
      { message: "Personalization saved successfully", personalization },
      { status: 200 }
    );
  } catch (error) {
    console.error("Personalization Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
