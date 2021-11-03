import { SlashCommandBuilder } from '@discordjs/builders';
import {
  TextChannel,
  Permissions,
  MessageEmbed,
  CommandInteraction,
  GuildMemberRoleManager,
} from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('force-close')
    .setDescription('スレッドを強制Closeします。(運営スタッフのみ)'),
  async execute(interaction: CommandInteraction) {
    Bot.db.query(
      'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
      [interaction.channelId, false],
      async (e, rows) => {
        if (
          !(interaction.member?.roles as GuildMemberRoleManager)?.cache.has('903921596241182731')
        ) {
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':x: エラー')
                .setDescription('このコマンドを使用する権限がありません。')
                .setColor('RED'),
            ],
            ephemeral: true,
          });
        } else {
          if ((interaction.channel as TextChannel)?.parentId !== config.thread.openCategory) {
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

          const channel = interaction.client.channels.cache.get(
            interaction.channelId
          ) as TextChannel;

          await channel.setName('空きチャンネル');
          await channel.setParent(config.thread.closedCategory);

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':white_check_mark: 成功')
                .setDescription('強制Closeしました。')
                .setColor('GREEN'),
            ],
          });

          // スレッド一覧の埋め込み色を赤色にする
          Bot.db.query(
            'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
            [interaction.channelId, false],
            (e, rows) => {
              (
                interaction.client.channels.cache.get(config.thread.createChannel) as TextChannel
              )?.messages
                .fetch(rows[0].listMessageId)
                .then((msg) => {
                  msg.edit({
                    embeds: [msg.embeds[0].setColor('RED')],
                  });
                });
            }
          );
          // チャンネルを空きチャンネルとしてマーク
          Bot.db.query('UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?', [
            false,
            interaction.channelId,
          ]);
          // スレッドをClose済としてマーク
          Bot.db.query('UPDATE `threads` SET `closed` = ? WHERE `channelId` = ? AND `closed` = ?', [
            true,
            interaction.channelId,
            false,
          ]);
        }
      }
    );
  },
};
