import { MessageEmbed, MessageActionRow, MessageButton, Interaction, TextChannel, Message } from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  name: 'messageCreate',
  async execute(message: Message) {
    // Botによるメッセージは無視する
    if (message.author.bot) return;

    // お知らせ自動公開
    if (message.channel.type === 'GUILD_NEWS') {
      message.crosspost();
    }

    // スレッド作成
    if (message.channelId === config.threadCreateChannel) {
      Bot.db.query('SELECT * FROM `threadChannels` WHERE `inUse` = ?', [false], (e, rows) => {
        if (!rows[0]) {
          message.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(':x: エラー')
                .setDescription('空きチャンネルがありません。管理スタッフへ連絡してください。')
                .setColor('RED'),
            ],
          });
          return;
        } else {
          const useChannelDb = rows[Math.floor(Math.random() * rows.length)];

          Bot.db.query('UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?', [true, useChannelDb.channelId]);

          const useChannel: any = message.client.channels.cache.get(useChannelDb.channelId);

          useChannel.setParent(config.threadOpenCategoryId);
          useChannel.setName(message.content);

          Bot.db.query(
            'INSERT INTO `threads` (`channelId`, `ownerId`, `title`) VALUES (?, ?, ?)',
            [useChannel.id, message.author.id, message.content],
            (e) => {
              Bot.db.query(
                'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
                [useChannel.id, false],
                async (e, rows) => {
                  const firstMessage: Message = await useChannel.send({
                    content: `${message.author} スレッドを作成しました。`,
                    embeds: [
                      new MessageEmbed()
                        .setTitle('操作方法')
                        .setDescription(
                          '`/close`: スレッドをCloseします。\n`/delete`: 解決済みのスレッドを削除します。\n`/reopen`: スレッドを再度Openします。\n\n※スレッドの最終メッセージから3日が経過すると、自動でCloseされます。'
                        )
                        .setColor('BLURPLE'),
                      new MessageEmbed()
                        .setAuthor(`ID: ${rows[0].ID}`)
                        .setTitle(message.content)
                        .addField(
                          '作成者',
                          `**${message.author.username}**#${message.author.discriminator} (${message.author})`
                        )
                        .setColor('YELLOW'),
                    ],
                  });

                  const listMessage = await message.reply({
                    embeds: [
                      new MessageEmbed()
                        .setAuthor(`ID: ${rows[0].ID}`)
                        .setTitle(message.content)
                        .addField(
                          '作成者',
                          `**${message.author.username}**#${message.author.discriminator} (${message.author})`
                        )
                        .addField('リンク', `[最初のメッセージ](${firstMessage.url})`)
                        .setColor('GREEN'),
                    ],
                  });

                  Bot.db.query(
                    'UPDATE `threads` SET `firstMessageUrl` = ?, `listMessageId` = ? WHERE `channelId` = ? AND `closed` = ?',
                    [firstMessage.url, listMessage.id, useChannel.id, false]
                  );
                }
              );
            }
          );
        }
      });
    }

    if (message.content.startsWith(config.prefix)) {
      const args = message.content.slice(config.prefix.length).trim().split(/ +/);
      const command: String = args.shift()!.toLowerCase();

      if (!Bot.messageCommands.has(command)) return;

      try {
        Bot.messageCommands.get(command).execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply('エラーが発生しました。');
      }
    }
  },
};
