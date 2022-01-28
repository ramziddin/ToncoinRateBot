import { Language } from "../lib/user"
import i18n from "../lib/i18n"

export default function t(phrase: string, locale: Language) {
  return i18n.__({ phrase, locale })
}
