import { Message } from 'discord.js';
import Bot from '../Components/Bot';
import config from '../config.json';

module.exports = {
  name: 'ng',
  async execute(message: Message, args: string[]) {
    if (!message.member?.roles.cache.has(config.roles.mod)) return;

    if (!args[0]) return message.reply('必要な引数が不足しています。');

    if (args[0] === 'add') {
      if (!args[1] || !args[2]) return message.reply('必要な引数が不足しています。');

      if (!['1', '2'].includes(args[1])) {
        return message.reply('type:\n' + '1: :put_litter_in_its_place: 削除\n' + '2: :bellhop: モデレーター通知');
      }

      Bot.db.query(
        'INSERT INTO `ng` (`delmsg`, `word`) VALUES (?, ?)',
        [args[1] === '1', args[2]],
        (e) => {
          message.reply('NGワードを新規登録しました。');
        }
      );
    } else if (args[0] === 'remove') {
      if (!args[1]) return message.reply('必要な引数が不足しています。');

      Bot.db.query('DELETE FROM `ng` WHERE `word` = ?', [args[1]], (e) => {
        message.reply('NGワードを削除しました。');
      });
    } else if (args[0] === 'list') {
      Bot.db.query('SELECT * FROM `ng`', (e, rows) => {
        if (!rows || !rows[0]) return message.reply('NGワードが登録されていません。');

        let str: string = ':put_litter_in_its_place:: 削除, :bellhop:: モデレーター通知\n\n';

        for (const row of rows) {
          str += `${row.delmsg ? ':put_litter_in_its_place:' : ':bellhop:'}: ${row.word}\n`;
        }

        message.reply(str);
      });
    }
  },
};
