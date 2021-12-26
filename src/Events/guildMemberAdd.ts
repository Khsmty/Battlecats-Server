import { GuildMember, AnyChannel } from 'discord.js';
import config from '../config.json';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    if (member.user.bot || member.guild.id !== config.guildId) return;

    const welcomeChannel: AnyChannel | undefined = member.client.channels.cache.get(
      config.welcomeChannel
    );

    if (!welcomeChannel || !welcomeChannel.isText()) return;

    welcomeChannel.send(
      `${member} さん、**${member.guild.name}** へようこそ！\n` +
        '<#755803035564900372> をご確認の上、<#923802812956147753> をお願いいたします！'
    );
  },
};
