// utils/mailer.js
import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AXIS_EMAIL,
    pass: process.env.AXIS_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html, attachments }) => {
  return transporter.sendMail({
    from: `Axis Tech Supplies <${process.env.AXIS_EMAIL}>`,
    to,
    subject,
    html,
    attachments,
  });
};

export default { transporter, sendMail };
