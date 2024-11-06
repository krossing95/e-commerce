import { SystemName } from "../../../lib/static/static.index"
import SignInMailTemplate from "../templates/template.sign-in"
import MailTransporter from "../transport"

const useSignInMailer = async (user: {
  firstname: string
  email: string
  otp: string
}): Promise<boolean> => {
  const transporter = MailTransporter()
  const template = SignInMailTemplate(user.otp)

  try {
    const sendMessage = await transporter.sendMail({
      from: `${SystemName} < ${process.env.ECOM_MAIL_ADDRESS}>`,
      to: `${user.firstname} < ${user.email}>`,
      subject: `[${SystemName}] Two-Factor Authentication`,
      html: template,
    })
    if (sendMessage.accepted.includes(user.email)) return true
    return false
  } catch (error) {
    return false
  }
}
export default useSignInMailer
