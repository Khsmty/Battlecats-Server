const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { inspect } = require('util')

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return

    if (message.channelId === '757612691517997147') {
      const msg = await message.reply({
        embeds: [
          new MessageEmbed()
            .setDescription(
              `「${message.content}」でスレッドを作成します。\nよろしいですか？`,
            )
            .setFooter('30秒経過すると自動キャンセルされます。')
            .setColor('YELLOW'),
        ],
        components: [
          new MessageActionRow().addComponents([
            new MessageButton()
              .setLabel('OK')
              .setEmoji('✅')
              .setStyle('SUCCESS')
              .setCustomId('thread-create-ok'),
            new MessageButton()
              .setLabel('キャンセル')
              .setStyle('DANGER')
              .setCustomId('thread-create-cancel'),
          ]),
        ],
      })

      const ifilter = (i) => i.user.id === message.author.id
      const collector = msg.createMessageComponentCollector({
        filter: ifilter,
        time: 30000,
      })

      collector.on('collect', async (i) => {
        if (i.customId === 'thread-create-ok') {
          const createThread = await message.guild.channels.create(
            message.content,
            {
              topic: `${message.author} のスレッド`,
              parent: message.channel.parent,
            },
          )

          const threadMsg = await createThread.send({
            embeds: [
              new MessageEmbed()
                .setTitle('操作方法')
                .setDescription(
                  '`/close`: スレッドをCloseします。\n`/delete`: 解決済みのスレッドを削除します。\n`/reopen`: スレッドを再度Openします。\n\n※スレッドの最終メッセージから3日が経過すると、自動でCloseされます。',
                )
                .setColor('BLURPLE'),
              new MessageEmbed()
                .setAuthor(
                  message.author.tag,
                  message.author.displayAvatarURL({ dynamic: true }),
                )
                .setTitle(message.content)
                .setColor('YELLOW')
                .setTimestamp(),
            ],
          })
          threadMsg.pin()

          i.update({
            embeds: [
              new MessageEmbed()
                .setDescription('スレッドを作成しました。')
                .setColor('GREEN'),
            ],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel('スレッドへジャンプ')
                  .setStyle('LINK')
                  .setURL(
                    `https://discord.com/channels/${message.guildId}/${createThread.id}`,
                  ),
              ),
            ],
          })
        } else if (i.customId === 'thread-create-cancel') {
          i.update({
            embeds: [
              new MessageEmbed()
                .setDescription('スレッドの作成をキャンセルしました。')
                .setColor('RED'),
            ],
            components: [],
          })
        }
      })

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          msg.edit({
            embeds: [
              new MessageEmbed()
                .setDescription('スレッドの作成を自動キャンセルしました。')
                .setColor('RED'),
            ],
            components: [],
          })
        }
      })
    }

    if (message.content.startsWith('n.')) {
      const args = message.content.slice(2).trim().split(/ +/)
      const command = args.shift().toLowerCase()

      if (command === 'eval') {
        if (message.author.id !== '723052392911863858') return

        try {
          // eslint-disable-next-line no-eval
          const evaled = await eval(args.join(' '))
          message
            .reply({
              embeds: [
                new MessageEmbed()
                  .setTitle('出力')
                  .setDescription(`\`\`\`js\n${inspect(evaled)}\n\`\`\``)
                  .setColor('BLURPLE'),
              ],
            })
            .catch((e) => {
              console.log(inspect(evaled))
              message.reply('コンソールへ出力しました。')
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
  },
}
