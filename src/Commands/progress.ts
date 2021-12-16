import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, Snowflake, TextChannel, Collection, CommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('progress')
    .setDescription('メンバーの進行状況を検索します。')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('進行状況を検索するユーザーを入力してください。')
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const userId = interaction.options.getUser('user')?.id;
    const messages: Message[] = [];
    let beforeId;

    for (let i = 0; i < 5; i++) {
      try {
        const fetchMsgs: Collection<Snowflake, Message> = await (
          interaction.client.channels.cache.get('822771682157658122') as TextChannel
        )?.messages.fetch({ limit: 100, before: beforeId });

        beforeId = fetchMsgs!.last()!.id;

        const messageWithImages = fetchMsgs
          .filter((msg: any) => msg.attachments.first() && msg.author.id === userId)
          .map((msg) => msg);

        for (const msg of messageWithImages) {
          messages.push(msg);
        }
      } catch (e) {
        continue;
      }
    }

    if (!messages[0]) {
      interaction.editReply({
        content: '進行状況が見つかりませんでした。',
        ephemeral: true,
      });
      return;
    }

    const images: string[] = [];
    messages
      .filter((msg) => messages[0].createdTimestamp - msg.createdTimestamp < 300000)
      .forEach((msg) => msg.attachments.forEach((attachment) => images.push(attachment.url)));

    await interaction.editReply({ files: images });
  },
};
