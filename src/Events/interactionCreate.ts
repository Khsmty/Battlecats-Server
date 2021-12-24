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

      if (buttonId === 'sendVerifyURL') {
        interaction.reply({
          content: `以下のURLからユーザー認証を完了させてください。\n<https://battlecats-server.tubuanha.com/v/${interaction.user.id}>`,
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
