import { Request, Response } from "express"
import JwtDataExtractor from "../../../middlewares/middleware.jwt-data"
import PaymentInformation from "../../../models/model.payment-information"
import { PaymentInformationModel } from "../../../types/models/type.model.payment-information"

const FetchVendorsPaymentInformation = async (req: Request, res: Response) => {
  try {
    // retrieve the request.authorization data
    const tokenData = await JwtDataExtractor(req)
    const tokenDataObjKeys = Object.keys(tokenData)
    if (!tokenDataObjKeys.includes("_id"))
      return res.status(401).json({
        message: "Authorization is required",
        code: "401",
        data: {},
      })
    const tokenDataObject = tokenData as { _id: string }

    const paymentInformation =
      await PaymentInformation.find<PaymentInformationModel>({
        vendorId: tokenDataObject._id,
      })

    return res
      .status(200)
      .json({ message: "", code: "200", data: { paymentInformation } })
  } catch (error) {
    return res.status(500).json({
      message: "Whoops! Something went wrong",
      code: "500",
      data: {},
    })
  }
}
export default FetchVendorsPaymentInformation
