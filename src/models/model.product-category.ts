import mongoose from "mongoose"

export const productCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    subcategories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ProductSubcategory",
      default: [],
    },
    categoryImage: {
      type: String,
    },
    categoryImageId: {
      type: String,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", productCategorySchema)

export default ProductCategory
