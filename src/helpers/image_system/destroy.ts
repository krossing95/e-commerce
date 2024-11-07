import { cloudinaryconfig } from "../../configs/cloudinary/config.cloudinary"

const destroyImage = async (photo_id: string) => {
  const uploader = await cloudinaryconfig()
  let photoIdInstance = !photo_id ? "" : photo_id
  photoIdInstance.length > 0
    ? await uploader.uploader
        .destroy(photoIdInstance)
        .catch((err) => console.warn(err))
    : null
  return photoIdInstance
}
export default destroyImage
