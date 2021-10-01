const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const serp = require('serp')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('db')
    .setDescription('にゃんこ大戦争データベースを検索します。')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('検索キーワードを入力してください。')
        .setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query')

    const search = await serp.search({
      host: 'google.co.jp',
      qs: {
        q: `${query}+site:battlecats-db.com`,
      },
      num: 5,
    })

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`「${query}」の検索結果`)
          .setDescription(
            search[0]
              ? search
                  .map(
                    (item) =>
                      `[${item.title}](https://www.google.co.jp${item.url})`,
                  )
                  .join('\n\n')
              : '*検索結果がありませんでした*',
          )
          .setColor('YELLOW'),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel('他の検索結果')
            .setStyle('LINK')
            .setURL(
              `https://www.google.co.jp/search?q=${query}+site:battlecats-db.com`,
            ),
        ),
      ],
    })
  },
}
