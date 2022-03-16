import { Message } from 'discord.js';
import { execSync } from 'child_process';
import config from '../config.json';

module.exports = {
  name: 'reboot',
  async execute(message: Message, args: string[]) {
    if (!config.ownerId.includes(message.author.id)) return;

    if (args[0] === 'update') {
      await message.channel.send('Updating...');

      let buf = execSync('git pull');

      await message.channel.send('Result:\n```\n' + buf.toString() + '\n```');
      await message.channel.send('Compiling...');

      buf = execSync('npm run build');

      await message.channel.send('Result:\n```\n' + buf.toString() + '\n```');
    }

    await message.channel.send('Rebooting...');

    process.exit();
  },
};
