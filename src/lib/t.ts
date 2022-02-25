import i18n from "./i18n"
import { Prisma } from "@prisma/client"

export default function t(
  phrase: string,
  locale: Prisma.UserCreateInput["language"]
) {
  return i18n.__({ phrase, locale: locale?.toString() })
}
