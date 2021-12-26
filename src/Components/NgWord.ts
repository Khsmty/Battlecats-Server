import { assertReturnOfBuilder } from '@discordjs/builders/dist/interactions/slashCommands/Assertions';
import { Message, MessageEmbed, AnyChannel } from 'discord.js';
import config from '../config.json';
import Bot from './Bot';

export default function (message: Message) {
  Bot.db.query('SELECT * FROM `ng`', (e, rows) => {
    if (!rows || !rows[0]) return;

    let inNgWord: boolean = false;
    for (const row of rows) {
      if (message.content.toLowerCase().includes(row.word)) {
        inNgWord = true;
      }
    }

    if (!inNgWord) return;

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content);

    if (rows[0].delmsg) {
      message.delete();

      message.channel.send({
        content: `<@!${message.author.id}>`,
        embeds: [
          new MessageEmbed()
            .setColor('RED')
            .setDescription(
              `メッセージ内に NGワード「||${rows[0].word}||」が含まれていたため、削除しました。`
            ),
        ],
      });

      embed.setColor('RED').setTitle('NGワード削除');
    } else {
      embed.setColor('YELLOW').setTitle('NGワード検出');
    }

    const ngLogChannel: AnyChannel | undefined = message.client.channels.cache.get(
      config.channels.ngLog
    );

    if (!ngLogChannel || !ngLogChannel.isText()) return;

    ngLogChannel.send({
      content: `<@&${config.roles.mod}>`,
      embeds: [embed],
    });
  });
}
