require('dotenv').config()

const {
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
} = require('discord.js')
const client = new Client({
  intents:
    Intents.FLAGS.GUILDS |
    Intents.FLAGS.GUILD_MESSAGES |
    Intents.FLAGS.MEMBERS |
    Intents.FLAGS.GUILD_VOICE_STATES,
})
const { DiscordTogether } = require('discord-together')
const serp = require('serp')
const events = require('./events.json')
const cron = require('node-cron')
const { inspect } = require('util')

cron.schedule('0,15 * * * *', () => {
  client.channels.cache
    .get('871749703132381185')
    .send('定期実行を開始しました。')

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

  client.channels.cache
    .get('871749703132381185')
    .send('定期実行が完了しました。')
})

client
  .once('ready', () => {
    console.log(`${client.user.tag} でログインしました。`)
  })
  .on('messageCreate', async (message) => {
    if (message.content.startsWith('n.')) {
      const args = message.content.slice(2).trim().split(/ +/)
      const command = args.shift().toLowerCase()

      if (command === 'eval') {
        if (message.author.id !== '723052392911863858') return

        try {
          // eslint-disable-next-line no-eval
          const evaled = await eval(args.join(' '))
          message.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('出力')
                .setDescription(`\`\`\`js\n${inspect(evaled)}\n\`\`\``)
                .setColor('BLURPLE'),
            ],
          })
        } catch (e) {
          message.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('エラー')
                .setDescription(`\`\`\`js\n${e}\n\`\`\``)
                .setColor('RED'),
            ],
          })
        }
      }
    }
  })

