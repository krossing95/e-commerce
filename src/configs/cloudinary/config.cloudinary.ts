import cloudinary from "cloudinary"

export const cloudinaryconfig = async () => {
  try {
    const cloudinaryV2 = cloudinary.v2

    cloudinaryV2.config({
      cloud_name: process.env.ECOM_CLOUDINARY_CLOUD,
      api_key: process.env.ECOM_CLOUDINARY_API_KEY,
      api_secret: process.env.ECOM_CLOUDINARY_API_SECRET,
    })

    return cloudinaryV2
  } catch (error) {
    throw new Error("connection failed: @cloudinary")
  }
}
