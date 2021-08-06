const apiEndpoint =
  'https://discord.com/api/v8/applications/822018223422570497/commands'
const botToken = process.env.DISCORD_TOKEN
const commandData = {
  name: 'progress',
  description: 'メンバーのにゃんこクラブ/手持ちキャラを検索します',
  options: [
    {
      name: 'user',
      description: '検索するユーザーを指定してください',
      type: 6,
      required: true,
    },
  ],
}

async function main() {
  const fetch = require('node-fetch')

  const response = await fetch(apiEndpoint, {
    method: 'post',
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
