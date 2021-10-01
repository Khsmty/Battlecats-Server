const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('スレッドのタイトルを変更します。')
    .addStringOption((option) =>
      option
        .setName('title')
        .setDescription('変更後のタイトルを指定してください。')
        .setRequired(true),
    ),
  async execute(interaction) {
    interaction.reply('このコマンドは準備中です。')
  },
}
