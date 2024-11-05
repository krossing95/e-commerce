import { GenderEnum, UsertypeEnum } from "../../lib/enum/enum.index"

export type UserModel = {
  _id: string
  firstname: string
  lastname?: string
  username?: string
  email: string
  phone?: string
  usertype: UsertypeEnum
  gender: GenderEnum
  address?: string
  password?: string
  photoUrl?: string
  photoId?: string
  isVerified: boolean
  isDeleted: boolean
  isSocial: boolean
  mfaActivated: boolean
  mfaDisabledAt?: number
  createdAt: string
  updatedAt: string
}
