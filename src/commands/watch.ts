const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordTogether } = require("discord-together");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("watch")
    .setDescription("ボイスチャンネルでYouTubeを視聴します。(PCのみ)"),
  async execute(interaction) {
    if (!interaction.member.voice.channelId)
      return interaction.reply("先にボイスチャンネルに参加してください。");

    new DiscordTogether(interaction.client)
      .createTogetherCode(interaction.member.voice.channelId, "youtube")
      .then(async (invite) => {
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("YouTube")
              .setDescription("⚠️ モバイルアプリには対応していません。")
              .setColor("YELLOW"),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel("クリックして視聴開始")
                .setStyle("LINK")
                .setURL(invite.code)
            ),
          ],
        });
      });
  },
};
