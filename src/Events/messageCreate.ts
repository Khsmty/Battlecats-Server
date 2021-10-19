import { MessageEmbed, MessageButton, MessageActionRow, TextChannel, Message } from 'discord.js';
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

    // メッセージリンク展開
    const messageUrlPattern =
      /http(?:s)?:\/\/(?:.*)?discord(?:app)?\.com\/channels\/(?:\d{17,19})\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})/g;
    let result;

    while ((result = messageUrlPattern.exec(message.content)) !== null) {
      const group = result.groups;

      message.client.channels
        .fetch(group.channelId)
        .then((channel) => channel.messages.fetch(group.messageId))
        .then((targetMessage) => {
          const expandmsg = new MessageEmbed()
            .setAuthor(targetMessage.author.tag, targetMessage.author.displayAvatarURL())
            .setDescription(targetMessage.content)
            .setColor(
              targetMessage.member
                ? targetMessage.member.roles.highest
                  ? targetMessage.member.roles.highest.color
                  : 'BLURPLE'
                : 'BLURPLE'
            )
            .setImage(targetMessage.attachments?.map((a) => a.url).shift() ?? null)
            .setFooter(`#${targetMessage.channel.name}`)
            .setTimestamp(targetMessage.createdTimestamp);
          const jumpButton = new MessageButton()
            .setLabel('元メッセージへ')
            .setStyle('LINK')
            .setURL(targetMessage.url);

          message.channel.send({
            embeds: [expandmsg],
            components: [new MessageActionRow().addComponents(jumpButton)],
          });

          targetMessage.embeds.forEach((embed) => {
            message.channel.send({ embeds: [embed] });
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
      });
    }

    if ((message.channel as TextChannel).parentId === config.thread.openCategory) {
      Bot.db.query(
        'SELECT * FROM `threadCloseQueue` WHERE `channelId` = ?',
        [message.channelId],
        (e, rows) => {
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
