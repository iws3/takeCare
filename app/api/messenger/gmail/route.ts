import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { contactInfo, contactName, doctorName, platform } = await req.json();

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    let userPatient = null;
    let inviteId = null;

    // Store in DB
    try {
      const cookieStore = await cookies();
      const clerkId = cookieStore.get("takecare-clerk-id")?.value;
      if (clerkId) {
        userPatient = await prisma.user.findUnique({ where: { clerkId } });
        if (userPatient) {
          const invite = await prisma.doctorInvitation.create({
            data: {
              userId: userPatient.id,
              doctorName: doctorName || contactName || "Unknown Doctor",
              contactInfo: contactInfo || "Unknown Contact",
              platform: platform || "gmail",
              status: "PENDING",
              otp: otp,
              otpExpires: otpExpires
            }
          });
          inviteId = invite.id;
        }
      }
    } catch (dbErr) {
      console.error("Failed to store invitation in DB:", dbErr);
      return NextResponse.json({ error: "Database Error" }, { status: 500 });
    }

    if (userPatient && inviteId) {
      try {
        await sendInvitationEmail(contactInfo, doctorName || contactName, otp, userPatient.name || "A Patient");
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        return NextResponse.json({ error: "Failed to send email. Check Nodemailer config." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Invitation sent to Gmail" });
  } catch (error: any) {
    console.error("[Gmail Route Error]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
