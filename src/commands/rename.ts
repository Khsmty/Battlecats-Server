import { SlashCommandBuilder } from '@discordjs/builders';
import {
  TextChannel,
  Permissions,
  MessageEmbed,
  CommandInteraction,
} from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('スレッドのタイトルを変更します。')
    .addStringOption((option) =>
      option
        .setName('new-title')
        .setDescription('スレッドの新しいタイトルを入力してください。')
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    const newTitle: any = interaction.options.getString('new-title');

    const commandChannel = interaction.channel as TextChannel;
    if (commandChannel?.parentId !== config.threadOpenCategoryId) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(':x: エラー')
            .setDescription('このチャンネルはスレッドではありません。')
            .setColor('RED'),
        ],
        ephemeral: true,
      });
    }

    Bot.db.query(
      'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
      [interaction.channelId, false],
      async (e, rows) => {
        if (
          rows[0].ownerId !== interaction.user.id &&
          !(interaction.member!.permissions as Permissions).has('ADMINISTRATOR')
        ) {
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':x: エラー')
                .setDescription(
                  'このスレッドのタイトルを変更する権限がありません。'
                )
                .setColor('RED'),
            ],
            ephemeral: true,
          });
        } else {
          Bot.db.query(
            'UPDATE `threads` SET `title` = ? WHERE `channelId` = ? AND `closed` = ?',
            [newTitle, interaction.channelId, false]
          );

          (interaction.channel as TextChannel).setName(newTitle);

          (
            interaction.client.channels.cache.get(
              config.threadCreateChannel
            ) as TextChannel
          )?.messages
            .fetch(rows[0].listMessageId)
            .then((msg) => {
              msg.edit({
                embeds: [msg.embeds[0].setTitle(newTitle)],
              });
            });

          (interaction.channel as TextChannel)?.messages
            .fetch(rows[0].firstMessageUrl.split('/').pop())
            .then((msg) => {
              msg.edit({
                embeds: [msg.embeds[0], msg.embeds[1].setTitle(newTitle)],
              });
            });

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':white_check_mark: 成功')
                .setDescription(
                  `スレッドのタイトルを「${newTitle}」に変更しました。`
                )
                .setColor('GREEN'),
            ],
          });
        }
      }
    );
  },
};
