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
Object.defineProperty(exports, '__esModule', { value: true });
const builders_1 = require('@discordjs/builders');
module.exports = {
  data: new builders_1.SlashCommandBuilder()
    .setName('progress')
    .setDescription('メンバーの進行状況を検索します。')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('進行状況を検索するユーザーを入力してください。')
        .setRequired(true)
    ),
  execute(interaction) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      yield interaction.deferReply();
      const userId =
        (_a = interaction.options.getUser('user')) === null || _a === void 0
          ? void 0
          : _a.id;
      const messages = [];
      let beforeId;
      for (let i = 0; i < 5; i++) {
        try {
          const fetchMsgs = yield (_b =
            interaction.client.channels.cache.get('822771682157658122')) ===
            null || _b === void 0
            ? void 0
            : _b.messages.fetch({ limit: 100, before: beforeId });
          beforeId = fetchMsgs.last().id;
          const messageWithImages = fetchMsgs
            .filter(
              (msg) => msg.attachments.first() && msg.author.id === userId
            )
            .map((msg) => msg);
          for (const msg of messageWithImages) {
            messages.push(msg);
          }
        } catch (e) {
          continue;
        }
      }
      if (!messages[0])
        return interaction.editReply('進行状況が見つかりませんでした。');
      const images = [];
      messages
        .filter(
          (msg) => messages[0].createdTimestamp - msg.createdTimestamp < 300000
        )
        .forEach((msg) =>
          msg.attachments.forEach((attachment) => images.push(attachment.url))
        );
      yield interaction.editReply({ files: images });
    });
  },
};
