export const isTrueBodyStructure = (body: any, expected_payload: string[]) => {
  const payload = Object.keys(body)
  if (payload.length !== expected_payload.length) return false
  const sortedPayload = payload.slice().sort()
  const sortedExpectedPayload = expected_payload.slice().sort()
  return sortedPayload.every((item, i) => item === sortedExpectedPayload[i])
}
