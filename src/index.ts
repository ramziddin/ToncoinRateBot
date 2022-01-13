import axios from "axios"
import dotenv from "dotenv"
import TelegramBot, {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  ParseMode,
} from "node-telegram-bot-api"
import compose from "./lib/compose"
import { createUser, getUser, Language, updateUser, User } from "./lib/user"
import { wrapWithBullets } from "./lib/wrapString"

dotenv.config()

const TONCOIN_ID = "the-open-network"
const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/coins/${TONCOIN_ID}`
const CRYPTO_BOT_REFERRAL_LINK = "t.me/CryptoBot?start=r-53279-market"

interface CoinData {
  price: {
    usd: number
    rub: number
  }

  high24h: {
    usd: number
    rub: number
  }

  low24h: {
    usd: number
    rub: number
  }
}

const coinDataCache = new Map<string, CoinData>()

async function getCoinData(coinId: string) {
  const cache = coinDataCache.get(coinId)

  if (cache) {
    return cache
  } else {
    const response = await axios.get(COINGECKO_API_URL)

    const {
      data: {
        market_data: { current_price, high_24h, low_24h },
      },
    } = response

    const data = {
      price: {
        usd: current_price.usd,
        rub: current_price.rub,
      },
      high24h: {
        usd: high_24h.usd,
        rub: high_24h.rub,
      },
      low24h: {
        usd: low_24h.usd,
        rub: low_24h.rub,
      },
    }

    coinDataCache.set(coinId, data)
    setTimeout(() => coinDataCache.delete(coinId), 1000 * 60 * 0.03)

    return data
  }
}

const { BOT_TOKEN, NODE_ENV } = process.env

if (!BOT_TOKEN || !NODE_ENV) {
  throw new Error("Missing BOT_TOKEN or NODE_ENV")
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: NODE_ENV === "development",
})

async function start({
  bot,
  msg,
  query,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
}) {
  const toncoinData = await getCoinData(TONCOIN_ID)

  const text = [
    `<b>Курс Toncoin</b>\n$${toncoinData.price.usd} • ₽${toncoinData.price.rub}`,
    `<b>Максимум за 24 часа</b>\n$${toncoinData.high24h.usd} • ₽${toncoinData.high24h.rub}`,
    `<b>Минимум за 24 часа</b>\n$${toncoinData.low24h.usd} • ₽${toncoinData.low24h.rub}`,
    // "@ToncoinRateBot",
  ].join("\n\n")

  const updateButton: InlineKeyboardButton = {
    text: "Обновить",
    callback_data: "update",
  }

  const settingsButton: InlineKeyboardButton = {
    text: "Настройки",
    callback_data: "settings",
  }

  const buyToncoinButton: InlineKeyboardButton = {
    text: "Купить Toncoin",
    url: CRYPTO_BOT_REFERRAL_LINK,
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [[updateButton, settingsButton], [buyToncoinButton]],
  }

  const parse_mode: ParseMode = "HTML"

  if (query) {
    bot.editMessageText(text, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      reply_markup,
      parse_mode,
    })
  } else {
    bot.sendMessage(msg.chat.id, text, {
      parse_mode,
      reply_markup,
    })
  }
}

async function changeLanguage({
  bot,
  msg,
  query,
  initialCall = false,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
  initialCall?: boolean
}) {
  if (msg.from) {
    const user = await getUser(msg.from.id)

    console.log(user)

    const text = "Choose language • Выберите язык"

    const engButton: InlineKeyboardButton = {
      text:
        initialCall || user?.language !== "ENGLISH"
          ? "English"
          : wrapWithBullets("English"),
      callback_data: "language:english",
    }

    const rusButton: InlineKeyboardButton = {
      text:
        initialCall || user?.language !== "RUSSIAN"
          ? "Русский"
          : wrapWithBullets("Русский"),
      callback_data: "language:russian",
    }

    const backButton: InlineKeyboardButton = {
      text: "← Назад",
      callback_data: "settings",
    }

    const reply_markup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [engButton, rusButton],
        [...(initialCall ? [] : [backButton])],
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
      await bot.sendMessage(msg.from.id, text, {
        parse_mode,
        reply_markup,
      })
    }
  }
}

async function settings({
  bot,
  msg,
  query,
}: {
  bot: TelegramBot
  msg: TelegramBot.Message
  query?: TelegramBot.CallbackQuery
}) {
  if (msg.from) {
    const user = await getUser(msg.from.id)

    const text = "Настройки"

    const languageButton: InlineKeyboardButton = {
      text: "Язык",
      callback_data: "language",
    }

    const backButton: InlineKeyboardButton = {
      text: "← Назад",
      callback_data: "main",
    }

    const reply_markup: InlineKeyboardMarkup = {
      inline_keyboard: [[languageButton], [backButton]],
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

bot.on("message", async (msg) => {
  if (!msg.from) return

  let user: User | null = null

  try {
    user = await getUser(msg.from.id)
  } catch (error) {
    console.error(error)
  }

  if (!user) {
    // If the user doesn't exist, create user with default values
    await createUser({
      id: msg.from.id,
      created_at: new Date().toISOString(),
      language: "ENGLISH",
    })

    // Then let user choose language
    await changeLanguage({ bot, msg, initialCall: true })
  } else {
    if (msg.text) {
      if (msg.text === "/start") {
        await start({ bot, msg })
      }
    }
  }
})

bot.on("callback_query", async (query) => {
  const { data, message: msg } = query

  if (data && msg) {
    if (data === "main") {
      await start({ bot, msg, query })
    } else if (data === "settings") {
      await settings({ bot, msg, query })
    } else if (data === "language") {
      await changeLanguage({ bot, msg, query })
    }
    if (data.startsWith("language:")) {
      const language = data.split(":")[1].toUpperCase() as Language

      if (language) {
        await updateUser(query.from.id, { language })
        bot.answerCallbackQuery(query.id, { text: "Язык изменён" })
        await start({ bot, msg, query })
      }
    }
  }
})
