"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const discord_js_1 = require("discord.js");
module.exports = {
    name: 'eval',
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.author.id !== '723052392911863858')
                return;
            try {
                // eslint-disable-next-line no-eval
                const evaled = yield eval(args.join(' '));
                message
                    .reply({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle('出力')
                            .setDescription(`\`\`\`js\n${(0, util_1.inspect)(evaled)}\n\`\`\``)
                            .setColor('BLURPLE'),
                    ],
                })
                    .catch((e) => {
                    console.log((0, util_1.inspect)(evaled));
                    message.reply('コンソールへ出力しました。');
                });
            }
            catch (e) {
                message.reply({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle('エラー')
                            .setDescription(`\`\`\`js\n${e}\n\`\`\``)
                            .setColor('RED'),
                    ],
                });
            }
        });
    },
};
