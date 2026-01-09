import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Direct Host (Zaruri hai)
    port: 465,                // SSL Port (Render par yahi chalta hai)
    secure: true,             // True for 465
    auth: {
      user: process.env.EMAIL_USER, // Screenshot se match kar raha hai ✅
      pass: process.env.EMAIL_PASS  // Screenshot se match kar raha hai ✅
    }
  });

  // Ye console log tumhe Render Logs me dikhayega ki email bhejne ki koshish ho rahi hai
  console.log(`Attempting to send OTP to: ${to} via Port 465`);

  try {
    const info = await transporter.sendMail({
      from: `"Raahi Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw error; // Error wapis bhejo taaki frontend ko pata chale
  }
};