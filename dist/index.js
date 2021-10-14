'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const discord_js_1 = require('discord.js');
const Bot_1 = __importDefault(require('./Components/Bot'));
const dotenv = __importStar(require('dotenv'));
const node_cron_1 = __importDefault(require('node-cron'));
const http_1 = __importDefault(require('http'));
const events_json_1 = __importDefault(require('./events.json'));
const fs_1 = __importDefault(require('fs'));
const config_json_1 = __importDefault(require('./config.json'));
const path_1 = __importDefault(require('path'));
// .envから値の読み込み
dotenv.config();
// Webサーバーの作成
http_1.default
  .createServer((req, res) => {
    res.end('It works!');
  })
  .listen(process.env.PORT || 8080);
const client = Bot_1.default.client;
// MySQLサーバーへ接続
Bot_1.default.db.connect();
node_cron_1.default.schedule('0,15 * * * *', () =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    for (const event of events_json_1.default) {
      const timeLag = Date.now() - Date.parse(event.date);
      if (timeLag >= -60000 && timeLag <= 600000) {
        const mentionRole =
          (_b =
            (_a = client.guilds.cache.get('755774191613247568')) === null ||
            _a === void 0
              ? void 0
              : _a.roles.cache
                  .filter((role) => role.name.includes(event.role))
                  .first()) === null || _b === void 0
            ? void 0
            : _b.id;
        const notifyChannel = client.channels.cache.get('805732155606171658');
        notifyChannel === null || notifyChannel === void 0
          ? void 0
          : notifyChannel.send(`<@&${mentionRole}> ${event.name}`);
      }
    }
    let threadOpenCategory = client.channels.cache.get('756959797806366851');
    threadOpenCategory = threadOpenCategory.children.map((channel) => channel);
    for (const channel of threadOpenCategory) {
      let lastMessage = yield channel.messages.fetch({ limit: 1 });
      lastMessage = lastMessage.first();
      if (lastMessage.createdTimestamp + 259200000 < Date.now()) {
        channel.send({
          embed: [
            new discord_js_1.MessageEmbed()
              .setTitle('Close済み')
              .setDescription(
                '3日以上メッセージがなかったため、自動Closeしました。\nこのスレッドを引き続き使用したい場合は、`/reopen` コマンドでスレッドをReopenしてください。'
              )
              .setColor('RED'),
          ],
        });
        channel.setParent('759465634236727316');
      }
    }
  })
);
setInterval(() => {
  Bot_1.default.db.query('SELECT * FROM `threadCloseQueue`', (e, rows) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      if (!rows || !rows[0]) return;
      for (const row of rows) {
        if (row.date <= Date.now()) {
          const channel = client.channels.cache.get(row.channelId);
          yield channel.setName('空きチャンネル');
          yield channel.setParent(config_json_1.default.threadClosedCategoryId);
          channel.send({
            embeds: [
              new discord_js_1.MessageEmbed()
                .setDescription('Closeされました。')
                .setColor('RED'),
            ],
          });
          // スレッド一覧の埋め込み色を赤色にする
          (_a = client.channels.cache.get(
            config_json_1.default.threadCreateChannel
          )) === null || _a === void 0
            ? void 0
            : _a.messages.fetch(rows[0].listMessageId).then((msg) => {
                msg.edit({
                  embeds: [msg.embeds[0].setColor('RED')],
                });
              });
          // Closeキューから削除
          Bot_1.default.db.query(
            'DELETE FROM `threadCloseQueue` WHERE `channelId` = ?',
            [row.channelId]
          );
          // チャンネルを空きチャンネルとしてマーク
          Bot_1.default.db.query(
            'UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?',
            [false, row.channelId]
          );
          // スレッドをClose済としてマーク
          Bot_1.default.db.query(
            'UPDATE `threads` SET `closed` = ? WHERE `channelId` = ? AND `closed` = ?',
            [true, row.channelId, false]
          );
        }
      }
    })
  );
}, 600000);
const commandFiles = fs_1.default
  .readdirSync(path_1.default.resolve(__dirname, 'Commands'))
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  Bot_1.default.commands.set(command.data.name, command);
}
const messageCommandFiles = fs_1.default
  .readdirSync(path_1.default.resolve(__dirname, 'MessageCommands'))
  .filter((file) => file.endsWith('.js'));
for (const file of messageCommandFiles) {
  const command = require(`./MessageCommands/${file}`);
  Bot_1.default.messageCommands.set(command.name, command);
}
const eventFiles = fs_1.default
  .readdirSync(path_1.default.resolve(__dirname, 'Events'))
  .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./Events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
client.login(process.env.DISCORD_TOKEN);
