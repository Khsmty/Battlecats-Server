import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordTogether } from 'discord-together';
import {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  CommandInteraction,
  GuildMember,
} from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('watch')
    .setDescription('ボイスチャンネルでYouTubeを視聴します。(PCのみ)'),
  async execute(interaction: CommandInteraction) {
    if (!(interaction.member as GuildMember)?.voice.channelId)
      return interaction.reply('先にボイスチャンネルに参加してください。');

    new DiscordTogether(interaction.client)
      .createTogetherCode(
        (interaction.member as any)?.voice.channelId,
        'youtube'
      )
      .then(async (invite: { code: string }) => {
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('YouTube')
              .setDescription('⚠️ モバイルアプリには対応していません。')
              .setColor('YELLOW'),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel('クリックして視聴開始')
                .setStyle('LINK')
                .setURL(invite.code)
            ),
          ],
        });
      });
  },
};
