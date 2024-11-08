import mongoose from "mongoose"

export const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
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
const ProductSubcategory =
  mongoose.models.ProductSubcategory ||
  mongoose.model("ProductSubcategory", subcategorySchema)
export default ProductSubcategory
