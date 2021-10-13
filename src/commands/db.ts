import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } from 'discord.js';
import { google } from 'googleapis';

const customSearch = google.customsearch('v1');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('db')
    .setDescription('にゃんこ大戦争データベースを検索します。')
    .addStringOption((option) =>
      option.setName('query').setDescription('検索キーワードを入力してください。').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const query = interaction.options.getString('query');

    const result = await customSearch.cse.list({
      auth: process.env.GOOGLE_API_KEY,
      cx: 'd5d85493077d946a9',
      q: query,
    });
    const results = result.data.items
      ? result.data.items.map((item) => `[${item.title!.replace('にゃんこ大戦争DB ', '')}](${item.link})`).slice(0, 5)
      : [];

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`「${query}」の検索結果`)
          .setDescription(results[0] ? results.join('\n\n') : '*検索結果がありませんでした*')
          .setColor('YELLOW'),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel('他の検索結果')
            .setStyle('LINK')
            .setURL(`https://www.google.co.jp/search?q=${query}+site:battlecats-db.com`)
        ),
      ],
    });
  },
};
