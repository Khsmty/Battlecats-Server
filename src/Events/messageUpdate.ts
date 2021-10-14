import { MessageEmbed, Message, TextChannel } from 'discord.js';

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage: Message, newMessage: Message) {
    if (newMessage.author.bot) return;

    const messageChannel: any = newMessage.channel;

    if (
      newMessage.guildId === '755774191613247568' ||
      newMessage.guildId === '796606104410783784'
    ) {
      (
        newMessage.client.channels.cache.get(
          '872863093359800330'
        ) as TextChannel
      )
        ?.send({
          embeds: [
            new MessageEmbed()
              .setTitle('メッセージ編集')
              .setAuthor(
                newMessage.author.tag,
                newMessage.author.displayAvatarURL({ dynamic: true })
              )
              .setDescription(`メッセージに移動: [こちら](${newMessage.url})`)
              .addField('編集前', oldMessage.content || '*なし*')
              .addField('編集後', newMessage.content || '*なし*')
              .addField(
                '添付ファイル',
                newMessage.attachments
                  .map((a) => `[URL](${a.proxyURL})`)
                  .join(', ') || '*なし*'
              )
              .addField(
                'チャンネル',
                `${messageChannel} (#${messageChannel.name}/${messageChannel.id})`,
                true
              )
              .addField(
                'カテゴリ',
                `${
                  messageChannel.parent ? messageChannel.parent.name : '*なし*'
                } (${messageChannel.parentId || '*なし*'})`,
                true
              )
              .setTimestamp()
              .setColor('BLURPLE'),
          ],
        })
        .catch(() => {});
    }
  },
};
