import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Find the invitation for this email (contactInfo)
    const invitation = await prisma.doctorInvitation.findFirst({
      where: {
        contactInfo: email,
        otp: otp,
        status: "PENDING",
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid OTP or Email" }, { status: 401 });
    }

    if (invitation.otpExpires && new Date(invitation.otpExpires) < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 401 });
    }

    // Mark as accepted (optional, depending on flow. For now, just authenticate)
    await prisma.doctorInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // We can set an HTTP-only cookie to maintain the doctor session, or just return the ID
    // Next.js convention is to use NextAuth or simple JWT. Since this is an external doctor portal, 
    // a basic signed stateless cookie or simply allowing them through based on the invite ID is common, 
    // but the most secure is setting a session cookie.
    
    // For simplicity, we just return the invitation ID, and the frontend will route to /doctor/dashboard/[inviteId]
    // The frontend should store this inviteId in localStorage to ensure the doctor can refresh.
    
    return NextResponse.json({ 
      success: true, 
      inviteId: invitation.id,
      patientId: invitation.userId 
    });

  } catch (error: any) {
    console.error("[Doctor Verify Error]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
