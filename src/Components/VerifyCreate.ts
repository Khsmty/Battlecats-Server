import { ButtonInteraction, GuildMemberRoleManager } from 'discord.js';
import crypto from 'crypto';
import Bot from './Bot';

export default function (interaction: ButtonInteraction) {
  if ((interaction.member!.roles as GuildMemberRoleManager).cache.has('759556295770243093')) {
    return interaction.reply({
      content: 'あなたは既に認証されています。',
      ephemeral: true,
    });
  }

  Bot.db.query(
    'SELECT * FROM `verifyKey` WHERE `userId` = ?',
    [interaction.user.id],
    (e, rows: any[]) => {
      if (!rows || !rows[0]) {
        const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const generateKey = Array.from(crypto.randomFillSync(new Uint8Array(10)))
          .map((n) => S[n % S.length])
          .join('');

        Bot.db.query('INSERT INTO `verifyKey` (`userId`, `key`) VALUES (?, ?)', [
          interaction.user.id,
          generateKey,
        ]);

        interaction.reply({
          content: `以下のURLからユーザー認証を完了させてください。\n<https://battlecats.win/v/${generateKey}>`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `以下のURLからユーザー認証を完了させてください。\n<https://battlecats.win/v/${rows[0].key}>`,
          ephemeral: true,
        });
      }
    }
  );
}
