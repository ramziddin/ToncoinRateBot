import { Language } from "./user"
import i18n from "./i18n"

export default function t(phrase: string, locale: Language) {
  return i18n.__({ phrase, locale })
}
