import { SlashCommandBuilder } from '@discordjs/builders';
import {
  TextChannel,
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  CommandInteraction,
} from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('スレッドをCloseします。(取り消し不可)'),
  async execute(interaction: CommandInteraction) {
    const commandChannel = interaction.channel as TextChannel;
    if (commandChannel?.parentId !== config.threadOpenCategoryId) {
      return interaction.reply({
        embeds: [
          new MessageEmbed().setTitle(':x: エラー').setDescription('このチャンネルはCloseできません。').setColor('RED'),
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
          const closeMsg = await interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':white_check_mark: 成功')
                .setDescription('30秒後ぐらいにCloseされます。\nメッセージを送信するとCloseをキャンセルできます。')
                .setColor('GREEN'),
            ],
          });

          Bot.db.query('INSERT INTO `threadCloseQueue` (`channelId`, `date`, `listMessageId`, `closeMessageId`) VALUES (?, ?, ?, ?)', [
            interaction.channelId,
            new Date(Date.now() + 30000), // 3600000,
            rows[0].listMessageId,
            closeMsg.id,
          ]);
        }
      }
    );
  },
};
