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
const builders_1 = require('@discordjs/builders');
const discord_js_1 = require('discord.js');
const Bot_1 = __importDefault(require('../Components/Bot'));
module.exports = {
  data: new builders_1.SlashCommandBuilder()
    .setName('find')
    .setDescription('スレッドをタイトルから検索します。')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('検索キーワードを入力してください。')
        .setRequired(true)
    ),
  execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
      yield interaction.deferReply();
      const query = interaction.options.getString('query');
      const results = [];
      Bot_1.default.db.query(
        'SELECT * FROM `threads` WHERE `title` LIKE ?',
        [`%${query}%`],
        (e, rows) => {
          for (const row of rows) {
            results.push(`[${row.title}](${row.firstMessageUrl})`);
          }
          interaction.editReply({
            embeds: [
              new discord_js_1.MessageEmbed()
                .setTitle(`「${query}」の検索結果`)
                .setDescription(results.join('\n\n'))
                .setColor('BLURPLE'),
            ],
          });
        }
      );
    });
  },
};
