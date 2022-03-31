import { Client } from 'discord.js';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    console.log('Bot started.');

    setInterval(() => {
      client.user?.setActivity('わんこ大戦争', { type: 'COMPETING' });
    }, 1000 * 60 * 60);
  },
};
