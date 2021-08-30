const apiEndpoint =
  'https://discord.com/api/v8/applications/822018223422570497/commands/880076198569447474'
const botToken = process.env.DISCORD_TOKEN
const commandData = {
  name: 'watch',
  description: 'ボイスチャンネルでYouTubeを視聴します。',
  options: [],
}

async function main() {
  const fetch = require('node-fetch')

  const response = await fetch(apiEndpoint, {
    method: 'patch',
    body: JSON.stringify(commandData),
    headers: {
      Authorization: 'Bot ' + botToken,
      'Content-Type': 'application/json',
    },
  })
  const json = await response.json()

  console.log(json)
}
main()
