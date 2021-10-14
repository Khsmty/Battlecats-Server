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
    .setName('close')
    .setDescription('スレッドをCloseします。(取り消し不可)'),
  async execute(interaction: CommandInteraction) {
    const commandChannel = interaction.channel as TextChannel;
    if (commandChannel?.parentId !== config.threadOpenCategoryId) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(':x: エラー')
            .setDescription('このチャンネルはCloseできません。')
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
                .setDescription('このスレッドをCloseする権限がありません。')
                .setColor('RED'),
            ],
            ephemeral: true,
          });
        } else {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':white_check_mark: 成功')
                .setDescription(
                  '1時間後にCloseされます。\nメッセージを送信するとCloseをキャンセルできます。'
                )
                .setColor('GREEN'),
            ],
          });

          Bot.db.query(
            'INSERT INTO `threadCloseQueue` (`channelId`, `date`, `listMessageId`) VALUES (?, ?, ?)',
            [
              interaction.channelId,
              new Date(Date.now() + 5000), // 3600000),
              rows[0].listMessageId,
            ]
          );
        }
      }
    );
  },
};
