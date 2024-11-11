import sanitizeHtml from "sanitize-html"

export const generatePlainTextFromHtml = (html: string): string => {
  const plainText = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
  return plainText
}
