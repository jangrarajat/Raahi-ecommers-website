import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,        // your Gmail
      pass: process.env.EMAIL_PASS         // your App Password
    }
  });

  return transporter.sendMail({
    from: `"Raahi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};
