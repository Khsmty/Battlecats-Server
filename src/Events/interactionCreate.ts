import {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  Interaction,
  GuildMemberRoleManager,
} from 'discord.js';
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
      const targetMemberRoles = interaction.member!.roles as GuildMemberRoleManager;
      const buttonId = interaction.customId;

      if (buttonId.startsWith('rolepanel-')) {
        const panelType: string = buttonId.slice(10);
        const rolesData = require(`../Data/Rolepanel/${panelType}.json`);
        const messages: any = {
          channel: '表示/非表示にするチャンネルを選択してください。',
          progress: '自分に当てはまる進行状況を選択してください。',
          role: '自分に付けたいロールを選択してください。',
          event: '通知を受け取りたいイベントを選択してください。',
        };

        const selectOptions: any[] = [];
        for (const roleData of rolesData) {
          selectOptions.push({
            label: roleData.name,
            value: roleData.id,
            emoji: roleData.emoji,
            default: targetMemberRoles.cache.has(roleData.id),
          });
        }

        interaction.reply({
          embeds: [new MessageEmbed().setDescription(messages[panelType]).setColor('BLURPLE')],
          components: [
            new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setCustomId(`rolepanel-${panelType}`)
                .setMinValues(0)
                .setMaxValues(selectOptions.length)
                .addOptions(selectOptions)
            ),
          ],
          ephemeral: true,
        });
      }

      if (buttonId === 'rule-en') {
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('Welcome')
              .setDescription(
                'Welcome to the "アプリにゃんこ大戦争", a fan community of The battle cats!\n' +
                  '\n' +
                  'We have many members, from advanced players to beginners.\n' +
                  '\n' +
                  'The primary language of this server is Japanese.\n' +
                  'Many of our members do not speak English.\n' +
                  'Please be considerate by using [Google Translate](https://translate.google.com/).\n' +
                  '\n' +
                  '> **What you can do with this server**\n' +
                  '- Questions and discussions about the The battle cats\n' +
                  '- Post your creative works\n' +
                  '- Score events and other events'
              )
              .setColor('#fffab0'),
            new MessageEmbed()
              .setTitle('Rules')
              .setDescription(
                'The following actions will result in usage restrictions on the server.\n' +
                  'Please use the server with good morals and manners.\n' +
                  '\n' +
                  "- Violation of the [Discord's terms of service](https://discord.com/terms).\n" +
                  '- Violation of the [PONOS application license agreement](https://ponos.s3.dualstack.ap-northeast-1.amazonaws.com/reg/license/index.html).\n' +
                  '- Requesting or exposing personal information.\n' +
                  '- Attachment of content that prohibits viewing by people under 18 years old.\n' +
                  '- Other items that the administrator deems inappropriate.\n' +
                  '\n' +
                  'If you find any rule violation, please contact <#815703267765780491>.\n' +
                  '* In general, we cannot intervene in personal problems.'
              )
              .setColor('#c0ffb0'),
            new MessageEmbed()
              .setDescription(
                '> **About Strike**\n' +
                  'This is the number of points for violations. It is given when there is a rule violation.\n' +
                  'When Strikes accumulate, punishments are automatically applied.\n' +
                  '\n' +
                  '> **BCU and spoiler information**\n' +
                  'Please be sure to post any BCU (Battle Cats Ultimate) scraps or spoiler information at <#760081975255367711>.\n' +
                  '\n' +
                  'Some people do not like spoilers and are looking forward to the official announcement. We ask for your cooperation.'
              )
              .setColor('#c0ffb0'),
            new MessageEmbed()
              .setTitle(':beginner: Dear Newcomer')
              .setDescription(
                'Write a greeting and introduce yourself!\n' +
                  'It lets people know who you are.\n' +
                  '↳ <#755803561715302490>\n' +
                  '\n' +
                  "Let's post Officer's Club and Cat Dictionary!\n" +
                  'If you know the characters you have in advance, it will be easier for them to advise you.\n' +
                  '↳ <#822771682157658122>\n' +
                  '\n' +
                  'You can customize the channels you view, the icon to the right of your name,\n' +
                  'and event notifications.\n' +
                  '↳ <#879299491117817866>'
              )
              .setColor('#b0eaff'),
          ],
          ephemeral: true,
        });
      }
    } else if (interaction.isSelectMenu()) {
      const targetMemberRoles = interaction.member!.roles as GuildMemberRoleManager;
      const selectId = interaction.customId;

      if (selectId.startsWith('rolepanel-')) {
        const panelType: string = selectId.slice(10);
        const rolesData = require(`../Data/Rolepanel/${panelType}.json`);

        const panelRoles = rolesData.map((role: { id: string }) => role.id);
        const userRoles = targetMemberRoles.cache
          .map((role) => role.id)
          .filter((f) => panelRoles.includes(f));

        if (userRoles.length < interaction.values.length) {
          targetMemberRoles.add(interaction.values.filter((i) => userRoles.indexOf(i) === -1));
        } else if (userRoles.length === interaction.values.length) {
          targetMemberRoles.remove(userRoles);
          targetMemberRoles.add(interaction.values);
        } else {
          targetMemberRoles.remove(userRoles.filter((i) => interaction.values.indexOf(i) === -1));
        }

        interaction.update({
          embeds: [
            new MessageEmbed()
              .setTitle(':white_check_mark: 成功')
              .setDescription('設定を保存しました！')
              .setColor('GREEN'),
          ],
          components: [],
        });
      }
    }
  },
};
