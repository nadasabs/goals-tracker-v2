const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendTempPasswordEmail(to, tempPassword) {
  const message = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your temporary password",
    text:
      `Your temporary password is: ${tempPassword}\n\n` +
      `Login using this password, then change it immediately.\n`,
  };

  return transporter.sendMail(message);
}

module.exports = { sendTempPasswordEmail };