import { Client, Collection } from 'discord.js';
import { createConnection } from 'mysql';
import * as dotenv from 'dotenv';

// .envから値の読み込み
dotenv.config();

export default class Bot {
  static client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES'],
  });
  static db = createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    charset: 'utf8mb4',
  });
  static commands: Collection<String, any> = new Collection();
  static messageCommands: Collection<String, any> = new Collection();
  static pins: any = [];
}
