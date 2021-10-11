import { MessageEmbed, TextChannel, Role } from 'discord.js';
import Bot from './Components/Bot';
import { config } from 'dotenv';
import cron from 'node-cron';
import http from 'http';
import events from './events.json';
import fs from 'fs';

// dotenv
config();

// Webサーバーの作成
http
  .createServer((req, res) => {
    res.end('It works!');
  })
  .listen(process.env.PORT || 8080);

const client = Bot.client;

// MySQLサーバーへ接続
Bot.db.connect();

cron.schedule('0,15 * * * *', async () => {
  for (const event of events) {
    const timeLag = Date.now() - Date.parse(event.date);

    if (timeLag >= -60000 && timeLag <= 600000) {
      const mentionRole = client.guilds.cache
        .get('755774191613247568')
        ?.roles.cache.filter((role: Role) => role.name.includes(event.role))
        .first()?.id;

      const notifyChannel: any = await client.channels.cache.get('805732155606171658');
      notifyChannel?.send(`<@&${mentionRole}> ${event.name}`);
    }
  }

  let threadOpenCategory: any = client.channels.cache.get('756959797806366851');
  threadOpenCategory = threadOpenCategory.children.map((channel: TextChannel) => channel);

  for (const channel of threadOpenCategory) {
    let lastMessage = await channel.messages.fetch({ limit: 1 });
    lastMessage = lastMessage.first();

    if (lastMessage.createdTimestamp + 259200000 < Date.now()) {
      channel.send({
        embed: [
          new MessageEmbed()
            .setTitle('Close済み')
            .setDescription(
              '3日以上メッセージがなかったため、自動Closeしました。\nこのスレッドを引き続き使用したい場合は、`/reopen` コマンドでスレッドをReopenしてください。'
            )
            .setColor('RED'),
        ],
      });
      channel.setParent('759465634236727316');
    }
  }
});

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  Bot.commands.set(command.data.name, command);
}

const messageCommandFiles = fs.readdirSync('./messageCommands').filter((file) => file.endsWith('.js'));

for (const file of messageCommandFiles) {
  const command = require(`./messageCommands/${file}`);
  Bot.messageCommands.set(command.name, command);
}

const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
