import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"
import { getUser } from "../lib/user"
import { wrapWithBullets } from "../lib/wrapString"
import t from "../lib/t"

export default async function changeLanguage({
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

  const text = t("chooseYourLanguage", user.language)

  const engBtnTxt =
    hideBackButton || user?.language !== "ENGLISH"
      ? "English"
      : wrapWithBullets("English")

  const engBtn: InlineKeyboardButton = {
    text: engBtnTxt,
    callback_data: "language:ENGLISH",
  }

  const rusBtnTxt =
    hideBackButton || user?.language !== "RUSSIAN"
      ? "Русский"
      : wrapWithBullets("Русский")

  const rusBtn: InlineKeyboardButton = {
    text: rusBtnTxt,
    callback_data: "language:RUSSIAN",
  }

  const backButton: InlineKeyboardButton = {
    text: `← ${t("back", user.language)}`,
    callback_data: "settings",
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [engBtn, rusBtn],
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
