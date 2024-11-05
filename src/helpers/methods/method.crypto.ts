import sodium from "libsodium-wrappers"

export const encrypt = async (data: string) => {
  try {
    const KEY = process.env.ECOM_SODIUM_KEY
    const NONCE = process.env.ECOM_SODIUM_NONCE
    if (!NONCE || !KEY) return null
    await sodium.ready
    // Access key and nonce from environment variables
    const key = sodium.from_hex(KEY)
    const nonce = sodium.from_hex(NONCE)

    // Encrypt the data
    const cipherText = sodium.crypto_secretbox_easy(data, nonce, key)

    return sodium.to_hex(cipherText)
  } catch (error) {
    return null
  }
}
export const decrypt = async (encryptedData: string) => {
  try {
    const KEY = process.env.ECOM_SODIUM_KEY
    const NONCE = process.env.ECOM_SODIUM_NONCE
    if (!NONCE || !KEY) return null
    await sodium.ready
    // Access key and nonce from environment variables
    const key = sodium.from_hex(KEY)
    const nonce = sodium.from_hex(NONCE)
    // Decrypt the data
    const ciphertext = sodium.from_hex(encryptedData) // Convert from hex
    const decryptedData = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      key
    )

    return sodium.to_string(decryptedData)
  } catch (error) {
    return null
  }
}
