'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const Bot_1 = __importDefault(require('../Components/Bot'));
module.exports = {
  name: 'dojo',
  execute(message, args) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      if (
        !((_a = message.member) === null || _a === void 0
          ? void 0
          : _a.roles.cache.has('868797324699242507')) &&
        !((_b = message.member) === null || _b === void 0
          ? void 0
          : _b.permissions.has('ADMINISTRATOR'))
      )
        return;
      if (!args[0]) return message.reply('必要な引数が不足しています。');
      if (args[0] === 'add') {
        if (!args[1] || !args[2] || !args[3] || !message.attachments.first())
          return message.reply('必要な引数が不足しています。');
        const sendCh = message.client.channels.cache.get('893791664278220840');
        const sendImage = yield sendCh === null || sendCh === void 0
          ? void 0
          : sendCh.send({
              files: [
                {
                  attachment:
                    (_c = message.attachments.first()) === null || _c === void 0
                      ? void 0
                      : _c.url,
                },
              ],
            });
        Bot_1.default.db.query(
          'SELECT * FROM `dojo` WHERE `userId` = ? AND `type` = ?',
          [args[2], args[1]],
          (e, rows) =>
            __awaiter(this, void 0, void 0, function* () {
              if (!rows[0]) {
                Bot_1.default.db.query(
                  'INSERT INTO `dojo` (`userId`, `type`, `imageUrl`, `score`) VALUES (?, ?, ?, ?)',
                  [args[2], args[1], sendImage.attachments.first().url, args[3]]
                );
                message.reply('スコアを新規登録しました。');
              } else {
                Bot_1.default.db.query(
                  'UPDATE `dojo` SET `imageUrl` = ?, `score` = ? WHERE `userId` = ? AND `type` = ?',
                  [sendImage.attachments.first().url, args[3], args[2], args[1]]
                );
                message.reply('スコアを更新しました。');
              }
            })
        );
      } else if (args[0] === 'sort') {
        if (!args[1]) return message.reply('必要な引数が不足しています。');
        Bot_1.default.db.query(
          'SELECT * FROM `dojo` WHERE `type` = ? ORDER BY `score` DESC',
          [args[1]],
          (e, rows) =>
            __awaiter(this, void 0, void 0, function* () {
              if (!rows[0])
                return message.reply('スコアが登録されていません。');
              for (let i = 0; i < rows.length; i++) {
                const userData = yield message.client.users.fetch(
                  rows[i].userId
                );
                yield message.channel.send({
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
            })
        );
      }
    });
  },
};
