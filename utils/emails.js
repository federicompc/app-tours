const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) define the email options
  const mailOptions = {
    from: 'federico test',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //   html:options.html,
  };

  //3) Actually send the emails
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
