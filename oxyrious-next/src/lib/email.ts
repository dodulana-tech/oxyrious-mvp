import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface Attachment {
  filename: string;
  content: Buffer;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[],
): Promise<{ id: string; status: "SENT" | "FAILED" }> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "Oxyrious <notifications@oxyrious.com>",
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    return { id: info.messageId, status: "SENT" };
  } catch (err) {
    console.error("Email send error:", err);
    return { id: "", status: "FAILED" };
  }
}
