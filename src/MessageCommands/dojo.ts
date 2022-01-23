import { Message, Collection, Snowflake, TextChannel } from 'discord.js';
import Bot from '../Components/Bot';

module.exports = {
  name: 'dojo',
  async execute(message: Message, args: String[]) {
    if (
      !message.member?.roles.cache.has('868797324699242507') &&
      !message.member?.permissions.has('ADMINISTRATOR')
    )
      return;

    if (!args[0]) return message.reply('必要な引数が不足しています。');

    if (args[0] === 'add') {
      if (!args[1] || !args[2] || !args[3] || !message.attachments.first())
        return message.reply('必要な引数が不足しています。');

      const sendCh: any = message.client.channels.cache.get('893791664278220840');
      const sendImage = await sendCh?.send({
        files: [
          {
            attachment: message.attachments.first()?.url,
          },
        ],
      });

      Bot.db.query(
        'SELECT * FROM `dojo` WHERE `userId` = ? AND `type` = ?',
        [args[2], args[1]],
        async (e: any, rows: any[]) => {
          if (!rows[0]) {
            Bot.db.query(
              'INSERT INTO `dojo` (`userId`, `type`, `imageUrl`, `score`) VALUES (?, ?, ?, ?)',
              [args[2], args[1], sendImage.attachments.first().url, args[3]]
            );
            message.reply('スコアを新規登録しました。');
          } else {
            Bot.db.query(
              'UPDATE `dojo` SET `imageUrl` = ?, `score` = ? WHERE `userId` = ? AND `type` = ?',
              [sendImage.attachments.first().url, args[3], args[2], args[1]]
            );
            message.reply('スコアを更新しました。');
          }
        }
      );
    } else if (args[0] === 'sort') {
      if (!args[1]) return message.reply('必要な引数が不足しています。');

      Bot.db.query(
        'SELECT * FROM `dojo` WHERE `type` = ? ORDER BY `score` DESC',
        [args[1]],
        async (e: any, rows: string | any[]) => {
          if (!rows[0]) return message.reply('スコアが登録されていません。');

          for (let i = 0; i < rows.length; i++) {
            try {
              const userData = message.client.guilds
                .resolve('755774191613247568')
                ?.members.resolve(rows[i].userId);
              if (!userData) continue;

              let userName = `**${userData.user.username}**#${userData.user.discriminator}`;
              if (userData.nickname) {
                userName = `**${userData.nickname}** (${userData.user.username}#${userData.user.discriminator})`;
              }

              await message.channel.send({
                content: `**${i + 1}**位 ${userName} さん`,
                files: [
                  {
                    attachment: rows[i].imageUrl,
                  },
                ],
              });
            } catch (e) {
              await message.channel.send('エラーが発生しました...');
            }
          }
        }
      );
    } else if (args[0] === 'delete') {
      const fetchMsgs: Collection<Snowflake, Message> = await (
        message.channel as TextChannel
      )?.messages.fetch({ limit: 100 });
      const targetMsgs = fetchMsgs
        .filter(
          (msg: any) =>
            msg.attachments.first() &&
            msg.content.includes('位') &&
            msg.author.id === message.client.user?.id
        )
        .map((msg: any) => msg);

      targetMsgs
        .filter((msg: any) => targetMsgs[0].createdTimestamp - msg.createdTimestamp < 180000)
        .forEach((msg: any) => msg.delete());

      message.reply('削除しました。');
    }
  },
};
