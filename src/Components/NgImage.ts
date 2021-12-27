import { Message, MessageEmbed, AnyChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';
import axios from 'axios';

export default function (message: Message) {
  if (!message.guild || message.guildId !== config.guildId) return;

  const attachments: any = message.attachments.map((a) => a);

  message.embeds
    .filter((e) => e.type === 'image')
    .map((e: any) =>
      attachments.push({
        width: e.thumbnail.width,
        height: e.thumbnail.height,
        url: e.thumbnail.url,
      })
    );

  if (!message.attachments.first()) return;

  const msgChannel: any = message.channel;

  Bot.db.query('SELECT * FROM `ng`', async (e, rows) => {
    if (!rows || !rows[0]) return;

    for (const attachment of attachments) {
      if (!attachment.height && !attachment.width) continue;

      const img = await axios.get(attachment.url, { responseType: 'arraybuffer' });
      const imgBase64 = Buffer.from(img.data, 'binary').toString('base64');

      const ocr = await axios.post('https://ocr-example.herokuapp.com/base64', {
        base64: imgBase64,
        languages: 'eng,jpn',
      });
      const text = ocr.data.result;

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
            name: attachment.url.split('/').pop(),
          },
        ],
      });

      message.delete().catch(() => {});

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
