import dotenv from "dotenv"
import TelegramBot from "node-telegram-bot-api"
import changeLanguage from "./commands/changeLanguage"
import changeTimezone from "./commands/changeTimezone"
import settings from "./commands/settings"
import start from "./commands/start"
import t from "./lib/t"
import { createUser, getUser, Language, Timezone, updateUser } from "./lib/user"
import express from "express"
import bodyParser from "body-parser"

dotenv.config()

const { BOT_TOKEN, NODE_ENV, APP_URL, PORT } = process.env

if (!BOT_TOKEN || !NODE_ENV) {
  throw new Error("Missing BOT_TOKEN or NODE_ENV environment variables")
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: NODE_ENV === "development",
})

if (NODE_ENV === "production" && !APP_URL) {
  throw new Error("Missing APP_URL environment variable")
}

if (NODE_ENV === "production" && !PORT) {
  throw new Error("Missing PORT environment variable")
}

if (NODE_ENV === "production") {
  bot.setWebHook(`${APP_URL}bot${BOT_TOKEN}`)

  const server = express()

  server.use(bodyParser.json())

  server.post("/bot" + BOT_TOKEN, async (req, res) => {
    bot.processUpdate(req.body)
    await res.sendStatus(200)
  })

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

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

  const user = await getUser(msg.from.id)

  if (!user && msg.from) {
    await createUser({
      id: msg.from.id,
    })

    await changeLanguage({ bot, msg, hideBackButton: true })
  } else if (user && !user.language) {
    await changeLanguage({ bot, msg, hideBackButton: true })
  } else if (user && !user.timezone) {
    await changeTimezone({ bot, msg, hideBackButton: true })
  } else {
    if (!msg.text) return

    if (msg.text === "/start") {
      await start({ bot, msg })
    }

    if (msg.text === "/settings") {
      await settings({ bot, msg })
    }
  }
})

// Listen to callback queries...
bot.on("callback_query", async (query) => {
  const { data, message: msg } = query

  // Check if there's data and message available.
  // https://core.telegram.org/bots/api#callbackquery
  if (!data || !msg) return

  if (data === "main") {
    await start({ bot, msg, query })
    await bot.answerCallbackQuery(query.id)
  }

  if (data === "update") {
    const user = await getUser(query.from.id)

    if (!user) return

    await start({ bot, msg, query, updated: true })

    await bot.answerCallbackQuery(query.id, {
      text: t("updatedToCurrentRate", user.language),
    })
  }

  if (data === "settings") {
    await settings({ bot, msg, query })
    await bot.answerCallbackQuery(query.id)
  }

  if (data === "language") {
    await changeLanguage({ bot, msg, query })
    await bot.answerCallbackQuery(query.id)
  } else if (data.startsWith("language:")) {
    const language = data.split(":")[1].toUpperCase() as Language
    const user = await getUser(query.from.id)

    if (!language || !user) return

    await updateUser(query.from.id, {
      language,
    })

    if (user.timezone) {
      await bot.answerCallbackQuery(query.id, {
        text: t("languageChanged", user.language),
      })

      await bot.deleteMessage(msg.chat.id, msg.message_id.toString())

      await start({ bot, msg })
    } else {
      await changeTimezone({ bot, msg, query, hideBackButton: true })
    }
  }

  if (data === "timezone") {
    await changeTimezone({ bot, msg, query })
    await bot.answerCallbackQuery(query.id)
  } else if (data.startsWith("timezone:")) {
    const timezone = data.split(":")[1] as Timezone
    const user = await getUser(query.from.id)

    if (!timezone || !user) return

    await updateUser(query.from.id, {
      timezone,
    })

    await bot.answerCallbackQuery(query.id, {
      text: t("timezoneChanged", user.language),
    })

    if (query.message) {
      await bot.deleteMessage(
        query.message.chat.id,
        query.message.message_id.toString()
      )
    }

    await start({ bot, msg })
  }
})
