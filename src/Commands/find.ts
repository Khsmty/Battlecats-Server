import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, CommandInteraction } from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('find')
    .setDescription('スレッドをタイトルから検索します。')
    .addStringOption((option) =>
      option.setName('query').setDescription('検索キーワード').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const query: any = interaction.options.getString('query');
    const results: string[] = [];

    Bot.db.query('SELECT * FROM `threads` WHERE `title` LIKE ?', [`%${query}%`], (e, rows) => {
      for (const row of rows) {
        results.push(
          `[${row.title}](https://discord.com/channels/${config.guildId}/${row.channelId}/${row.firstMessageId})`
        );
      }

      interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle(`「${query}」の検索結果`)
            .setDescription(results[0] ? results.join('\n\n') : '*検索結果がありませんでした*')
            .setColor('BLURPLE'),
        ],
      });
    });
  },
};
