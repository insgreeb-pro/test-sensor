const dotenv = require("dotenv")
dotenv.config()

const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const SHA256 = require("crypto-js/sha256")
const { sendMessage } = require("./telegram")

const channels = process.env.CHANNELS || ""
const API_SERVER = process.env.API_SERVER || ""

const cachePath = path.join(__dirname, "cache/last.json")
const lastUpdate =
  fs.existsSync(cachePath) && fs.readFileSync(cachePath, "utf-8")

let cacheData = lastUpdate ? JSON.parse(lastUpdate) : {}

if (channels) {
  const results = channels.split(",").map(async (channel) => {
    const [id, key, name] = channel.split(":")
    const url = API_SERVER + `/channels/${id}/feeds/last.json?api_key=${key}`
    return fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const before = cacheData[channel]
        const current = SHA256(JSON.stringify(data)).toString()
        const now = new Date().getTime()
        const created_at = data.timestamp_server
        const timeDelay = Math.abs(created_at - now)
        const threshold = 10 * 60 * 1000
        const inLastHour = timeDelay < 65 * 60 * 1000
        const isOff = timeDelay > threshold

        if (before != current && inLastHour) {
          cacheData[channel] = current
          if (isOff) {
            sendMessage(`Sensor ${name} mati sejak ${data.created_at}`)
          }
          console.log(name, isOff ? "OFF" : "ON ")
        } else {
          console.log(name, isOff ? "OFF" : "ON ", "- Same as before!")
        }
      })
  })

  Promise.all(results)
    .then(() => {
      fs.writeFileSync(cachePath, JSON.stringify(cacheData))
    })
    .catch(console.log)
}
