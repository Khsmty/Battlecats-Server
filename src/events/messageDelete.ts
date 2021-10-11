import { MessageEmbed, Message } from 'discord.js';

module.exports = {
  name: 'messageDelete',
  async execute(message: Message) {
    if (message.author.bot) return;

    const messageChannel: any = message.channel;
    const logChannel: any = message.client.channels.cache.get('872863093359800330');

    if (message.guildId === '755774191613247568' || message.guildId === '796606104410783784') {
      logChannel.send({
          embeds: [
            new MessageEmbed()
              .setTitle('メッセージ削除')
              .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
              .addField('メッセージ', message.content || '*なし*')
              .addField('添付ファイル', message.attachments.map((a) => `[URL](${a.proxyURL})`).join(', ') || '*なし*')
              .addField('チャンネル', `${messageChannel} (#${messageChannel.name}/${messageChannel.id})`, true)
              .addField(
                'カテゴリ',
                `${messageChannel.parent ? messageChannel.parent.name : '*なし*'} (${
                  messageChannel.parentId || '*なし*'
                })`,
                true
              )
              .setTimestamp()
              .setColor('RED'),
          ],
        })
        .catch(() => {});
    }
  },
};
