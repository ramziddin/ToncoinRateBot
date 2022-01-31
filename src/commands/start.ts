import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"
import {
  CRYPTO_BOT_REFERRAL_LINK,
  Currency,
  TONCOIN_ID,
} from "../lib/constants"
import createCoinHistoryChart from "../lib/createCoinHistoryChart"
import getCoinData from "../lib/getCoinData"
import { getUser } from "../lib/user"
import { wrapHtmlBold } from "../lib/wrapString"
import t from "../lib/t"

export default async function start({
  bot,
  msg,
  query,
  updated = false,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
  updated?: boolean
}) {
  const user = await getUser(msg.chat.id)

  if (!user) return

  const { price, high24h, low24h } = await getCoinData(TONCOIN_ID)

  // Current date formatted as DD-MM-YYYY HH:MM
  const date = new Date().toLocaleString("ru", {
    timeZone: user.timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const currentRate = [
    wrapHtmlBold(t("currentRate", user.language)),
    `$${price.usd}`,
  ].join("\n")

  const max24h = [
    wrapHtmlBold(t("24hMax", user.language)),
    `$${high24h.usd}`,
  ].join("\n")

  const min24h = [
    wrapHtmlBold(t("24hMin", user.language)),
    `$${low24h.usd}`,
  ].join("\n")

  const rateDate = [
    wrapHtmlBold(
      updated ? t("updatedAt", user.language) : t("rateOn", user.language)
    ),
    `${date} ${user.timezone}`,
  ].join("\n")

  const text = [currentRate, max24h, min24h, rateDate].join("\n\n")

  const updateButton: InlineKeyboardButton = {
    text: t("update", user.language),
    callback_data: "update",
  }

  const buyToncoinButton: InlineKeyboardButton = {
    text: t("buyToncoin", user.language),
    url: CRYPTO_BOT_REFERRAL_LINK,
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [[updateButton, buyToncoinButton]],
  }

  const parse_mode: ParseMode = "HTML"

  if (query) {
    await bot.editMessageCaption(text, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      reply_markup,
      parse_mode,
    })
  } else {
    const chart = await createCoinHistoryChart(TONCOIN_ID, Currency.USD, 30)

    await bot.sendPhoto(msg.chat.id, chart, {
      caption: text,
      parse_mode,
      reply_markup,
    })
  }
}
