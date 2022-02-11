import NgWord from './NgWord';
import NgImage from './NgImage';
import TokenDelete from './TokenDelete';

import config from '../config.json';

import type { Message } from 'discord.js';

export default function (message: Message) {
  // サーバー外は無視
  if (!message.guild || message.guildId !== config.guildId) return;

  // モデレーターは無視
  if (message.member?.roles.cache.has('903921596241182731')) return;

  NgWord(message);
  NgImage(message);
  TokenDelete(message);
}
