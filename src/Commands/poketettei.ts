import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } from 'discord.js';
import { google } from 'googleapis';

const customSearch = google.customsearch('v1');
google.options({ auth: process.env.GOOGLE_API_KEY });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poketettei')
    .setDescription('ポケモン徹底攻略を検索します。')
    .addStringOption((option) =>
      option.setName('query').setDescription('検索キーワードを入力してください。').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const query = interaction.options.getString('query');

    const result = await customSearch.cse.list({
      cx: 'e063e7ea62c504aa1',
      q: query || undefined,
    });
    const results = result.data.items
      ? result.data.items
          .map(
            (item: { title?: string | null; link?: string | null }) =>
              `[${item.title!.replace(/ (\||-) ポケモン徹底攻略/, '')}](${item.link})`
          )
          .slice(0, 5)
      : [];

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`「${query}」の検索結果`)
          .setDescription(results[0] ? results.join('\n\n') : '*検索結果がありませんでした*')
          .setColor('AQUA'),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel('他の検索結果')
            .setStyle('LINK')
            .setURL(`https://www.google.co.jp/search?q=${query}+site:yakkun.com`)
        ),
      ],
    });
  },
};
