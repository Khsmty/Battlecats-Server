import { MessageEmbed, MessageActionRow, MessageSelectMenu, Interaction, GuildMemberRoleManager } from 'discord.js';
import Bot from '../Components/Bot';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      const command = Bot.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        return interaction
          .reply({
            content: 'エラーが発生しました。',
            ephemeral: true,
          })
          .catch(() => interaction.editReply('エラーが発生しました。'));
      }
    } else if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'rule-en': {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('Welcome')
                .setDescription(
                  'Welcome to the "アプリにゃんこ大戦争", a fan community of The battle cats!\n\nWe have many members, from advanced players to beginners.\n\nThe primary language of this server is Japanese.\nMany of our members do not speak English.\nPlease be considerate by using [Google Translate](https://translate.google.com/).\n\n> **What you can do with this server**\n- Questions and discussions about the The battle cats\n- Post your creative works\n- Score events and other events'
                )
                .setColor('#fffab0'),
              new MessageEmbed()
                .setTitle('Rules')
                .setDescription(
                  "The following actions will result in usage restrictions on the server.\nPlease use the server with good morals and manners.\n\n- Violation of the [Discord's terms of service](https://discord.com/terms).\n- Violation of the [PONOS application license agreement](https://ponos.s3.dualstack.ap-northeast-1.amazonaws.com/reg/license/index.html).\n- Requesting or exposing personal information.\n- Attachment of content that prohibits viewing by people under 18 years old.\n- Other items that the administrator deems inappropriate.\n\nIf you find any rule violation, please contact <#815703267765780491>.\n* In general, we cannot intervene in personal problems."
                )
                .setColor('#c0ffb0'),
              new MessageEmbed()
                .setDescription(
                  '> **About Strike**\nThis is the number of points for violations. It is given when there is a rule violation.\nWhen Strikes accumulate, punishments are automatically applied.\n\n> **BCU and spoiler information**\nPlease be sure to post any BCU (Battle Cats Ultimate) scraps or spoiler information at <#760081975255367711>.\n\nSome people do not like spoilers and are looking forward to the official announcement. We ask for your cooperation.'
                )
                .setColor('#c0ffb0'),
              new MessageEmbed()
                .setTitle(':beginner: Dear Newcomer')
                .setDescription(
                  "Write a greeting and introduce yourself!\nIt lets people know who you are.\n↳ <#755803561715302490>\n\nLet's post Officer's Club and Cat Dictionary!\nIf you know the characters you have in advance, it will be easier for them to advise you.\n↳ <#822771682157658122>\n\nYou can customize the channels you view, the icon to the right of your name,\nand event notifications.\n↳ <#879299491117817866>"
                )
                .setColor('#b0eaff'),
            ],
            ephemeral: true,
          });
          break;
        }
        case 'chrole': {
          interaction.reply({
            content: '表示/非表示にするチャンネルを選ぶにゃ～(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('chrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: 'ネタバレを非表示',
                      value: '757465906786861166',
                      emoji: '❌',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('757465906786861166'),
                    },
                    {
                      label: '宣伝を非表示',
                      value: '757465944636260463',
                      emoji: '❌',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('757465944636260463'),
                    },
                    {
                      label: 'にゃんこ以外の雑談を非表示',
                      value: '757465986340225134',
                      emoji: '❌',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('757465986340225134'),
                    },
                    {
                      label: '進捗状況・入手キャラの報告を非表示',
                      value: '889288956015939595',
                      emoji: '❌',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('889288956015939595'),
                    },
                    {
                      label: '他ゲーチャンネルの設定を表示',
                      value: '884754990462279730',
                      emoji: '⭕',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('884754990462279730'),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ])
              ),
            ],
          });
          break;
        }
        case 'pgrole': {
          interaction
            .reply({
              content: '現在の進行状況を選ぶにゃ～',
              ephemeral: true,
              components: [
                new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId('pgrole')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions([
                      {
                        label: '未来編3章・大脱走を未クリア',
                        value: '785121194063036417',
                        emoji: '1️⃣',
                        default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('785121194063036417'),
                      },
                      {
                        label: '未来編3章・大脱走をクリア済み',
                        value: '785123537849155664',
                        emoji: '2️⃣',
                        default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('785123537849155664'),
                      },
                      {
                        label: '宇宙編3章・古代の呪いをクリア済み',
                        value: '797383308437749771',
                        emoji: '3️⃣',
                        default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('797383308437749771'),
                      },
                      {
                        label: '魔界編・大厄災のはじまりをクリア済み',
                        value: '785120614435651624',
                        emoji: '4️⃣',
                        default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('785120614435651624'),
                      },
                      {
                        label: 'アプデ待ち勢',
                        value: '884397503829671958',
                        emoji: '5️⃣',
                        default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('884397503829671958'),
                      },
                    ])
                ),
              ],
            })
            .catch((e) => {
              interaction.reply({
                content:
                  '進行状況ロールが2つ以上ついているため設定できません。\nリーダー又はサブリーダーにロールの消去を依頼してください。',
                ephemeral: true,
              });
            });
          break;
        }
        case 'rlrole': {
          interaction.reply({
            content: 'ロールを選ぶにゃ～(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('rlrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: 'にゃんこ関係について教えたい人',
                      value: '757466064702537748',
                      emoji: '🧑‍🏫',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('757466064702537748'),
                    },
                    {
                      label: '画像・動画リクエストOK',
                      value: '856005613368246325',
                      emoji: '🖼️',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('856005613368246325'),
                    },
                    {
                      label: 'メンションNG',
                      value: '818062825024520243',
                      emoji: '❌',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('818062825024520243'),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ])
              ),
            ],
          });
          break;
        }
        case 'eventrole': {
          interaction.reply({
            content: '開始時に通知を受け取るイベントを選ぶにゃ～(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('eventrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: '逆襲のカバちゃん',
                      value: '871410296705658930',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871410296705658930'),
                    },
                    {
                      label: '極ゲリラ経験値にゃ！',
                      value: '871410800575787041',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871410800575787041'),
                    },
                    {
                      label: '超極ゲリラ経験値にゃ！',
                      value: '871410888429674536',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871410888429674536'),
                    },
                    {
                      label: 'トレジャーフェスティバル(日本編)',
                      value: '871411418459684875',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411418459684875'),
                    },
                    {
                      label: 'トレジャーフェスティバル(未来編)',
                      value: '871411529482907679',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411529482907679'),
                    },
                    {
                      label: 'トレジャーフェスティバル(宇宙編)',
                      value: '871411632365006918',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411632365006918'),
                    },
                    {
                      label: '悪魔ネコステージ',
                      value: '876131805827301457',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('876131805827301457'),
                    },
                    {
                      label: '悪魔タンクネコステージ',
                      value: '876132058936774676',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('876132058936774676'),
                    },
                    {
                      label: '開眼のネコフラワー',
                      value: '876132175613935656',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('876132175613935656'),
                    },
                    {
                      label: '悪魔バトルネコ',
                      value: '871411756017279096',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411756017279096'),
                    },
                    {
                      label: '女王の研究報告1',
                      value: '871411821985267732',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411821985267732'),
                    },
                    {
                      label: '女王の研究報告2',
                      value: '871411874497961994',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411874497961994'),
                    },
                    {
                      label: '女王の研究報告3 (イベント1)',
                      value: '885915916213305375',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('885915916213305375'),
                    },
                    {
                      label: '女王の研究報告4 (イベント2)',
                      value: '885915963860598844',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('885915963860598844'),
                    },
                    {
                      label: '未設定 (イベント3)',
                      value: '885915967937474652',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('885915967937474652'),
                    },
                    {
                      label: '未設定 (イベント4)',
                      value: '871411924460531742',
                      emoji: '🔔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('871411924460531742'),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ])
              ),
            ],
          });
          break;
        }
        case 'gmrole': {
          interaction.reply({
            content: '表示させたい他ゲーチャンネルを選ぶにゃ〜(複数選択可)',
            ephemeral: true,
            components: [
              new MessageActionRow().addComponents(
                new MessageSelectMenu()
                  .setCustomId('gmrole')
                  .setMinValues(1)
                  .addOptions([
                    {
                      label: '大乱闘スマッシュブラザーズ',
                      value: '868827768203382814',
                      emoji: '⚔',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('868827768203382814'),
                    },
                    {
                      label: 'ポケットモンスター',
                      value: '884724976173842502',
                      emoji: '⚾',
                      default: (interaction.member!.roles as GuildMemberRoleManager).cache.has('884724976173842502'),
                    },
                    {
                      label: '全ロールを一括削除',
                      value: 'clear',
                      emoji: '🗑️',
                    },
                  ])
              ),
            ],
          });
          break;
        }
      }
    } else if (interaction.isSelectMenu()) {
      switch (interaction.customId) {
        case 'chrole': {
          const chRoles = [
            '757465906786861166',
            '757465944636260463',
            '757465986340225134',
            '889288956015939595',
            '884754990462279730',
          ];

          const userRoles = (interaction.member!.roles as GuildMemberRoleManager).cache
            .map((role) => role.id)
            .filter((f) => chRoles.includes(f));

          if (interaction.values.includes('clear'))
            await (interaction.member!.roles as GuildMemberRoleManager).remove(userRoles);
          else if (userRoles.length < interaction.values.length)
            (interaction.member!.roles as GuildMemberRoleManager).add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1)
            );
          else
            (interaction.member!.roles as GuildMemberRoleManager).remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1)
            );

          await interaction.update({
            content: '変更を保存したにゃ！',
            components: [],
          });
          break;
        }
        case 'pgrole': {
          const pgRoles = [
            '785121194063036417',
            '785123537849155664',
            '797383308437749771',
            '785120614435651624',
            '884397503829671958',
          ];

          await (interaction.member!.roles as GuildMemberRoleManager).remove(
            pgRoles.filter((i) => interaction.values.indexOf(i) === -1)
          );
          await (interaction.member!.roles as GuildMemberRoleManager).add(interaction.values[0]);

          await interaction.update({
            content: '変更を保存したにゃ！',
            components: [],
          });
          break;
        }
        case 'rlrole': {
          const customRoles = ['757466064702537748', '856005613368246325', '818062825024520243'];

          const userRoles = (interaction.member!.roles as GuildMemberRoleManager).cache
            .map((role) => role.id)
            .filter((f) => customRoles.includes(f));

          if (interaction.values.includes('clear'))
            await (interaction.member!.roles as GuildMemberRoleManager).remove(userRoles);
          else if (userRoles.length < interaction.values.length)
            (interaction.member!.roles as GuildMemberRoleManager).add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1)
            );
          else
            (interaction.member!.roles as GuildMemberRoleManager).remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1)
            );

          await interaction.update({
            content: '変更を保存したにゃ！',
            components: [],
          });
          break;
        }
        case 'eventrole': {
          const eventRoles = [
            '876132175613935656',
            '871411756017279096',
            '871410296705658930',
            '871411874497961994',
            '871411632365006918',
            '876132058936774676',
            '871411821985267732',
            '871411418459684875',
            '871411529482907679',
            '885915916213305375',
            '871410800575787041',
            '876131805827301457',
            '871411924460531742',
            '871410888429674536',
            '885915967937474652',
            '885915963860598844',
          ];
          const userRoles = (interaction.member!.roles as GuildMemberRoleManager).cache
            .map((role) => role.id)
            .filter((f) => eventRoles.includes(f));

          if (interaction.values.includes('clear'))
            await (interaction.member!.roles as GuildMemberRoleManager).remove(userRoles);
          else if (userRoles.length < interaction.values.length)
            (interaction.member!.roles as GuildMemberRoleManager).add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1)
            );
          else
            (interaction.member!.roles as GuildMemberRoleManager).remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1)
            );

          await interaction.update({
            content: '変更を保存したにゃ！',
            components: [],
          });
          break;
        }
        case 'gmrole': {
          const gmRoles = ['868827768203382814', '884724976173842502'];

          const userRoles = (interaction.member!.roles as GuildMemberRoleManager).cache
            .map((role) => role.id)
            .filter((f) => gmRoles.includes(f));

          if (interaction.values.includes('clear'))
            await (interaction.member!.roles as GuildMemberRoleManager).remove(userRoles);
          else if (userRoles.length < interaction.values.length)
            (interaction.member!.roles as GuildMemberRoleManager).add(
              interaction.values.filter((i) => userRoles.indexOf(i) === -1)
            );
          else
            (interaction.member!.roles as GuildMemberRoleManager).remove(
              userRoles.filter((i) => interaction.values.indexOf(i) === -1)
            );

          await interaction.update({
            content: '変更を保存したにゃ！',
            components: [],
          });
          break;
        }
      }
    }
  },
};
