import { SystemName } from "../../../lib/static/static.index"
import PasswordResetMailTemplate from "../templates/template.password-reset"
import MailTransporter from "../transport"

const usePasswordRequestMailer = async (user: {
  firstname: string
  email: string
  link: string
}): Promise<boolean> => {
  const transporter = MailTransporter()
  const template = PasswordResetMailTemplate(user.firstname, user.link)
  try {
    const sendMessage = await transporter.sendMail({
      from: `${SystemName} < ${process.env.ECOM_MAIL_ADDRESS}>`,
      to: `${user.firstname} < ${user.email}>`,
      subject: `[${SystemName}] Password Reset Link`,
      html: template,
    })
    if (sendMessage.accepted.includes(user.email)) return true
    return false
  } catch (error) {
    return false
  }
}
export default usePasswordRequestMailer
