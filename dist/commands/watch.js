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
const builders_1 = require("@discordjs/builders");
const discord_together_1 = require("discord-together");
const discord_js_1 = require("discord.js");
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('watch')
        .setDescription('ボイスチャンネルでYouTubeを視聴します。(PCのみ)'),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.voice.channelId))
                return interaction.reply('先にボイスチャンネルに参加してください。');
            new discord_together_1.DiscordTogether(interaction.client)
                .createTogetherCode((_b = interaction.member) === null || _b === void 0 ? void 0 : _b.voice.channelId, 'youtube')
                .then((invite) => __awaiter(this, void 0, void 0, function* () {
                yield interaction.reply({
                    embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle('YouTube')
                            .setDescription('⚠️ モバイルアプリには対応していません。')
                            .setColor('YELLOW'),
                    ],
                    components: [
                        new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                            .setLabel('クリックして視聴開始')
                            .setStyle('LINK')
                            .setURL(invite.code)),
                    ],
                });
            }));
        });
    },
};
