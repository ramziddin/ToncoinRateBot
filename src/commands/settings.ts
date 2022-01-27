import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"

export default async function settings({
  bot,
  msg,
  query,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
}) {
  if (msg.from) {
    const text = "Настройки"

    const languageButton: InlineKeyboardButton = {
      text: "Язык",
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
      await bot.sendMessage(msg.from.id, text, {
        parse_mode,
        reply_markup,
      })
    }
  }
}
