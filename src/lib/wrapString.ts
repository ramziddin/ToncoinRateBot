export const wrapString = (text: string, start: string, end: string = start) =>
  `${start}${text}${end}`

export const wrapWithBullets = (text: string) => wrapString(text, "• ", " •")

export const wrapHtmlBold = (text: string) => wrapString(text, "<b>", "</b>")
