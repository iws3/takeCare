import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { inviteId, note } = await req.json();

    if (!inviteId || !note) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Retrieve invitation to ensure it's valid and get the patient ID
    const invitation = await prisma.doctorInvitation.findUnique({
      where: { id: inviteId },
      include: { user: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 401 });
    }

    // Save the record
    const record = await prisma.medicalRecord.create({
      // We are saving it as a text record for now since it's a clinical note
      data: {
        userId: invitation.userId,
        type: "CLINICAL_NOTE",
        url: "N/A", // Not a file
        fileName: `Doctor Note - ${invitation.doctorName}`,
        description: `Note provided directly by ${invitation.doctorName}`,
        extractedText: note,
      }
    });

    // Optionally update invitation status to COMPLETD if it's a one-time use
    // await prisma.doctorInvitation.update({
    //   where: { id: inviteId },
    //   data: { status: "COMPLETED" }
    // });

    return NextResponse.json({ success: true, recordId: record.id });

  } catch (error: any) {
    console.error("[Doctor Submit Record Error]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
