const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('progress')
    .setDescription('メンバーの進行状況を検索します。')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('進行状況を検索するユーザーを入力してください。')
        .setRequired(true),
    ),
  async execute(interaction) {
    const img = async (user) => {
      try {
        const n = await interaction.client.channels.cache
          .get('822771682157658122')
          .messages.fetch({ limit: 100 })
          .then((a) =>
            a
              .filter((a) => a.author.id === user && a.attachments.first())
              .first()
              .attachments.map((a) => a.url),
          )
        return n
      } catch {
        return null
      }
    }
    const res = await img(interaction.options.getUser('user').id)

    if (res) {
      await interaction.reply({
        files: res,
      })
    } else {
      await interaction.reply(
        'メッセージが取得できませんでした。\nDiscord標準の検索機能を利用してください。',
      )
    }
  },
}
