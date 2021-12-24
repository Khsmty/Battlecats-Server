import { Client } from 'discord.js';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    console.log('Bot started.');
    client.user?.setActivity('にゃんこ大戦争', { type: 'COMPETING' });

    setInterval(() => {
      client.user?.setActivity('にゃんこ大戦争', { type: 'COMPETING' });
    }, 1000 * 60 * 60);
  },
};
