import { Request, Response } from "express"
import { Banks } from "../../lib/static/static.index"

const FetchBanks = (req: Request, res: Response) => {
  const q = req.query?.q as string | undefined
  const bankType = req.query?.bankType as string | undefined

  const searchableBankType = !bankType
    ? null
    : !["mobile_money", "bank_account"].includes(bankType)
    ? null
    : bankType.toLowerCase()

  let banks = Banks

  if (q) {
    const keyword = q.toLowerCase()
    banks = banks.filter((data) =>
      JSON.stringify(data).toLowerCase().includes(keyword)
    )
  }
  if (bankType) {
    banks = banks.filter(
      (bank) => bank.bankType.toLowerCase() === searchableBankType
    )
  }
  return res.status(200).json({ message: "", code: "200", data: { banks } })
}
export default FetchBanks
