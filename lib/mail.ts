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
    subject: `Medical Consultation Request - ${patientName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 32px;">
          <h2 style="color: #2563eb; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin: 0;">TakeCare</h2>
          <p style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; tracking: 0.1em; margin-top: 4px;">Professional Medical Portal</p>
        </div>

        <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Dear Dr. <strong>${doctorName}</strong>,
        </p>

        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          You have been invited to review the clinical profile and medical history of <strong>${patientName}</strong>. 
          Please visit your specialized <strong>Doctor Dashboard</strong> to provide your expert assessment and medical guidance.
        </p>

        <div style="background-color: #f8fafc; padding: 32px; border-radius: 20px; text-align: center; margin-bottom: 32px; border: 1px solid #f1f5f9;">
          <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Your Secure Access Code</p>
          <h1 style="margin: 0; font-size: 48px; color: #0f172a; letter-spacing: 0.2em; font-weight: 900;">${otp}</h1>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 500;">Valid for 60 minutes</p>
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/doctor/verify" 
             style="background-color: #2563eb; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 15px; display: inline-block;">
            Access Doctor Dashboard
          </a>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 40px;">
          This secure access allows you to directly upload clinical reports, provide diagnostic notes, and synchronize your findings with the patient's digital health record.
        </p>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 32px;">
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; text-align: center; margin: 0;">
            CONFIDENTIALITY NOTICE: This clinical invitation is intended only for Dr. ${doctorName}. 
            If you are not the intended recipient, please notify the sender and delete this message.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
