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
const discord_js_1 = require("discord.js");
module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (newMessage.author.bot)
                return;
            const messageChannel = newMessage.channel;
            if (newMessage.guildId === '755774191613247568' ||
                newMessage.guildId === '796606104410783784') {
                (_a = newMessage.client.channels.cache.get('872863093359800330')) === null || _a === void 0 ? void 0 : _a.send({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle('メッセージ編集')
                            .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({ dynamic: true }))
                            .setDescription(`メッセージに移動: [こちら](${newMessage.url})`)
                            .addField('編集前', oldMessage.content || '*なし*')
                            .addField('編集後', newMessage.content || '*なし*')
                            .addField('添付ファイル', newMessage.attachments
                            .map((a) => `[URL](${a.proxyURL})`)
                            .join(', ') || '*なし*')
                            .addField('チャンネル', `${messageChannel} (#${messageChannel.name}/${messageChannel.id})`, true)
                            .addField('カテゴリ', `${messageChannel.parent ? messageChannel.parent.name : '*なし*'} (${messageChannel.parentId || '*なし*'})`, true)
                            .setTimestamp()
                            .setColor('BLURPLE'),
                    ],
                }).catch(() => { });
            }
        });
    },
};
