import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { time } from '@discordjs/builders';
import Bot from './Bot';

async function Update(message: Message) {
  const title = message.embeds[0].title;
  let boardType;

  if (title?.includes('DISBOARD')) {
    boardType = 'disboard';
  } else if (title?.includes('ディスコード速報')) {
    boardType = 'dissoku';
  } else if (title?.includes('成功')) {
    boardType = 'chahan';
  } else if (title?.includes('GlowBoard')) {
    boardType = 'glow';
  }

  const description: string | null = message.embeds[0].description;
  const authorId = (
    description?.includes('<@!') ? description!.split('<@!')[1] : description!.split('<@')[1]
  ).split('>')[0];

  const embed = new MessageEmbed().setTitle('Upを確認しました').setColor('GREEN');

  if (boardType !== 'disboard') {
    const countDb = () => {
      return new Promise((resolve) => {
        Bot.db.query('SELECT * FROM `updateCount` WHERE `userId` = ?', [authorId], (e, rows) => {
          if (!rows || !rows[0]) {
            Bot.db.query('INSERT INTO `updateCount` (`userId`, `count`) VALUES (?, ?)', [
              authorId,
              1,
            ]);
            resolve(1);
          } else {
            Bot.db.query('UPDATE `updateCount` SET `count` = ? WHERE `userId` = ?', [
              rows[0].count + 1,
              authorId,
            ]);
            resolve(rows[0].count + 1);
          }
        });
      });
    };

    const countSort = () => {
      return new Promise((resolve) => {
        Bot.db.query(
          'SELECT * FROM `updateCount` ORDER BY `count` DESC',
          (e: any, rows: unknown) => {
            if (!rows) {
              resolve([]);
            }

            resolve(rows);
          }
        );
      });
    };

    const updateCount: any = await countDb();
    const countList: any = await countSort();

    const countFind = countList.findIndex((index: { userId: string }) => {
      return index.userId === authorId;
    });

    embed.addField('あなたの総Up数', `**${String(updateCount)}**回 (${countFind + 1}位)`);
  }

  let updateTime: any;
  if (boardType === 'disboard') {
    updateTime = new Date(Date.now() + 7200000);
  } else if (boardType === 'dissoku' || boardType === 'chahan') {
    updateTime = new Date(Date.now() + 3600000);
  } else if (boardType === 'glow') {
    updateTime = new Date(Date.now() + 5400000);
  }

  embed.setDescription(`${time(updateTime, 'T')}(${time(updateTime, 'R')}) にお知らせします！`);

  (message.channel as TextChannel)?.send({
    embeds: [embed],
  });

  Bot.db.query('INSERT INTO `updateNotify` (`boardType`, `date`) VALUES (?, ?)', [
    boardType,
    updateTime,
  ]);
}

export default Update;
