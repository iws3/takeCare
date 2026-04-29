import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const inviteId = formData.get("inviteId") as string;
    const note = formData.get("note") as string;
    const files = formData.getAll("files") as File[];

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

    // Save the clinical note record
    const noteRecord = await prisma.medicalRecord.create({
      data: {
        userId: invitation.userId,
        type: "CLINICAL_NOTE",
        url: "N/A", 
        fileName: `Doctor Note - ${invitation.doctorName}`,
        description: `Note provided directly by ${invitation.doctorName}`,
        extractedText: note,
      }
    });

    // Handle additional file uploads if any
    const fileRecords = [];
    for (const file of files) {
      // In a production app, you would upload these to S3/Cloudinary here
      // For this demo, we'll simulate the storage and save the metadata
      const record = await prisma.medicalRecord.create({
        data: {
          userId: invitation.userId,
          type: "CLINICAL_ASSESSMENT",
          url: "SIMULATED_UPLOAD_URL", // Placeholder for actual storage URL
          fileName: file.name,
          description: `Supplementary evidence uploaded by ${invitation.doctorName}`,
          extractedText: `Uploaded clinical file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        }
      });
      fileRecords.push(record);
    }

    return NextResponse.json({ 
      success: true, 
      recordId: noteRecord.id,
      filesUploaded: fileRecords.length 
    });

  } catch (error: any) {
    console.error("[Doctor Submit Record Error]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
