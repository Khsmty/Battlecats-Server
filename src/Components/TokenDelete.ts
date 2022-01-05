import { Message, MessageEmbed, AnyChannel, TextChannel } from 'discord.js';
import config from '../config.json';

export default function (message: Message) {
  if (!message.guild || message.guildId !== config.guildId) return;

  const msgChannel: any = message.channel;

  if (message.content.match(/[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27}/)) {
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setFooter(`#${msgChannel.name}`);

    message.delete().catch(() => {});

    const authorEmbed: MessageEmbed = new MessageEmbed()
      .setColor('RED')
      .setDescription(`メッセージ内に TOKEN が含まれていたため、削除しました。`);

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

    embed.setColor('RED').setTitle('TOKEN削除');

    const ngLogChannel: AnyChannel | undefined = message.client.channels.cache.get(
      config.channels.ngLog
    );

    if (!ngLogChannel || !ngLogChannel.isText()) return;

    ngLogChannel.send({
      embeds: [embed],
    });
  }
}