const commands = {
  async db(interaction) {
    try {
      const options = {
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
              `[${links[0].title}](https://www.google.co.jp${links[0].url})\n\n[${links[1].title}](https://www.google.co.jp${links[1].url})\n\n[${links[2].title}](https://www.google.co.jp${links[2].url})`,
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
  },

  async progress(interaction) {
    const img = async (user) => {
      try {
        const n = await client.channels.cache
          .get('822771682157658122')
          .messages.fetch({ limit: 100 })
          .then((a) =>
            a
              .filter((a) => a.author.id === user && a.attachments.first())
              .first()
              .attachments.map((a) => a.url),
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

  async watch(interaction) {
    const member = client.guilds.cache
      .get(interaction.guild.id)
      .members.cache.get(interaction.member.id)

    if (!member.voice.channelId)
      return interaction.reply({
        content: '先にボイスチャンネルに参加してください。',
        ephemeral: true,
      })

    new DiscordTogether(client)
      .createTogetherCode(member.voice.channelId, 'youtube')
      .then(async (invite) => {
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('YouTube')
              .setDescription('⚠️ モバイルアプリには対応していません。')
              .setColor('YELLOW'),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel('クリックして視聴開始')
                .setStyle('LINK')
                .setURL(invite.code),
            ),
          ],
        })
      })
  },
}

const menus = {
  async rp_ch(interaction) {
    await interaction.reply({
      content: 'ロールを更新しました。',
      ephemeral: true,
    })

    await interaction.member.roles.remove([
      '757465906786861166',
      '757465944636260463',
      '757465986340225134',
      '868827768203382814',
    ])

    if (interaction.values.includes('rp_ch_1'))
      await interaction.member.roles.add('757465906786861166')
    if (interaction.values.includes('rp_ch_2'))
      await interaction.member.roles.add('757465944636260463')
    if (interaction.values.includes('rp_ch_3'))
      await interaction.member.roles.add('757465986340225134')
    if (interaction.values.includes('rp_ch_4'))
      await interaction.member.roles.add('868827768203382814')
  },
  async rp_pr(interaction) {
    await interaction.reply({
      content: 'ロールを更新しました。',
      ephemeral: true,
    })

    await interaction.member.roles.remove([
      '785121194063036417',
      '785123537849155664',
      '797383308437749771',
      '785120614435651624',
    ])

    if (interaction.values.includes('rp_pr_1'))
      await interaction.member.roles.add('785121194063036417')
    else if (interaction.values.includes('rp_pr_2'))
      await interaction.member.roles.add('785123537849155664')
    else if (interaction.values.includes('rp_pr_3'))
      await interaction.member.roles.add('797383308437749771')
    else await interaction.member.roles.add('785120614435651624')
  },
  async rp_role(interaction) {
    await interaction.reply({
      content: 'ロールを更新しました。',
      ephemeral: true,
    })

    await interaction.member.roles.remove([
      '757466064702537748',
      '856005613368246325',
      '818062825024520243',
      '871597096598396940',
    ])

    if (interaction.values.includes('clear')) return

    if (interaction.values.includes('rp_role_1'))
      await interaction.member.roles.add('757466064702537748')
    if (interaction.values.includes('rp_role_2'))
      await interaction.member.roles.add('856005613368246325')
    if (interaction.values.includes('rp_role_3'))
      await interaction.member.roles.add('818062825024520243')
    if (interaction.values.includes('rp_role_4'))
      await interaction.member.roles.add('871597096598396940')
  },
  async rp_noti(interaction) {
    await interaction.reply({
      content: 'ロールを更新しました。',
      ephemeral: true,
    })

    await interaction.member.roles.remove([
      '871410296705658930',
      '871410800575787041',
      '871410888429674536',
      '871411418459684875',
      '871411529482907679',
      '871411632365006918',
      '876131805827301457',
      '876132058936774676',
      '876132175613935656',
      '871411756017279096',
      '871411821985267732',
      '871411874497961994',
      '871411924460531742',
    ])

    if (interaction.values.includes('clear')) return

    if (interaction.values.includes('rp_noti_1'))
      await interaction.member.roles.add('871410296705658930')
    if (interaction.values.includes('rp_noti_2'))
      await interaction.member.roles.add('871410800575787041')
    if (interaction.values.includes('rp_noti_3'))
      await interaction.member.roles.add('871410888429674536')
    if (interaction.values.includes('rp_noti_4'))
      await interaction.member.roles.add('871411418459684875')
    if (interaction.values.includes('rp_noti_5'))
      await interaction.member.roles.add('871411529482907679')
    if (interaction.values.includes('rp_noti_6'))
      await interaction.member.roles.add('871411632365006918')
    if (interaction.values.includes('rp_noti_7'))
      await interaction.member.roles.add('876131805827301457')
    if (interaction.values.includes('rp_noti_8'))
      await interaction.member.roles.add('876132058936774676')
    if (interaction.values.includes('rp_noti_9'))
      await interaction.member.roles.add('876132175613935656')
    if (interaction.values.includes('rp_noti_10'))
      await interaction.member.roles.add('871411756017279096')
    if (interaction.values.includes('rp_noti_11'))
      await interaction.member.roles.add('871411821985267732')
    if (interaction.values.includes('rp_noti_12'))
      await interaction.member.roles.add('871411874497961994')
    if (interaction.values.includes('rp_noti_13'))
      await interaction.member.roles.add('871411924460531742')
  },
}

async function onInteraction(interaction) {
  if (interaction.isCommand())
    return commands[interaction.commandName](interaction)
  else if (interaction.isSelectMenu())
    return menus[interaction.customId](interaction)
}

client
  .on('interactionCreate', (interaction) => onInteraction(interaction))
  .on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.author.bot) return

    if (newMessage.channel.guildId === '755774191613247568') {
      client.channels.cache.get('872863093359800330').send({
        embeds: [
          new MessageEmbed()
            .setTitle('メッセージ編集')
            .setAuthor(
              newMessage.author.tag,
              newMessage.author.displayAvatarURL({ dynamic: true }),
            )
            .setDescription(`メッセージに移動: [こちら](${newMessage.url})`)
            .addField('編集前', oldMessage.content || '*なし*')
            .addField('編集後', newMessage.content || '*なし*')
            .addField(
              '添付ファイル',
              newMessage.attachments
                .map((a) => `[URL](${a.proxyURL})`)
                .join(', ') || '*なし*',
            )
            .addField(
              'チャンネル',
              `${newMessage.channel} (#${newMessage.channel.name}/${newMessage.channel.id})`,
              true,
            )
            .addField(
              'カテゴリ',
              `${
                newMessage.channel.parent
                  ? newMessage.channel.parent.name
                  : '*なし*'
              } (${newMessage.channel.parentId || '*なし*'})`,
              true,
            )
            .setTimestamp()
            .setColor('BLURPLE'),
        ],
      })
    }
  })
  .on('messageDelete', (message) => {
    if (message.author.bot) return

    if (message.channel.guildId === '755774191613247568') {
      client.channels.cache.get('872863093359800330').send({
        embeds: [
          new MessageEmbed()
            .setTitle('メッセージ削除')
            .setAuthor(
              message.author.tag,
              message.author.displayAvatarURL({ dynamic: true }),
            )
            .addField('メッセージ', message.content || '*なし*')
            .addField(
              '添付ファイル',
              message.attachments
                .map((a) => `[URL](${a.proxyURL})`)
                .join(', ') || '*なし*',
            )
            .addField(
              'チャンネル',
              `${message.channel} (#${message.channel.name}/${message.channel.id})`,
              true,
            )
            .addField(
              'カテゴリ',
              `${
                message.channel.parent ? message.channel.parent.name : '*なし*'
              } (${message.channel.parentId || '*なし*'})`,
              true,
            )
            .setTimestamp()
            .setColor('RED'),
        ],
      })
    }
  })

client.login(process.env.DISCORD_TOKEN)
