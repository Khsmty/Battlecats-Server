const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('スレッドを削除します。'),
  async execute(interaction) {
    interaction.reply('このコマンドは準備中です。')
  },
}
