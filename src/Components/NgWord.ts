import { Message, MessageEmbed, AnyChannel, TextChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';

export default function (message: Message) {
  if (!message.guild || message.guildId !== config.guildId) return;

  const msgChannel: any = message.channel;

  Bot.db.query('SELECT * FROM `ng`', (e, rows) => {
    if (!rows || !rows[0]) return;

    let ngWord: any = false;
    for (const row of rows) {
      if (message.content.toLowerCase().includes(row.word)) {
        ngWord = row;
      }
    }

    if (!ngWord) return;

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setFooter(`#${msgChannel.name}`);

    if (ngWord.delmsg) {
      message.delete();

      message.channel.send({
        content: `<@!${message.author.id}>`,
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              `メッセージ内に NGワード「||${ngWord.word}||」が含まれていたため、削除しました。`
            ),
        ],
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
      embeds: [embed],
    });
  });
}
