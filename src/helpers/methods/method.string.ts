import { Regex } from "../../lib/static/static.index"

export const cleanText = (string: string) => {
  if (typeof string === "undefined" || string === null) return ""
  return string.trim().replace("<script>", "").replace("</script>", "")
}
export const capitalize = (string: string) => {
  if (typeof string === "undefined" || string === null) return ""
  const array = string.trim().toLowerCase().split(" ")
  const formattedString = array.map(
    (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`
  )
  return cleanText(formattedString.join(" "))
}
export const cleanSCW = (string: string) => {
  const format = capitalize(
    string.replace(Regex.UNEXPECTED_ATTR, "").replace(Regex.WHITESPACES, " ")
  )
  return format
}
export const cleanExcessWhiteSpaces = (string: string) => {
  const format = cleanText(string.replace(Regex.WHITESPACES, " "))
  return format
}
export const polishLongTexts = (string: string) => {
  const format = string.replace(Regex.WHITESPACES, " ")
  return cleanText(format)
}
export const joinTextsWithNoSpaces = (string: string) =>
  cleanText(string).replace(Regex.WHITESPACES, "")
