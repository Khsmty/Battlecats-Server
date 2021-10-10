import { Client, Collection, MessageEmbed, TextChannel, Role } from 'discord.js'
import { config } from 'dotenv'
import { createConnection } from 'mysql'
import cron from 'node-cron'
import http from 'http'
import events from '../events.json'
import 'fs'

// dotenv
config()

// Webサーバーの作成
http
  .createServer((req, res) => {
    res.end('It works!')
  })
  .listen(process.env.PORT || 8080)

const client: Client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES'],
})

// MySQLサーバーへ接続
client.db = createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  charset: 'utf8mb4',
})
client.db.connect()

cron.schedule('0,15 * * * *', async () => {
  for (const event of events) {
    const timeLag = Date.now() - Date.parse(event.date)

    if (timeLag >= -60000 && timeLag <= 600000) {
      const mentionRole = client.guilds.cache
        .get('755774191613247568')
        .roles.cache.filter((role: Role): role is Required<Role> => role.name.includes(event.role))
        .first().id

      client.channels.cache
        .get('805732155606171658')
        .send(`<@&${mentionRole}> ${event.name}`)
    }
  }

  const threadOpenCategory = client.channels.cache
    .get('756959797806366851')
    .children.filter(
      (channel: TextChannel) =>
        !['757612691517997147', '757612691517997147'].includes(channel.id),
    )
    .map((channel: TextChannel) => channel)
  for (const channel of threadOpenCategory) {
    let lastMessage = await channel.messages.fetch({ limit: 1 })
    lastMessage = lastMessage.first()

    if (lastMessage.createdTimestamp + 226800000 < Date.now()) {
      await channel.setParent('759465634236727316')

      channel.send({
        embed: [
          new MessageEmbed()
            .setTitle('Close済み')
            .setDescription(
              '3日以上メッセージがなかったため、自動Closeしました。\nこのスレッドを引き続き使用したい場合は、`/reopen` コマンドでスレッドをReopenしてください。',
            )
            .setColor('RED'),
        ],
      })
    }
  }
})

client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

client.messageCommands = new Collection()
const messageCommandFiles = fs
  .readdirSync('./messageCommands')
  .filter((file) => file.endsWith('.js'))

for (const file of messageCommandFiles) {
  const command = require(`./messageCommands/${file}`)
  client.messageCommands.set(command.name, command)
}

const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.DISCORD_TOKEN)
