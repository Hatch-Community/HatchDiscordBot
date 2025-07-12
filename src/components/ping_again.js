const { EmbedBuilder } = require('discord.js');

module.exports = {
  customId: 'ping_again',

  /**
   * Execute the ping again button component
   * @param {import('discord.js').ButtonInteraction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    try {
      await interaction.deferUpdate();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🏓 Pong!')
        .addFields(
          { 
            name: '📡 Bot Latency', 
            value: `${Date.now() - interaction.message.createdTimestamp}ms`, 
            inline: true 
          },
          { 
            name: '💓 API Latency', 
            value: `${Math.round(interaction.client.ws.ping)}ms`, 
            inline: true 
          },
          {
            name: '🔄 Updated',
            value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true
          }
        )
        .setTimestamp()
        .setFooter({ text: 'HatchBot Framework • Updated' });

      await interaction.editReply({
        embeds: [embed]
      });

    } catch (error) {
      console.error('❌ Error in ping_again component:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred while updating the ping.',
          ephemeral: true
        });
      }
    }
  }
};
