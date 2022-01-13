import { Language } from "./user"

type Content = {
  [key in Language]: {}
}

export const content: Content = {
  ENGLISH: {},
  RUSSIAN: {},
}

export const getContent = (lang: Language, key: keyof Content[Language]) =>
  content[lang][key]
