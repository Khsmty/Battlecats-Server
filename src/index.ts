import { MessageEmbed, TextChannel, Role } from 'discord.js';
import Bot from './Components/Bot';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import http from 'http';
import events from './events.json';
import fs from 'fs';
import config from './config.json';

// .envから値の読み込み
dotenv.config();

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

      const notifyChannel: any =
        client.channels.cache.get('805732155606171658');
      notifyChannel?.send(`<@&${mentionRole}> ${event.name}`);
    }
  }

  let threadOpenCategory: any = client.channels.cache.get('756959797806366851');
  threadOpenCategory = threadOpenCategory.children.map(
    (channel: TextChannel) => channel
  );

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

setInterval(() => {
  Bot.db.query(
    'SELECT * FROM `threadCloseQueue`',
    async (e: any, rows: any) => {
      if (!rows || !rows[0]) return;

      for (const row of rows) {
        if (row.date <= Date.now()) {
          const channel = client.channels.cache.get(
            row.channelId
          ) as TextChannel;

          await channel.setName('空きチャンネル');
          await channel.setParent(config.threadClosedCategoryId);

          channel.send({
            embeds: [
              new MessageEmbed()
                .setDescription('Closeされました。')
                .setColor('RED'),
            ],
          });

          // スレッド一覧の埋め込み色を赤色にする
          (
            client.channels.cache.get(config.threadCreateChannel) as TextChannel
          )?.messages
            .fetch(rows[0].listMessageId)
            .then((msg) => {
              msg.edit({
                embeds: [msg.embeds[0].setColor('RED')],
              });
            });

          // Closeキューから削除
          Bot.db.query('DELETE FROM `threadCloseQueue` WHERE `channelId` = ?', [
            row.channelId,
          ]);
          // チャンネルを空きチャンネルとしてマーク
          Bot.db.query(
            'UPDATE `threadChannels` SET `inUse` = ? WHERE `channelId` = ?',
            [false, row.channelId]
          );
          // スレッドをClose済としてマーク
          Bot.db.query(
            'UPDATE `threads` SET `closed` = ? WHERE `channelId` = ? AND `closed` = ?',
            [true, row.channelId, false]
          );
        }
      }
    }
  );
}, 10000); // 600000);

const commandFiles = fs
  .readdirSync('./dist/Commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  Bot.commands.set(command.data.name, command);
}

const messageCommandFiles = fs
  .readdirSync('./dist/MessageCommands')
  .filter((file) => file.endsWith('.js'));

for (const file of messageCommandFiles) {
  const command = require(`./MessageCommands/${file}`);
  Bot.messageCommands.set(command.name, command);
}

const eventFiles = fs
  .readdirSync('./dist/Events')
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./Events/${file}`);
  if (event.once) {
    client.once(event.name, (...args: any) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
