import { GuildMember, TextChannel } from 'discord.js';
import config from '../config.json';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    if (member.user.bot || member.guild.id !== config.guildId) return;

    (member.client.channels.cache.get(config.welcomeChannel) as TextChannel).send(
      `${member} さん、**${member.guild.name}** へようこそ！\n` +
        'まず、<#755803035564900372> をご確認ください。'
    );
  },
};
