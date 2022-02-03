import { SlashCommandBuilder } from '@discordjs/builders';
import { TextChannel, Permissions, CommandInteraction, GuildMemberRoleManager } from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('スレッドをCloseします。'),
  async execute(interaction: CommandInteraction) {
    if ((interaction.channel as TextChannel)?.parentId !== config.thread.openCategory) {
      return interaction.reply({
        content: ':x: このチャンネルは close できません。',
        ephemeral: true,
      });
    }

    Bot.db.query(
      'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
      [interaction.channelId, false],
      async (e: any, rows: { ownerId: string }[]) => {
        if (
          rows[0].ownerId !== interaction.user.id &&
          !(interaction.member!.permissions as Permissions).has('ADMINISTRATOR') &&
          !(interaction.member?.roles as GuildMemberRoleManager)?.cache.has('903921596241182731')
        ) {
          return interaction.reply({
            content: ':x: このチャンネルを close する権限がありません。',
            ephemeral: true,
          });
        } else {
          const channel = interaction.channel;
          if (!channel || channel.type !== 'GUILD_TEXT') return;

          await channel.setName('空きチャンネル');
          await channel.setParent(config.thread.closedCategory);

          await interaction.reply(':white_check_mark: スレッドを close しました。');

          // スレッド一覧の埋め込み色を赤色にする
          Bot.db.query(
            'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
            [interaction.channelId, false],
            (e: any, rows: { listMessageId: string }[]) => {
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
