import { MessageEmbed, MessageButton, MessageActionRow, TextChannel, Message } from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';
import UpdateBoard from '../Components/Board';
import Pin from '../Components/Pin';
import NgDetect from '../Components/NgDetect';

module.exports = {
  name: 'messageCreate',
  async execute(message: Message) {
    if (!message.guild) return;

    if (message.channelId === config.upChannel) {
      // DISBOARD
      if (
        message.author.id === '302050872383242240' &&
        message.embeds[0].description?.includes('表示順をアップしたよ')
      ) {
        UpdateBoard(message);
      }

      // Chahan
      if (
        message.author.id === '727981800240185454' &&
        message.embeds[0].description?.includes('upに成功しました。')
      ) {
        UpdateBoard(message);
      }

      // GlowBoard
      if (
        message.author.id === '832614051514417202' &&
        message.embeds[0].description?.includes('サーバーの表示順位をアップしました!')
      ) {
        UpdateBoard(message);
      }
    }

    // Pinメッセージ
    Pin(message.channel as TextChannel);

    // Botによるメッセージは無視
    if (message.author.bot) return;

    // お知らせ自動公開
    if (message.channel.type === 'GUILD_NEWS') {
      message.crosspost();
    }

    // NGワードチェック
    NgDetect(message);

    // メッセージリンク展開
    const messageUrlPattern =
      /http(?:s)?:\/\/(?:.*)?discord(?:app)?\.com\/channels\/(?:\d{17,19})\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})/g;
    let result;

    while ((result = messageUrlPattern.exec(message.content)) !== null) {
      const group = result.groups;

      if (
        message.content.match(
          /^http(?:s)?:\/\/(?:.*)?discord(?:app)?\.com\/channels\/(?:\d{17,19})\/\d{17,19}\/\d{17,19}$/
        )
      ) {
        message.delete().catch(() => {});
      }

      message.client.channels
        .fetch(group!.channelId)
        .then((channel: any) => channel.messages.fetch(group!.messageId))
        .then((targetMessage) => {
          const expandmsg = new MessageEmbed()
            .setAuthor({
              name: targetMessage.author.tag,
              iconURL: targetMessage.author.displayAvatarURL(),
            })
            .setDescription(
              targetMessage.content + '\n\n[元メッセージへ](' + targetMessage.url + ')'
            )
            .setColor('BLURPLE')
            .setImage(targetMessage.attachments?.map((a: any) => a.url).shift())
            .setFooter({
              text: '#' + targetMessage.channel.name + ' | Quoted by ' + message.author.tag,
            })
            .setTimestamp(targetMessage.createdTimestamp);

          const sendEmbeds: MessageEmbed[] = [expandmsg];

          sendEmbeds.push(...targetMessage.embeds);

          message.channel.send({
            embeds: sendEmbeds,
          });
        })
        .catch((e) => {});
    }

    // スレッド作成
    if (message.channelId === config.thread.createChannel) {
      if (!message.content) {
        message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle(':x: エラー')
              .setDescription('メッセージ内容がないため、スレッドを作成できません。')
              .setColor('RED'),
          ],
        });
        return;
      }
      if (message.content.length > 100) {
        message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle(':x: エラー')
              .setDescription('メッセージ内容が100文字を超えているため、スレッドを作成できません。')
              .setColor('RED'),
          ],
        });
        return;
      }

      Bot.db.query(
        'SELECT * FROM `threads` WHERE `ownerId` = ? AND `closed` = ?',
        [message.author.id, false],
        (e: any, rows: string | any[]) => {
          if (rows.length >= 3) {
            return message.reply(
              ':x: スレッドの作成個数が上限に達しました。先にアクティブなスレッドを close してください。'
            );
          }
        }
      );

      Bot.db.query(
        'SELECT * FROM `threadChannels` WHERE `inUse` = ?',
        [false],
        (e: any, rows: string | any[]) => {
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

            Bot.db.query('UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?', [
              true,
              useChannelDb.channelId,
            ]);

            const useChannel: any = message.client.channels.cache.get(useChannelDb.channelId);

            useChannel.setParent(config.thread.openCategory);
            useChannel.setName(message.content);

            Bot.db.query(
              'INSERT INTO `threads` (`channelId`, `ownerId`, `title`) VALUES (?, ?, ?)',
              [useChannel.id, message.author.id, message.content],
              (e: any) => {
                Bot.db.query(
                  'SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?',
                  [useChannel.id, false],
                  async (e: any, rows: { ID: any }[]) => {
                    const firstMessage: Message = await useChannel.send({
                      content: `${message.author} スレッドを作成しました。`,
                      embeds: [
                        new MessageEmbed()
                          .setTitle('操作方法')
                          .setDescription(
                            '`/close`: スレッドをCloseします。\n`/rename`: スレッドのタイトルを変更します。\n\n※スレッドの最終メッセージから2日が経過すると、自動でCloseされます。'
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
                      'UPDATE `threads` SET `firstMessageId` = ?, `listMessageId` = ? WHERE `channelId` = ? AND `closed` = ?',
                      [firstMessage.id, listMessage.id, useChannel.id, false]
                    );
                  }
                );
              }
            );
          }
        }
      );
    }

    if ((message.channel as TextChannel).parentId === config.thread.openCategory) {
      Bot.db.query(
        'SELECT * FROM `threadCloseQueue` WHERE `channelId` = ?',
        [message.channelId],
        (e: any, rows: any[]) => {
          if (!rows || !rows[0]) return;

          Bot.db.query('DELETE FROM `threadCloseQueue` WHERE `channelId` = ?', [message.channelId]);
        }
      );
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
