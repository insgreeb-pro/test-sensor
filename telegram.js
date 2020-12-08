const TelegramBot = require("node-telegram-bot-api")

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT

const MyBot = new TelegramBot(TELEGRAM_TOKEN)

const sendMessage = (msg) => {
  MyBot.sendMessage(TELEGRAM_CHAT, msg)
}

module.exports = {
  MyBot,
  sendMessage,
}
