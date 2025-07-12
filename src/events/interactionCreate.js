const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * Execute when an interaction is created
   * @param {import('discord.js').Interaction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(interaction);
      } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await this.handleComponent(interaction);
      } else if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(interaction);
      }
    } catch (error) {
      console.error('❌ Error handling interaction:', error);
      await this.handleInteractionError(interaction, error);
    }
  },

  /**
   * Handle slash command interactions
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`❌ No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
      console.log(`✅ Command executed: ${interaction.commandName} by ${interaction.user.tag}`);
    } catch (error) {
      console.error(`❌ Error executing command ${interaction.commandName}:`, error);
      throw error;
    }
  },

  /**
   * Handle component interactions (buttons, select menus)
   * @param {import('discord.js').Interaction} interaction
   */
  async handleComponent(interaction) {
    const component = interaction.client.components.get(interaction.customId);

    if (!component) {
      console.warn(`⚠️ No component handler found for: ${interaction.customId}`);
      
      await interaction.reply({
        content: '❌ This component is no longer available.',
        ephemeral: true
      });
      return;
    }

    try {
      await component.execute(interaction);
      console.log(`✅ Component executed: ${interaction.customId} by ${interaction.user.tag}`);
    } catch (error) {
      console.error(`❌ Error executing component ${interaction.customId}:`, error);
      throw error;
    }
  },

  /**
   * Handle autocomplete interactions
   * @param {import('discord.js').AutocompleteInteraction} interaction
   */
  async handleAutocomplete(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command || !command.autocomplete) {
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`❌ Error in autocomplete for ${interaction.commandName}:`, error);
    }
  },

  /**
   * Handle interaction errors with user-friendly messages
   * @param {import('discord.js').Interaction} interaction
   * @param {Error} error
   */
  async handleInteractionError(interaction, error) {
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Something went wrong!')
      .setDescription('An error occurred while processing your request. Please try again later.')
      .setTimestamp()
      .setFooter({ text: 'If this persists, contact support' });

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ 
          embeds: [errorEmbed], 
          components: [] 
        });
      } else {
        await interaction.reply({ 
          embeds: [errorEmbed], 
          ephemeral: true 
        });
      }
    } catch (replyError) {
      console.error('❌ Failed to send error message:', replyError);
    }
  }
};
