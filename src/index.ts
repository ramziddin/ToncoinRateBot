import dotenv from "dotenv"
import TelegramBot from "node-telegram-bot-api"
import changeLanguage from "./commands/changeLanguage"
import changeTimezone from "./commands/changeTimezone"
import settings from "./commands/settings"
import start from "./commands/start"
import {
  createUser,
  getUser,
  Language,
  Timezone,
  updateUser,
  User,
} from "./lib/user"

dotenv.config()

const { BOT_TOKEN, NODE_ENV } = process.env

if (!BOT_TOKEN || !NODE_ENV) {
  throw new Error("Missing BOT_TOKEN or NODE_ENV")
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: NODE_ENV === "development",
})

bot.setMyCommands([
  {
    command: "start",
    description: "Current Rate",
  },
  {
    command: "settings",
    description: "Open Settings",
  },
])

bot.on("message", async (msg) => {
  // Check if the message was sent from a user. There's no `msg.from` if the
  // message was received from a channel.
  // https://core.telegram.org/bots/api#message
  if (!msg.from) return

  let user: User | null = null

  try {
    user = await getUser(msg.from.id)
  } catch (error) {
    console.error(error)
  }

  if (!user) {
    // If the user doesn't exist, create user. The new user gets cached, so that
    // the next call to getUser gets the cached data. The user gets created with
    // a default language of ENGLISH.
    await createUser({
      id: msg.from.id,
      created_at: new Date().toISOString(),
      language: "ENGLISH",
      timezone: "Europe/London",
      data: {
        isLanguageSetup: false,
        isTimezoneSetup: false,
      },
    })

    // Let the user choose a language.
    await changeLanguage({ bot, msg, hideBackButton: true })
  } else if (!user.data.isTimezoneSetup) {
    await changeTimezone({ bot, msg, hideBackButton: true })
  } else {
    if (msg.text) {
      if (msg.text === "/start") {
        await start({ bot, msg })
      }

      if (msg.text === "/settings") {
        await settings({ bot, msg })
      }
    }
  }
})

// Listen to callback queries...
bot.on("callback_query", async (query) => {
  const { data, message: msg } = query

  // Check if there's data and message available.
  // https://core.telegram.org/bots/api#callbackquery
  if (data && msg) {
    if (data === "main") {
      await start({ bot, msg, query })
      await bot.answerCallbackQuery(query.id)
    }

    if (data === "update") {
      await start({ bot, msg, query, updated: true })
      await bot.answerCallbackQuery(query.id, {
        text: "Обновлено на текущий курс",
      })
    }

    if (data === "settings") {
      await settings({ bot, msg, query })
      await bot.answerCallbackQuery(query.id)
    }

    if (data === "language") {
      await changeLanguage({ bot, msg, query })
      await bot.answerCallbackQuery(query.id)
    }

    if (data.startsWith("language:")) {
      const language = data.split(":")[1].toUpperCase() as Language
      const user = await getUser(query.from.id)

      if (language && user) {
        await updateUser(query.from.id, {
          language,
          data: { ...user.data, isLanguageSetup: true },
        })

        if (user.data.isTimezoneSetup) {
          await bot.answerCallbackQuery(query.id, { text: "Язык изменён" })
          await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
          await start({ bot, msg })
        } else {
          await changeTimezone({ bot, msg, query, hideBackButton: true })
        }
      }
    }

    if (data.startsWith("timezone:")) {
      const timezone = data.split(":")[1] as Timezone
      const user = await getUser(query.from.id)

      if (timezone && user) {
        await updateUser(query.from.id, {
          timezone,
          data: { ...user.data, isTimezoneSetup: true },
        })

        await bot.answerCallbackQuery(query.id, {
          text: "Временная зона изменена",
        })

        if (query.message)
          await bot.deleteMessage(
            query.message.chat.id,
            query.message.message_id.toString()
          )

        await start({ bot, msg })
      }
    }
  }
})
