import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  // Host define karna zaroori hai
    port: 465,               // Render ke liye ye port best hai
    secure: true,            // Port 465 ke liye true, baaki ke liye false
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter.sendMail({
    from: `"Raahi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};