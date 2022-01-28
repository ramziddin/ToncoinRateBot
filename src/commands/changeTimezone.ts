import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"
import { getUser, TIMEZONES } from "../lib/user"
import { wrapWithBullets } from "../lib/wrapString"
import t from "./t"

function arrayToChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }

  return chunks
}

export default async function changeTimezone({
  bot,
  msg,
  query,
  hideBackButton = false,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
  hideBackButton?: boolean
}) {
  const user = await getUser(msg.chat.id)

  if (!user) return

  const text = "Выберите свой часовой пояс."

  const buttons = arrayToChunks(
    TIMEZONES.map((tz) => {
      const tzName = tz.replace(/\//g, " / ").replace(/_/g, " ")

      const btnText =
        hideBackButton || user?.timezone !== tz
          ? tzName
          : wrapWithBullets(tzName)

      return {
        text: btnText,
        callback_data: `timezone:${tz}`,
      } as InlineKeyboardButton
    }),
    2
  )

  const backButton: InlineKeyboardButton = {
    text: `← ${t("back", user.language)}`,
    callback_data: "settings",
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [
      ...buttons,
      // If the call is initial (when the user gets created) then don't show
      // the back button.
      [...(hideBackButton ? [] : [backButton])],
    ],
  }

  const parse_mode: ParseMode = "HTML"

  if (query) {
    await bot.editMessageText(text, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      reply_markup,
      parse_mode,
    })
  } else {
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode,
      reply_markup,
    })
  }
}
