const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reopen')
    .setDescription('スレッドを再度未解決としてマークします。'),
  async execute(interaction) {
    interaction.reply('このコマンドは準備中です。')
  },
}
