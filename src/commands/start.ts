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
  const toncoinData = await getCoinData(TONCOIN_ID)

  // Current date formatted as DD-MM-YYYY HH:MM Moscow time
  const date = new Date().toLocaleString("ru", {
    // timeZone: "Europe/Moscow",
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const text = [
    `<b>Курс Toncoin</b>\n$${toncoinData.price.usd} • ₽${toncoinData.price.rub}`,
    `<b>Максимум за 24 часа</b>\n$${toncoinData.high24h.usd} • ₽${toncoinData.high24h.rub}`,
    `<b>Минимум за 24 часа</b>\n$${toncoinData.low24h.usd} • ₽${toncoinData.low24h.rub}`,
    `<b>${updated ? "Обновлено" : "Курс на"}\n</b>${date} (Москва)`,
  ].join("\n\n")

  const updateButton: InlineKeyboardButton = {
    text: "Обновить",
    callback_data: "update",
  }

  const buyToncoinButton: InlineKeyboardButton = {
    text: "Купить Toncoin",
    url: CRYPTO_BOT_REFERRAL_LINK,
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [[updateButton, buyToncoinButton]],
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
    const chart = await createCoinHistoryChart(TONCOIN_ID, Currency.USD, 30)

    await bot.sendPhoto(msg.chat.id, chart, {
      caption: text,
      parse_mode,
      reply_markup,
    })
  }
}
