export type SaleModel = {
  _id: string
  vendorId: string
  customerId: string
  products: string[]
  totalCost: number
  isWithdrawn: boolean
  isEdited: boolean
  isDeleted: boolean
}
