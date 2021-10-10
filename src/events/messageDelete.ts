import { MessageEmbed, Message } from "discord.js";

module.exports = {
  name: "messageDelete",
  async execute(message: Message) {
    if (message.author.bot) return;

    if (message.channel.guildId === "755774191613247568") {
      message.client.channels.cache
        .get("872863093359800330")
        .send({
          embeds: [
            new MessageEmbed()
              .setTitle("メッセージ削除")
              .setAuthor(
                message.author.tag,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .addField("メッセージ", message.content || "*なし*")
              .addField(
                "添付ファイル",
                message.attachments
                  .map((a) => `[URL](${a.proxyURL})`)
                  .join(", ") || "*なし*"
              )
              .addField(
                "チャンネル",
                `${message.channel} (#${message.channel.name}/${message.channel.id})`,
                true
              )
              .addField(
                "カテゴリ",
                `${
                  message.channel.parent
                    ? message.channel.parent.name
                    : "*なし*"
                } (${message.channel.parentId || "*なし*"})`,
                true
              )
              .setTimestamp()
              .setColor("RED"),
          ],
        })
        .catch(() => {});
    }
  },
};
