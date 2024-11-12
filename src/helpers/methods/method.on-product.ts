import { ProductModel } from "../../types/models/type.model.product"

export const isPublishableProduct = (product: ProductModel) => {
  let publish = true

  if (
    !product.quantity ||
    !product.featuredImage ||
    !product.description ||
    !product.price ||
    !product.region ||
    !product.district
  ) {
    publish = false
  }

  return publish
}

export const discountCalculation = ({
  price,
  discount,
}: {
  price: number | null
  discount: number | null
}) => {
  const discountedPrice = !price
    ? null
    : !discount
    ? null
    : Number(Number(price - price * (discount / 100)).toFixed(2))

  return discountedPrice
}
