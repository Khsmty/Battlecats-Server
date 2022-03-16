import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } from 'discord.js';
import axios from 'axios';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcwiki')
    .setDescription('Minecraft Japan Wiki 内を検索します。')
    .addStringOption((option) =>
      option.setName('query').setDescription('検索キーワード').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const query = interaction.options.getString('query');

    const api = await axios.get(
      `https://minecraftjapan.miraheze.org/w/api.php?format=json&action=query&list=search&srlimit=5&srsearch=${query}`
    );
    const results = api.data.query.search.map(
      (r: { title: string }) => `[${r.title}](https://minecraftjapan.miraheze.org/wiki/${r.title})`
    );

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`「${query}」の検索結果`)
          .setDescription(results[0] ? results.join('\n\n') : '*検索結果がありませんでした*')
          .setColor('NAVY'),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel('他の検索結果')
            .setStyle('LINK')
            .setURL(`https://minecraftjapan.miraheze.org/w/index.php?search=${query}`)
        ),
      ],
    });
  },
};
