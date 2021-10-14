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
const discord_js_1 = require("discord.js");
const googleapis_1 = require("googleapis");
const customSearch = googleapis_1.google.customsearch('v1');
googleapis_1.google.options({ auth: process.env.GOOGLE_API_KEY });
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('db')
        .setDescription('にゃんこ大戦争データベースを検索します。')
        .addStringOption((option) => option
        .setName('query')
        .setDescription('検索キーワードを入力してください。')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = interaction.options.getString('query');
            const result = yield customSearch.cse.list({
                cx: 'd5d85493077d946a9',
                q: query || undefined,
            });
            const results = result.data.items
                ? result.data.items
                    .map((item) => `[${item.title.replace('にゃんこ大戦争DB ', '')}](${item.link})`)
                    .slice(0, 5)
                : [];
            yield interaction.reply({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setTitle(`「${query}」の検索結果`)
                        .setDescription(results[0] ? results.join('\n\n') : '*検索結果がありませんでした*')
                        .setColor('YELLOW'),
                ],
                components: [
                    new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                        .setLabel('他の検索結果')
                        .setStyle('LINK')
                        .setURL(`https://www.google.co.jp/search?q=${query}+site:battlecats-db.com`)),
                ],
            });
        });
    },
};
