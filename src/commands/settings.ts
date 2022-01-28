import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"
import { getUser } from "../lib/user"
import t from "./t"

export default async function settings({
  bot,
  msg,
  query,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
}) {
  const user = await getUser(msg.chat.id)

  if (!user) return

  const text = t("settings", user.language)

  const languageButton: InlineKeyboardButton = {
    text: t("language", user.language),
    callback_data: "language",
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [[languageButton]],
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
