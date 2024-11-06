import { currentTimestamp } from "./method.date"

export const checkMfaEligibility = (
  hasMfa: boolean,
  mfaDisabledAt?: number
) => {
  const timestamp = currentTimestamp()
  if (!hasMfa) return { useMfa: false }

  if (!process.env.ECOM_MFA_DISABILITY_TIME) return { useMfa: true }
  if (mfaDisabledAt) {
    if (
      timestamp - mfaDisabledAt <
      Number(process.env.ECOM_MFA_DISABILITY_TIME)
    )
      return { useMfa: false }
  }

  return { useMfa: true }
}
