import { Client } from 'discord.js';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
    client.user?.setActivity('にゃんこ大戦争', { type: 'COMPETING' });
  },
};
