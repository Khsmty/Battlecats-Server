const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('スレッドを削除します。'),
  async execute(interaction) {
    if (
      interaction.channel.parentId !== '759465634236727316' ||
      !interaction.channel.topic
    ) {
      return interaction.reply({
        content:
          '・Closeされていないスレッド\n・スレッドではないチャンネル\nは削除できません。',
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
        content: 'あなたはスレッドの作成者でないため、削除できません。',
        ephemeral: true,
      })
    }

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setDescription(`スレッドを削除します。\nよろしいですか？`)
          .setFooter('30秒経過すると自動キャンセルされます。')
          .setColor('YELLOW'),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setLabel('OK')
            .setEmoji('✅')
            .setStyle('SUCCESS')
            .setCustomId('thread-delete-ok'),
          new MessageButton()
            .setLabel('キャンセル')
            .setStyle('DANGER')
            .setCustomId('thread-delete-cancel'),
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
      if (i.customId === 'thread-delete-ok') {
        interaction.client.channels.cache.get('759053620322369568').send({
          embeds: [
            new MessageEmbed()
              .setTitle(interaction.channel.name)
              .setFooter(`Deleted by ${interaction.user.tag}`)
              .setTimestamp(),
          ],
        })

        await interaction.channel.delete()
      } else if (i.customId === 'thread-delete-cancel') {
        i.update({
          embeds: [
            new MessageEmbed()
              .setDescription('スレッドの削除をキャンセルしました。')
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
              .setDescription('スレッドの削除を自動キャンセルしました。')
              .setColor('RED'),
          ],
          components: [],
        })
      }
    })
  },
}
