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
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const Bot_1 = __importDefault(require("../Components/Bot"));
const config_json_1 = __importDefault(require("../config.json"));
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('close')
        .setDescription('スレッドをCloseします。(取り消し不可)'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandChannel = interaction.channel;
            if ((commandChannel === null || commandChannel === void 0 ? void 0 : commandChannel.parentId) !== config_json_1.default.thread.openCategory) {
                return interaction.reply({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle(':x: エラー')
                            .setDescription('このチャンネルはCloseできません。')
                            .setColor('RED'),
                    ],
                    ephemeral: true,
                });
            }
            Bot_1.default.db.query('SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?', [interaction.channelId, false], (e, rows) => __awaiter(this, void 0, void 0, function* () {
                if (rows[0].ownerId !== interaction.user.id &&
                    !interaction.member.permissions.has('ADMINISTRATOR')) {
                    return interaction.reply({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setTitle(':x: エラー')
                                .setDescription('このスレッドをCloseする権限がありません。')
                                .setColor('RED'),
                        ],
                        ephemeral: true,
                    });
                }
                else {
                    interaction.reply({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setTitle(':white_check_mark: 成功')
                                .setDescription('1時間後にCloseされます。\nメッセージを送信するとCloseをキャンセルできます。')
                                .setColor('GREEN'),
                        ],
                    });
                    Bot_1.default.db.query('INSERT INTO `threadCloseQueue` (`channelId`, `date`, `listMessageId`) VALUES (?, ?, ?)', [
                        interaction.channelId,
                        new Date(Date.now() + 3600000),
                        rows[0].listMessageId,
                    ]);
                }
            }));
        });
    },
};
