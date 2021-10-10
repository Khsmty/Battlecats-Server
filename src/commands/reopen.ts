const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reopen")
    .setDescription("スレッドをReopenします。"),
  async execute(interaction) {
    if (
      interaction.channel.parentId !== "759465634236727316" ||
      !interaction.channel.topic
    ) {
      return interaction.reply({
        content:
          "・Closeされていないスレッド\n・スレッドではないチャンネル\nはReopenできません。",
        ephemeral: true,
      });
    }

    const authorId = require("../helpers/threadAuthor")(
      interaction.channel.topic
    );

    if (
      authorId !== interaction.user.id &&
      !interaction.member.permissions.has("ADMINISTRATOR")
    ) {
      return interaction.reply({
        content: "あなたはスレッドの作成者でないため、Reopenできません。",
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`スレッドをReopenします。\nよろしいですか？`)
          .setFooter("30秒経過すると自動キャンセルされます。")
          .setColor("YELLOW"),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setLabel("OK")
            .setEmoji("✅")
            .setStyle("SUCCESS")
            .setCustomId("thread-reopen-ok"),
          new MessageButton()
            .setLabel("キャンセル")
            .setStyle("DANGER")
            .setCustomId("thread-reopen-cancel"),
        ]),
      ],
    });

    const msg = await interaction.fetchReply();

    const ifilter = (i) => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({
      filter: ifilter,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "thread-reopen-ok") {
        await interaction.channel.setParent("756959797806366851");

        i.update({
          embeds: [
            new MessageEmbed()
              .setDescription("スレッドをReopenしました。")
              .setColor("GREEN"),
          ],
          components: [],
        });
      } else if (i.customId === "thread-reopen-cancel") {
        i.update({
          embeds: [
            new MessageEmbed()
              .setDescription("スレッドのReopenをキャンセルしました。")
              .setColor("RED"),
          ],
          components: [],
        });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        msg.edit({
          embeds: [
            new MessageEmbed()
              .setDescription("スレッドのReopenを自動キャンセルしました。")
              .setColor("RED"),
          ],
          components: [],
        });
      }
    });
  },
};
