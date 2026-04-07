import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendInvitationEmail = async (email: string, doctorName: string, otp: string, patientName: string) => {
  const mailOptions = {
    from: `"TakeCare AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Urgent: Request for Medical Records - ${patientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; font-size: 24px; margin-bottom: 20px;">TakeCare AI Invitation</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          Dear Dr. <strong>${doctorName}</strong>,
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          A patient, <strong>${patientName}</strong>, has requested your expert medical evaluation on their clinical profile.
        </p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Your One-Time Access Code</p>
          <h1 style="margin: 10px 0; font-size: 42px; color: #111827; letter-spacing: 0.1em; font-weight: bold;">${otp}</h1>
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">(Expires in 1 hour)</p>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          Please use this code to sign in and securely provide medical records or notes for this patient.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/doctor/verify" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Access Patient Profile</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          This is a direct, secure clinical invitation via TakeCare AI. If you did not expect this, please ignore this email.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
