import nodemailer from "nodemailer";

const sendEmail = async (email, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,    // ✅ Your Gmail address
        pass: process.env.GMAIL_APP_PASS // ✅ App password
      }
    });

    const mailOptions = {
      from: `"Inna Clothing" <${process.env.GMAIL_USER}>`,  // ✅ Use the same Gmail address here
      to: email,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: ", info.response);
    
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
