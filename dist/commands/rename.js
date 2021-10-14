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
        .setName('rename')
        .setDescription('スレッドのタイトルを変更します。')
        .addStringOption((option) => option
        .setName('new-title')
        .setDescription('スレッドの新しいタイトルを入力してください。')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTitle = interaction.options.getString('new-title');
            const commandChannel = interaction.channel;
            if ((commandChannel === null || commandChannel === void 0 ? void 0 : commandChannel.parentId) !== config_json_1.default.threadOpenCategoryId) {
                return interaction.reply({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle(':x: エラー')
                            .setDescription('このチャンネルはスレッドではありません。')
                            .setColor('RED'),
                    ],
                    ephemeral: true,
                });
            }
            Bot_1.default.db.query('SELECT * FROM `threads` WHERE `channelId` = ? AND `closed` = ?', [interaction.channelId, false], (e, rows) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                if (rows[0].ownerId !== interaction.user.id &&
                    !interaction.member.permissions.has('ADMINISTRATOR')) {
                    return interaction.reply({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setTitle(':x: エラー')
                                .setDescription('このスレッドのタイトルを変更する権限がありません。')
                                .setColor('RED'),
                        ],
                        ephemeral: true,
                    });
                }
                else {
                    Bot_1.default.db.query('UPDATE `threads` SET `title` = ? WHERE `channelId` = ? AND `closed` = ?', [newTitle, interaction.channelId, false]);
                    interaction.channel.setName(newTitle);
                    (_a = interaction.client.channels.cache.get(config_json_1.default.threadCreateChannel)) === null || _a === void 0 ? void 0 : _a.messages.fetch(rows[0].listMessageId).then((msg) => {
                        msg.edit({
                            embeds: [msg.embeds[0].setTitle(newTitle)],
                        });
                    });
                    (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.messages.fetch(rows[0].firstMessageUrl.split('/').pop()).then((msg) => {
                        msg.edit({
                            embeds: [msg.embeds[0], msg.embeds[1].setTitle(newTitle)],
                        });
                    });
                    interaction.reply({
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setTitle(':white_check_mark: 成功')
                                .setDescription(`スレッドのタイトルを「${newTitle}」に変更しました。`)
                                .setColor('GREEN'),
                        ],
                    });
                }
            }));
        });
    },
};
