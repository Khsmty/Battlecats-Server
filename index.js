require('dotenv').config()

const { Client, Collection } = require('discord.js')
const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES'],
})
const events = require('./events.json')
const cron = require('node-cron')
const fs = require('fs')

cron.schedule('0,15 * * * *', () => {
  for (const event of events) {
    const timeLag = Date.now() - Date.parse(event.date)

    if (timeLag >= -60000 && timeLag <= 600000) {
      const mentionRole = client.guilds.cache
        .get('755774191613247568')
        .roles.cache.filter((role) => role.name.includes(event.role))
        .first().id

      client.channels.cache
        .get('805732155606171658')
        .send(`<@&${mentionRole}> ${event.name}`)
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
