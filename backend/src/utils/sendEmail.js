import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text, // Plain text fallback
      ...(html && { html }) // HTML version if provided
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Email sending failed");
  }
};

// Convenience function for sending HTML emails
export const sendHtmlEmail = async (to, subject, html) => {
  // Extract plain text from HTML for fallback
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return sendEmail(to, subject, text, html);
};
