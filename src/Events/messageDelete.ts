import { MessageEmbed, Message, TextChannel } from 'discord.js';

module.exports = {
  name: 'messageDelete',
  async execute(message: Message) {
    if (message.author.bot) return;

    const messageChannel: any = message.channel;

    const attachFiles: string[] = [];
    for (const attachment of message.attachments.map((attachment) => attachment)) {
      const sendMsg = await (
        message.client.channels.cache.get('904889227085508658') as TextChannel
      )?.send({
        files: [
          {
            attachment: attachment.url,
            name: String(attachment.name),
          },
        ],
      });
      attachFiles.push(...sendMsg.attachments.map((attachment) => attachment.url));
    }

    if (message.guildId === '755774191613247568' || message.guildId === '796606104410783784') {
      (message.client.channels.cache.get('872863093359800330') as TextChannel)
        .send({
          embeds: [
            new MessageEmbed()
              .setTitle('メッセージ削除')
              .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
              .addField('メッセージ', message.content || '*なし*')
              .addField(
                '添付ファイル',
                attachFiles.map((a) => `[URL](${a})`).join(', ') || '*なし*'
              )
              .addField(
                'チャンネル',
                `${messageChannel} (#${messageChannel.name}/${messageChannel.id})`,
                true
              )
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
