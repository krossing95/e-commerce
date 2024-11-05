import nodemailer from "nodemailer"

const MailTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: process.env.ECOM_MAIL_SERVICE,
    host: process.env.ECOM_MAIL_SERVER,
    port: Number(process.env.ECOM_MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.ECOM_MAIL_ADDRESS,
      pass: process.env.ECOM_GMAIL_APP_PASSWORD,
    },
  })
  return transporter
}
export default MailTransporter
