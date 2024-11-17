import express from "express"
import VendorMiddleware from "../middlewares/middleware.vendor"
import CreatePaymentInformation from "../controllers/vendors/payment-informations/vendors.payment-information.create"
import FetchVendorsPaymentInformation from "../controllers/vendors/payment-informations/vendors.payment-information.fetch"

const vendorRoutes = express.Router()

vendorRoutes.post(
  "/payment-information/create",
  VendorMiddleware,
  CreatePaymentInformation
)
vendorRoutes.get(
  "/payment-information",
  VendorMiddleware,
  FetchVendorsPaymentInformation
)

export default vendorRoutes
