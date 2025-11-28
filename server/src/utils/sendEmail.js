import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Sử dụng 'service: gmail' để Nodemailer tự động cấu hình
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL, // Đảm bảo biến này đúng trên Render
      pass: process.env.SMTP_PASSWORD, // Đảm bảo là App Password 16 ký tự
    },
  });

  const message = {
    from: `"Task Tracker Bot" <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`📨 Email sent to ${options.email}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Send Email Error:", error);
    // Ném lỗi ra để Controller bắt được
    throw new Error(error.message);
  }
};

export default sendEmail;
