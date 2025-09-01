import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.ADMIN_EMAIL, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({ from: process.env.ADMIN_EMAIL, to, subject, text });
};
