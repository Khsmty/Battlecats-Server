require('dotenv').config()

const {
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  MessageSelectMenu,
} = require('discord.js')
const client = new Client({
  intents:
    Intents.FLAGS.GUILDS |
    Intents.FLAGS.GUILD_MESSAGES |
    Intents.FLAGS.GUILD_MEMBERS |
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
    .send('定期実行を完了しました。')
})

client
  .once('ready', () => console.log(`${client.user.tag} でログインしました。`))
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
                .setDescription(
                  `\`\`\`js\n${
                    inspect(evaled).length >= 6000 ? inspect(evaled) : ''
                  }\n\`\`\``,
                )
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
  .on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case 'db': {
          const search = await serp.search({
            host: 'google.co.jp',
            qs: {
              q: `${interaction.options.getString(
                'word',
              )}+site:battlecats-db.com`,
            },
            num: 5,
          })

          await interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(
                  `“${interaction.options.getString('word')}” の検索結果`,
                )
                .setDescription(
                  search[0]
                    ? search
                        .map(
                          (item) =>
                            `[${item.title}](https://www.google.co.jp${item.url})`,
                        )
                        .join('\n\n')
                    : '*検索結果がありませんでした*',
                )
                .setColor('YELLOW'),
            ],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel('他の検索結果')
                  .setStyle('LINK')
                  .setURL(
                    `https://www.google.co.jp/search?q=${interaction.options.getString(
                      'word',
                    )}+site:battlecats-db.com`,
                  ),
              ),
            ],
          })
          break
        }
        case 'progress': {
          const img = async (user) => {
            try {
              const n = await client.channels.cache
                .get('822771682157658122')
                .messages.fetch({ limit: 100 })
                .then((a) =>
                  a
                    .filter(
                      (a) => a.author.id === user && a.attachments.first(),
                    )
                    .first()
                    .attachments.map((a) => a.url),
                )
              return n
            } catch {
              return null
            }
          }
          const res = await img(interaction.options.getUser('user').id)

          if (res) {
            await interaction.reply({
              files: res,
            })
          } else {
            await interaction.reply(
              'メッセージが取得できませんでした。\nDiscord標準の検索機能を利用してください。',
            )
          }
          break
        }
        case 'watch': {
          if (!interaction.member.voice.channelId)
            return interaction.reply('先にボイスチャンネルに参加してください。')

          new DiscordTogether(client)
            .createTogetherCode(interaction.member.voice.channelId, 'youtube')
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
        }
      }
    } else if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'chrole': {
          interaction.reply({
            content:
              '表示/非表示にするチャンネルを選択してください。(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('chrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: 'ネタバレを非表示',
                      value: '757465906786861166',
                      emoji: '❌',
                      default:
                        interaction.member.roles.cache.has(
                          '757465906786861166',
                        ),
                    },
                    {
                      label: '宣伝を非表示',
                      value: '757465944636260463',
                      emoji: '❌',
                      default:
                        interaction.member.roles.cache.has(
                          '757465944636260463',
                        ),
                    },
                    {
                      label: 'にゃんこ以外の雑談を非表示',
                      value: '757465986340225134',
                      emoji: '❌',
                      default:
                        interaction.member.roles.cache.has(
                          '757465986340225134',
                        ),
                    },
                    {
                      label: 'スマブラチャンネルを表示',
                      value: '868827768203382814',
                      emoji: '⭕',
                      default:
                        interaction.member.roles.cache.has(
                          '868827768203382814',
                        ),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ]),
              ),
            ],
          })
          break
        }
        case 'pgrole': {
          interaction.reply({
            content: '現在の進行状況を選択してください。',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('pgrole')
                  .setMinValues(1)
                  .setMaxValues(1)
                  .addOptions([
                    {
                      label: '未来編3章・大脱走を未クリア',
                      value: '785121194063036417',
                      emoji: '1️⃣',
                      default:
                        interaction.member.roles.cache.has(
                          '785121194063036417',
                        ),
                    },
                    {
                      label: '未来編3章・大脱走をクリア済み',
                      value: '785123537849155664',
                      emoji: '2️⃣',
                      default:
                        interaction.member.roles.cache.has(
                          '785123537849155664',
                        ),
                    },
                    {
                      label: '宇宙編3章・古代の呪いをクリア済み',
                      value: '797383308437749771',
                      emoji: '3️⃣',
                      default:
                        interaction.member.roles.cache.has(
                          '797383308437749771',
                        ),
                    },
                    {
                      label: '魔界編・大厄災のはじまりをクリア済み',
                      value: '785120614435651624',
                      emoji: '4️⃣',
                      default:
                        interaction.member.roles.cache.has(
                          '785120614435651624',
                        ),
                    },
                    {
                      label: 'アプデ待ち勢',
                      value: '884397503829671958',
                      emoji: '5️⃣',
                      default:
                        interaction.member.roles.cache.has(
                          '884397503829671958',
                        ),
                    },
                  ]),
              ),
            ],
          })
          break
        }
        case 'rlrole': {
          interaction.reply({
            content: 'ロールを選択してください。(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('rlrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: 'にゃんこ関係について教えたい人',
                      value: '757466064702537748',
                      emoji: '🧑‍🏫',
                      default:
                        interaction.member.roles.cache.has(
                          '757466064702537748',
                        ),
                    },
                    {
                      label: '画像・動画リクエストOK',
                      value: '856005613368246325',
                      emoji: '🖼️',
                      default:
                        interaction.member.roles.cache.has(
                          '856005613368246325',
                        ),
                    },
                    {
                      label: 'メンションNG',
                      value: '818062825024520243',
                      emoji: '❌',
                      default:
                        interaction.member.roles.cache.has(
                          '818062825024520243',
                        ),
                    },
                    {
                      label: '音楽Bot操作',
                      value: '871597096598396940',
                      emoji: '🎵',
                      default:
                        interaction.member.roles.cache.has(
                          '871597096598396940',
                        ),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ]),
              ),
            ],
          })
          break
        }
        case 'eventrole': {
          interaction.reply({
            content:
              '開始時に通知を受け取るイベントを選択してください。(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('eventrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: '逆襲のカバちゃん',
                      value: '871410296705658930',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871410296705658930',
                        ),
                    },
                    {
                      label: '極ゲリラ経験値にゃ！',
                      value: '871410800575787041',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871410800575787041',
                        ),
                    },
                    {
                      label: '超極ゲリラ経験値にゃ！',
                      value: '871410888429674536',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871410888429674536',
                        ),
                    },
                    {
                      label: 'トレジャーフェスティバル(日本編)',
                      value: '871411418459684875',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411418459684875',
                        ),
                    },
                    {
                      label: 'トレジャーフェスティバル(未来編)',
                      value: '871411529482907679',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411529482907679',
                        ),
                    },
                    {
                      label: 'トレジャーフェスティバル(宇宙編)',
                      value: '871411632365006918',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411632365006918',
                        ),
                    },
                    {
                      label: '悪魔ネコステージ',
                      value: '876131805827301457',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '876131805827301457',
                        ),
                    },
                    {
                      label: '悪魔タンクネコステージ',
                      value: '876132058936774676',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '876132058936774676',
                        ),
                    },
                    {
                      label: '開眼のネコフラワー',
                      value: '876132175613935656',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '876132175613935656',
                        ),
                    },
                    {
                      label: '悪魔バトルネコ (イベント1)',
                      value: '871411756017279096',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411756017279096',
                        ),
                    },
                    {
                      label: '女王の研究報告1 (イベント2)',
                      value: '871411821985267732',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411821985267732',
                        ),
                    },
                    {
                      label: '女王の研究報告2 (イベント3)',
                      value: '871411874497961994',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411874497961994',
                        ),
                    },
                    {
                      label: '未設定 (イベント4)',
                      value: '871411924460531742',
                      emoji: '🔔',
                      default:
                        interaction.member.roles.cache.has(
                          '871411924460531742',
                        ),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ]),
              ),
            ],
          })
          break
        }
      }
    } else if (interaction.isSelectMenu()) {
      switch (interaction.customId) {
        case 'chrole': {
          const chRoles = [
            '757465906786861166',
            '757465944636260463',
            '757465986340225134',
            '868827768203382814',
          ]

          const userRoles = interaction.member.roles.cache
            .map((role) => role.id)
            .filter((f) => chRoles.includes(f))

          if (interaction.values.includes('clear'))
            await interaction.member.roles.remove(userRoles)
          else if (userRoles.length < interaction.values.length)
            interaction.member.roles.add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1),
            )
          else
            interaction.member.roles.remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1),
            )

          await interaction.update({
            content: '変更を保存しました。',
            components: [],
          })
          break
        }
        case 'pgrole': {
          const pgRoles = [
            '785121194063036417',
            '785123537849155664',
            '797383308437749771',
            '785120614435651624',
            '884397503829671958',
          ]

          await interaction.member.roles.remove(
            pgRoles.filter((i) => interaction.values.indexOf(i) === -1),
          )
          await interaction.member.roles.add(interaction.values[0])

          await interaction.update({
            content: '変更を保存しました。',
            components: [],
          })
          break
        }
        case 'rlrole': {
          const customRoles = [
            '757466064702537748',
            '856005613368246325',
            '818062825024520243',
            '871597096598396940',
          ]

          const userRoles = interaction.member.roles.cache
            .map((role) => role.id)
            .filter((f) => customRoles.includes(f))

          if (interaction.values.includes('clear'))
            await interaction.member.roles.remove(userRoles)
          else if (userRoles.length < interaction.values.length)
            interaction.member.roles.add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1),
            )
          else
            interaction.member.roles.remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1),
            )

          await interaction.update({
            content: '変更を保存しました。',
            components: [],
          })
          break
        }
        case 'eventrole': {
          const eventRoles = [
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
          ]

          const userRoles = interaction.member.roles.cache
            .map((role) => role.id)
            .filter((f) => eventRoles.includes(f))

          if (interaction.values.includes('clear'))
            await interaction.member.roles.remove(userRoles)
          else if (userRoles.length < interaction.values.length)
            interaction.member.roles.add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1),
            )
          else
            interaction.member.roles.remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1),
            )

          await interaction.update({
            content: '変更を保存しました。',
            components: [],
          })
          break
        }
      }
    }
  })
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
