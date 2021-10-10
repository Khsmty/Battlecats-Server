import { MessageEmbed, Message } from 'discord.js'

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage: Message, newMessage: Message) {
    if (newMessage.author.bot) return

    if (newMessage.channel.guildId === '755774191613247568') {
      newMessage.client.channels.cache
        .get('872863093359800330')
        .send({
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
        .catch(() => {})
    }
  },
}
