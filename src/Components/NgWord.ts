import { Message, MessageEmbed, AnyChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';

export default function (message: Message) {
  if (!message.content) return;

  const msgChannel: any = message.channel;

  Bot.db.query('SELECT * FROM `ng`', (e: any, rows: any[]) => {
    if (!rows || !rows[0]) return;

    let ngWord: any = false;
    for (const row of rows) {
      if (message.content.toLowerCase().replace(/\\/g, '').includes(row.word)) {
        ngWord = row;
      }
    }

    if (!ngWord) return;

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setFooter({ text: `#${msgChannel.name}` });

    if (ngWord.delmsg) {
      message.delete().catch(() => {});

      const authorEmbed: MessageEmbed = new MessageEmbed()
        .setColor('RED')
        .setDescription(
          `メッセージ内に NGワード「||${ngWord.word}||」が含まれていたため、削除しました。`
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

      embed.setColor('RED').setTitle('NGワード削除');
    } else {
      embed.setColor('YELLOW').setTitle('NGワード検出').setURL(message.url);
    }

    const ngLogChannel: AnyChannel | undefined = message.client.channels.cache.get(
      config.channels.ngLog
    );

    if (!ngLogChannel || !ngLogChannel.isText()) return;

    ngLogChannel.send({
      content: '<@&903921596241182731>',
      embeds: [embed],
    });
  });
}
