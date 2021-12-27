import { Message, MessageEmbed, AnyChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';
import { createWorker } from 'tesseract.js';

export default function (message: Message) {
  if (!message.guild || message.guildId !== config.guildId) return;

  if (!message.attachments.first()) return;

  const msgChannel: any = message.channel;

  Bot.db.query('SELECT * FROM `ng`', async (e, rows) => {
    if (!rows || !rows[0]) return;

    for (const attachment of message.attachments.values()) {
      if (!attachment.height && !attachment.width) continue;

      const worker = createWorker({
        logger: (m) => console.log(m),
      });

      worker.load();
      worker.loadLanguage('jpn');
      worker.initialize('jpn');
      const {
        data: { text },
      } = await worker.recognize(attachment.url);
      worker.terminate();

      let ngWord: any = false;
      for (const row of rows) {
        if (text.toLowerCase().includes(row.word)) {
          ngWord = row;
        }
      }

      if (!ngWord) continue;

      const imageLogChannel: AnyChannel | undefined =
        message.client.channels.cache.get('904889227085508658');

      if (!imageLogChannel || !imageLogChannel.isText()) return;

      const sendMsg = await imageLogChannel.send({
        files: [
          {
            attachment: attachment.url,
            name: String(attachment.name),
          },
        ],
      });

      message.delete();

      message.channel.send({
        content: `<@!${message.author.id}>`,
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              `画像内に NGワード「||${ngWord.word}||」が含まれていたため、削除しました。`
            ),
        ],
      });

      const ngLogChannel: AnyChannel | undefined = message.client.channels.cache.get(
        config.channels.ngLog
      );

      if (!ngLogChannel || !ngLogChannel.isText()) return;

      ngLogChannel.send({
        content: `<@&${config.roles.mod}>`,
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('NG画像削除')
            .setDescription(text)
            .setImage(String(sendMsg.attachments.first()?.url))
            .setFooter(`#${msgChannel.name}`)
            .setColor('RED'),
        ],
      });
    }
  });
}
