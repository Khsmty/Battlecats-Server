import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } from 'discord.js'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('スレッドをCloseします。'),
  async execute(interaction: CommandInteraction) {
    if (
      interaction.channel.parentId !== '756959797806366851' ||
      !interaction.channel.topic
    ) {
      return interaction.reply({
        content:
          '・Close済みのスレッド\n・スレッドではないチャンネル\nはCloseできません。',
        ephemeral: true,
      })
    }

    const authorId = require('../helpers/threadAuthor')(
      interaction.channel.topic,
    )

    if (
      authorId !== interaction.user.id &&
      !interaction.member.permissions.has('ADMINISTRATOR')
    ) {
      return interaction.reply({
        content: 'あなたはスレッドの作成者でないため、Closeできません。',
        ephemeral: true,
      })
    }

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`スレッドをCloseします。\nよろしいですか？`)
          .setFooter('30秒経過すると自動キャンセルされます。')
          .setColor('YELLOW'),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setLabel('OK')
            .setEmoji('✅')
            .setStyle('SUCCESS')
            .setCustomId('thread-close-ok'),
          new MessageButton()
            .setLabel('キャンセル')
            .setStyle('DANGER')
            .setCustomId('thread-close-cancel'),
        ]),
      ],
    })

    const msg = await interaction.fetchReply()

    const ifilter = (i) => i.user.id === interaction.user.id
    const collector = msg.createMessageComponentCollector({
      filter: ifilter,
      time: 30000,
    })

    collector.on('collect', async (i) => {
      if (i.customId === 'thread-close-ok') {
        await interaction.channel.setParent('759465634236727316')

        i.update({
          embeds: [
            new MessageEmbed()
              .setDescription('スレッドをCloseしました。')
              .setColor('GREEN'),
          ],
          components: [],
        })
      } else if (i.customId === 'thread-close-cancel') {
        i.update({
          embeds: [
            new MessageEmbed()
              .setDescription('スレッドのCloseをキャンセルしました。')
              .setColor('RED'),
          ],
          components: [],
        })
      }
    })

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        msg.edit({
          embeds: [
            new MessageEmbed()
              .setDescription('スレッドのCloseを自動キャンセルしました。')
              .setColor('RED'),
          ],
          components: [],
        })
      }
    })
  },
}
