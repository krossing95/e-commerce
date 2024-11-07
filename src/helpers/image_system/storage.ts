import { cloudinaryconfig } from "../../configs/cloudinary/config.cloudinary"

type ImageStorageProps = {
  lastId: string | null
  photo_data: string
  folder: string
}

export type ImageStorageResponse = {
  photo_id: string | undefined
  secure_url: string | undefined
}

const imageStorage = async ({
  lastId,
  photo_data,
  folder,
}: ImageStorageProps): Promise<ImageStorageResponse> => {
  const uploader = await cloudinaryconfig()
  let photoIdInstance = !lastId ? "" : lastId
  let photo_id: string | undefined
  let secure_url: string | undefined
  photoIdInstance.length > 0
    ? await uploader.uploader
        .destroy(photoIdInstance)
        .catch((err) => console.warn(err))
    : null
  await uploader.uploader.upload(
    photo_data,
    { folder: `${folder}` },
    (err, done) => {
      photo_id = done?.public_id
      secure_url = done?.secure_url
    }
  )
  return { photo_id, secure_url }
}
export default imageStorage
