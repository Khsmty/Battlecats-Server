require('dotenv').config()

const { Client, Intents, MessageEmbed } = require('discord.js'),
  client = new Client({
    intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_MESSAGES,
  }),
  serp = require('serp'),
  events = require('./events.json'),
  json_save = require('json-pretty'),
  fs = require('fs'),
  cron = require('node-cron'),
  mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const eventSchema = require('./eventSchema')

cron.schedule('* * * * *', async () => {
  for (const event of events) {
    if (Date.parse(event.date) < Date.now()) {
      let notification = true

      const eventData = await eventSchema.findOne(
        {
          id: event.id,
        },
        (e, eve) => {
          if (!eve)
            eventSchema.create({
              id: event.id,
              done: [event.date],
            })
          else if (eve.done.includes(event.date)) notification = false
        }
      )

      if (notification) {
        const mentionRole = client.guilds.cache
          .get('755774191613247568')
          .roles.cache.filter((role) => role.name === event.role)
          .first().id

        client.channels.cache
          .get('765570472577466368')
          .send(`<@&${mentionRole}> ${event.name} (${event.date})`)

        if (eventData) {
          eventData.done.push(event.date)
          await eventData.save()
        }
      }
    }
  }
})

client.once('ready', () => {
  console.log(`${client.user.tag} でログインしました。`)
})

const commands = {
  async db(interaction) {
    try {
      var options = {
        host: 'google.co.jp',
        qs: {
          q:
            interaction.options.get('word').value +
            '+site:https://battlecats-db.com/',
          filter: 0,
          pws: 0,
        },
        num: 3,
      }
      const links = await serp.search(options)

      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`「${interaction.options.get('word').value}」の検索結果`)
            .setDescription(
              `[${links[0].title}](https://www.google.co.jp${links[0].url})\n\n[${links[1].title}](https://www.google.co.jp${links[1].url})\n\n[${links[2].title}](https://www.google.co.jp${links[2].url})`
            ),
        ],
      })
    } catch (error) {
      await interaction.reply({
        content: `「**${
          interaction.options.get('word').value
        }**」が見つかりませんでした。\n誤字/脱字等がないか確認の上、再度お試しください。`,
        ephemeral: true,
      })
    }
    return
  },

  async progress(interaction) {
    const img = async (user) => {
      try {
        let n = await client.channels.cache
          .get('822771682157658122')
          .messages.fetch({ limit: 100 })
          .then((a) =>
            a
              .filter((a) => a.author.id === user && a.attachments.first())
              .first()
              .attachments.map((a) => a.url)
          )
        return n
      } catch {
        return null
      }
    }
    const res = await img(interaction.options.get('user').value)

    if (res) {
      return await interaction.reply({
        files: res,
      })
    } else {
      return await interaction.reply({
        content:
          'メッセージが取得できませんでした。\nDiscord標準の検索機能を利用してください。',
        ephemeral: true,
      })
    }
  },
}

async function onInteraction(interaction) {
  if (!interaction.isCommand()) return
  return commands[interaction.commandName](interaction)
}

client.on('interactionCreate', (interaction) => onInteraction(interaction))

client.login(process.env.DISCORD_TOKEN)
