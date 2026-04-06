import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { contactInfo, contactName, doctorName, platform } = await req.json();

    // Store in DB
    try {
      const cookieStore = await cookies();
      const clerkId = cookieStore.get("takecare-clerk-id")?.value;
      if (clerkId) {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (user) {
          await prisma.doctorInvitation.create({
            data: {
              userId: user.id,
              doctorName: doctorName || contactName || "Unknown Doctor",
              contactInfo: contactInfo || "Unknown Contact",
              platform: platform || "gmail",
              status: "PENDING"
            }
          });
        }
      }
    } catch (dbErr) {
      console.error("Failed to store invitation in DB:", dbErr);
    }

    // Dummy success for now, in reality you'd integrate with Nodemailer/SendGrid etc
    return NextResponse.json({ success: true, message: "Invitation sent to Gmail" });
  } catch (error: any) {
    console.error("[Gmail Route Error]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
