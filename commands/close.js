const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('スレッドを解決済みとしてマークします。'),
  async execute(interaction) {
    interaction.reply('このコマンドは準備中です。')
  },
}
