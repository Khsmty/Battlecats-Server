import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { time } from '@discordjs/builders';
import Bot from './Bot';

export default async function (message: Message) {
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
