const nodemailer = require("nodemailer");

const ejs = require("ejs");
const path = require("path");
const config = require("./config");
const logger = require("./logger");

const sendMail = async ({ email, subject, template, data }) => {

  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT),
    service: config.SMTP_SERVICE,
    secureConnection: true, // use SSL
    auth: {
      user: config.SMTP_EMAIL,
      pass: config.SMTP_PASSWORD,
    },
  });
  
  const html = path.join(__dirname, "../mails", template);
  
  // logger.info('templatePath',templatePath);
  
  // const html = await ejs.renderFile(templatePath, data);
  // logger.info('html',html);

  const mailOptions = {
    from: config.SMTP_EMAIL,
    to: email,
    subject,
    html:template,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (!error) {
      logger.info(`Email sent successfully`);
    } else {
      logger.error("Error while sending email");
    }
  });
};

module.exports = sendMail;