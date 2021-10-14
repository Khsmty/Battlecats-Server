import { Message } from 'discord.js';
import Bot from '../Components/Bot';

module.exports = {
  name: 'dojo',
  async execute(message: Message, args: any[]) {
    if (
      !message.member?.roles.cache.has('868797324699242507') &&
      !message.member?.permissions.has('ADMINISTRATOR')
    )
      return;

    if (!args[0]) return message.reply('必要な引数が不足しています。');

    if (args[0] === 'add') {
      if (!args[1] || !args[2] || !args[3] || !message.attachments.first())
        return message.reply('必要な引数が不足しています。');

      const sendCh: any =
        message.client.channels.cache.get('893791664278220840');
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
        async (e, rows) => {
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
        async (e, rows) => {
          if (!rows[0]) return message.reply('スコアが登録されていません。');

          for (let i = 0; i < rows.length; i++) {
            const userData = await message.client.users.fetch(rows[i].userId);

            await message.channel.send({
              content: `**${i + 1}**位 **${userData.username}**#${
                userData.discriminator
              } さん`,
              files: [
                {
                  attachment: rows[i].imageUrl,
                },
              ],
            });
          }
        }
      );
    }
  },
};
