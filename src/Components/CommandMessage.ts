import {
  CommandInteraction,
  Message,
  MessageOptions,
  Client,
  Collection,
  MessageAttachment,
  ReplyMessageOptions,
} from 'discord.js';

export default class CommandMessage {
  private isMessage = false;
  private message = null as unknown as Message;
  private interaction = null as unknown as CommandInteraction;
  private interactionReplied = false;
  private client = null as unknown as Client;
  private command = null as unknown as string;
  private options = null as unknown as string[];
  private rawOptions = null as unknown as string;

  private constructor() { }
  
  static createFromMessage(message: Message) {
    const me = new CommandMessage();
    me.isMessage = true;
    me.message = message;
    me.command = message.content.split(' ')[0].substring(1);
    me.rawOptions = message.content.substring(me.command.length + 2);
    me.options = me.rawOptions.split(' ');

    return me;
  }
}
