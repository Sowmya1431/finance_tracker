const nodemailer = require("nodemailer");
require("dotenv").config();

const mail = process.env.MAIL;
const pass = process.env.PASSWORD;

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mail,
    pass: pass,
  },
});

async function sendMail(to, subject, text) {
  try {
    const mailoptions = {
      from: mail,
      to: to,
      subject: subject,
      text: text,
    };
    const result = await transport.sendMail(mailoptions);
    console.log("mail sent:", result.response);
    return true;
  } catch (err) {
    console.log("error occurs in send mail:", err.message);
    return false;
  }
}

module.exports = sendMail;


