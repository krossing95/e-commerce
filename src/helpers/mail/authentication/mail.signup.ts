import { SystemName } from "../../../lib/static/static.index"
import SignUpMailTemplate from "../templates/template.sign-up"
import MailTransporter from "../transport"

const useSignUpMailer = async (user: {
  id: string
  code: string
  email: string
  firstname: string | null
}): Promise<boolean> => {
  const transporter = MailTransporter()
  const name = !user.firstname ? "Valued Customer" : user.firstname.trim()
  const link = `${process.env.ECOM_CLIENT_URL}auth/register/verify?user_id=${user.id}&code=${user.code}`
  const template = SignUpMailTemplate(name, link)
  try {
    const sendMessage = await transporter.sendMail({
      from: `${SystemName} < ${process.env.ECOM_MAIL_ADDRESS}>`,
      to: `${name} < ${user.email}>`,
      subject: `[${SystemName}] User Verification`,
      html: template,
    })
    if (sendMessage.accepted.includes(user.email)) return true
    return false
  } catch (error) {
    console.log(error)

    return false
  }
}
export default useSignUpMailer
