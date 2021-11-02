import { MessageEmbed, Message, TextChannel } from 'discord.js';
import UpdateBoard from '../Components/Board';
import config from '../config.json';
import { diffChars } from 'diff';

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage: Message, newMessage: Message) {
    if (newMessage.channelId === config.upChannel) {
      if (
        newMessage.author.id === '761562078095867916' &&
        newMessage.embeds[0].fields[0].name.includes('をアップしたよ!')
      ) {
        UpdateBoard(newMessage);
      }
    }

    if (newMessage.author.bot) return;

    const messageChannel: any = newMessage.channel;

    const diff = diffChars(oldMessage.content, newMessage.content);

    let text: string = '';
    for (const part of diff) {
      const type = part.added ? '+' : part.removed ? '-' : null;

      if (!type) {
        text += part.value;
      } else {
        text += '[' + type + ' ' + part.value + ' ]';
      }
    }

    const attachFiles: string[] = [];
    for (const attachment of newMessage.attachments.map((attachment) => attachment)) {
      const sendMsg = await (
        newMessage.client.channels.cache.get('904889227085508658') as TextChannel
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

    if (
      newMessage.guildId === '755774191613247568' ||
      newMessage.guildId === '796606104410783784'
    ) {
      (newMessage.client.channels.cache.get('872863093359800330') as TextChannel)
        ?.send({
          embeds: [
            new MessageEmbed()
              .setAuthor(
                newMessage.author.tag,
                newMessage.author.displayAvatarURL({ dynamic: true })
              )
              .setDescription(`[メッセージに移動](${newMessage.url})\n\n${text}`)
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
              .setColor('BLURPLE'),
          ],
        })
        .catch(() => {});
    }
  },
};
