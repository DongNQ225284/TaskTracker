import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Cấu hình SMTP (Ví dụ dùng Ethereal để test - Không cần password thật)
  // Nếu muốn gửi Gmail thật, thay host bằng 'smtp.gmail.com' và dùng App Password
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || "demo@ethereal.email",
      pass: process.env.SMTP_PASSWORD || "demo_pass",
    },
  });

  const message = {
    from: `"Task Tracker Bot" <${
      process.env.SMTP_EMAIL || "noreply@tasktracker.com"
    }>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log(`📨 Email sent to ${options.email}: ${info.messageId}`);
  // Log link xem trước nếu dùng Ethereal
  if (nodemailer.getTestMessageUrl(info)) {
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
