require('dotenv').config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = '822018223422570497';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // テスト鯖
    await rest.put(Routes.applicationGuildCommands(clientId, '747053403154284605'), {
      body: commands,
    });
    // アプリにゃんこ大戦争
    await rest.put(Routes.applicationGuildCommands(clientId, '755774191613247568'), {
      body: commands,
    });
    // アプリにゃんこ大戦争(サブ)
    await rest.put(Routes.applicationGuildCommands(clientId, '796606104410783784'), {
      body: commands,
    });

    console.log('コマンドを登録しました。');
  } catch (error) {
    console.error(error);
  }
})();
