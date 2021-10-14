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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Bot_1 = __importDefault(require("../Components/Bot"));
const config_json_1 = __importDefault(require("../config.json"));
module.exports = {
    name: 'messageCreate',
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Botによるメッセージは無視する
            if (message.author.bot)
                return;
            // お知らせ自動公開
            if (message.channel.type === 'GUILD_NEWS') {
                message.crosspost();
            }
            // スレッド作成
            if (message.channelId === config_json_1.default.thread.createChannel) {
                if (!message.content) {
                    message.reply({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setTitle(':x: エラー')
                                .setDescription('メッセージ内容がないため、スレッドを作成できません。')
                                .setColor('RED'),
                        ],
                    });
                    return;
                }
                Bot_1.default.db.query('SELECT * FROM `threadChannels` WHERE `inUse` = ?', [false], (e, rows) => {
                    if (!rows[0]) {
                        message.reply({
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setTitle(':x: エラー')
                                    .setDescription('空きチャンネルがありません。管理スタッフへ連絡してください。')
                                    .setColor('RED'),
                            ],
                        });
                        return;
                    }
                    else {
                        const useChannelDb = rows[Math.floor(Math.random() * rows.length)];
                        Bot_1.default.db.query('UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?', [true, useChannelDb.channelId]);
                        const useChannel = message.client.channels.cache.get(useChannelDb.channelId);
                        useChannel.setParent(config_json_1.default.thread.openCategory);
                        useChannel.setName(message.content);
                        Bot_1.default.db.query('INSERT INTO `threads` (`channelId`, `ownerId`, `title`) VALUES (?, ?, ?)', [useChannel.id, message.author.id, message.content], (e) => {
                            Bot_1.default.db.query('SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?', [useChannel.id, false], (e, rows) => __awaiter(this, void 0, void 0, function* () {
                                const firstMessage = yield useChannel.send({
                                    content: `${message.author} スレッドを作成しました。`,
                                    embeds: [
                                        new discord_js_1.MessageEmbed()
                                            .setTitle('操作方法')
                                            .setDescription('`/close`: スレッドをCloseします。\n`/rename`: スレッドのタイトルを変更します。\n\n※スレッドの最終メッセージから2日が経過すると、自動でCloseされます。')
                                            .setColor('BLURPLE'),
                                        new discord_js_1.MessageEmbed()
                                            .setAuthor(`ID: ${rows[0].ID}`)
                                            .setTitle(message.content)
                                            .addField('作成者', `**${message.author.username}**#${message.author.discriminator} (${message.author})`)
                                            .setColor('YELLOW'),
                                    ],
                                });
                                const listMessage = yield message.reply({
                                    embeds: [
                                        new discord_js_1.MessageEmbed()
                                            .setAuthor(`ID: ${rows[0].ID}`)
                                            .setTitle(message.content)
                                            .addField('作成者', `**${message.author.username}**#${message.author.discriminator} (${message.author})`)
                                            .addField('リンク', `[最初のメッセージ](${firstMessage.url})`)
                                            .setColor('GREEN'),
                                    ],
                                });
                                Bot_1.default.db.query('UPDATE `threads` SET `firstMessageUrl` = ?, `listMessageId` = ? WHERE `channelId` = ? AND `closed` = ?', [firstMessage.url, listMessage.id, useChannel.id, false]);
                            }));
                        });
                    }
                });
            }
            if (message.channel.parentId === config_json_1.default.thread.openCategory) {
                Bot_1.default.db.query('SELECT * FROM `threadCloseQueue` WHERE `channelId` = ?', [message.channelId], (e, rows) => {
                    if (!rows || !rows[0])
                        return;
                    Bot_1.default.db.query('DELETE FROM `threadCloseQueue` WHERE `channelId` = ?', [
                        message.channelId,
                    ]);
                });
            }
            if (message.content.startsWith(config_json_1.default.prefix)) {
                const args = message.content
                    .slice(config_json_1.default.prefix.length)
                    .trim()
                    .split(/ +/);
                const command = args.shift().toLowerCase();
                if (!Bot_1.default.messageCommands.has(command))
                    return;
                try {
                    Bot_1.default.messageCommands.get(command).execute(message, args);
                }
                catch (error) {
                    console.error(error);
                    message.reply('エラーが発生しました。');
                }
            }
        });
    },
};
