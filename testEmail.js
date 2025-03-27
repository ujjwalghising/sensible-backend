import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables from .env file
dotenv.config();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// Function to send a test email
const sendTestEmail = async () => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "ujjwalghising567@gmail.com", // Replace with your email
    subject: "Test Email from Node.js",
    text: "This is a test email to check if Nodemailer is working.",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Run the function
sendTestEmail();
