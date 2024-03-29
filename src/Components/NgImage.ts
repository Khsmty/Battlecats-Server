import { Message, MessageEmbed, AnyChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';
import axios from 'axios';

export default function (message: Message) {
  /**
  const attachments: any = message.attachments.map((a: any) => a);

  message.embeds
    .filter((e: { type: string }) => e.type === 'image')
    .map((e: any) =>
      attachments.push({
        width: e.thumbnail.width,
        height: e.thumbnail.height,
        url: e.thumbnail.url,
      })
    );

  message.embeds
    .filter((e: { type: string }) => e.type === 'rich')
    .map((e: any) => {
      if (e.image) {
        attachments.push({
          width: e.image.width,
          height: e.image.height,
          url: e.image.url,
        });
      }
      if (e.thumbnail) {
        attachments.push({
          width: e.thumbnail.width,
          height: e.thumbnail.height,
          url: e.thumbnail.url,
        });
      }
    });

  if (!attachments[0]) return;

  const msgChannel: any = message.channel;

  Bot.db.query('SELECT * FROM `ng`', async (e: any, rows: any[]) => {
    if (!rows || !rows[0]) return;

    for (const attachment of attachments) {
      if (!attachment.height && !attachment.width) continue;

      try {
        const img = await axios.get(attachment.url, { responseType: 'arraybuffer' });
        const imgBase64 = Buffer.from(img.data, 'binary').toString('base64');

        const ocr: any = await axios.post('https://ocr-example.herokuapp.com/base64', {
          base64: imgBase64,
          languages: 'jpn,eng',
        });
        const text = ocr.data.result;

        let ngWord: any = false;
        for (const row of rows) {
          if (text.toLowerCase().replace(/ |\n/g, '').includes(row.word)) {
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

        const embed: MessageEmbed = new MessageEmbed()
          .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
          .setDescription(text)
          .setImage(String(sendMsg.attachments.first()?.url))
          .setFooter(`#${msgChannel.name}`);

        if (ngWord.delmsg) {
          message.delete().catch(() => {});

          const authorEmbed: MessageEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription(
              `画像内に NGワード「||${ngWord.word}||」が含まれていたため、削除しました。`
            );

          message.author
            .send({
              embeds: [authorEmbed],
            })
            .catch(() => {
              message.channel.send({
                content: `<@!${message.author.id}>`,
                embeds: [authorEmbed],
              });
            });

          embed.setColor('RED').setTitle('NG画像削除');
        } else {
          embed.setColor('YELLOW').setTitle('NG画像検出').setURL(message.url);
        }

        const ngLogChannel: AnyChannel | undefined = message.client.channels.cache.get(
          config.channels.ngLog
        );

        if (!ngLogChannel || !ngLogChannel.isText()) return;

        ngLogChannel.send({
          content: '<@&903921596241182731>',
          embeds: [embed],
        });
      } catch (e) {
        continue;
      }
    }
  });
  */
}
