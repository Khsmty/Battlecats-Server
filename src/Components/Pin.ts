import { TextChannel, MessageEmbed } from 'discord.js';
import Bot from './Bot';

export default async function (channel: TextChannel) {
  if (Bot.pins.includes(channel.id)) return;

  const pins: any = require('../Data/pins.json');
  const message = pins[channel.id];

  if (message) {
    Bot.pins.push(channel.id);

    const chMsgs = await channel.messages.fetch({ limit: 10 });
    const prevPin = chMsgs.filter((m) => m.embeds[0] && m.embeds[0].color === 15105570).first();

    if (prevPin) {
      prevPin.delete();
    }

    channel.send({
      embeds: [new MessageEmbed().setDescription(message).setColor('ORANGE')],
    });

    setTimeout(() => {
      Bot.pins = Bot.pins.filter((id: string) => id !== channel.id);
    }, 1000)
  }
}
