const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and bot latency!'),

  /**
   * Execute the ping command
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    try {
      const sent = await interaction.reply({ 
        content: '🏓 Pinging...', 
        fetchReply: true 
      });

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🏓 Pong!')
        .addFields(
          { 
            name: '📡 Bot Latency', 
            value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, 
            inline: true 
          },
          { 
            name: '💓 API Latency', 
            value: `${Math.round(interaction.client.ws.ping)}ms`, 
            inline: true 
          }
        )
        .setTimestamp()
        .setFooter({ text: 'HatchBot Framework' });

      const button = new ButtonBuilder()
        .setCustomId('ping_again')
        .setLabel('Ping Again')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🏓');

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.editReply({
        content: null,
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      console.error('❌ Error in ping command:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription('An error occurred while executing this command.')
        .setTimestamp();

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed], components: [] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  }
};
