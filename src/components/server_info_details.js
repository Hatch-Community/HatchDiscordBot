const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  customId: 'server_info_details',

  /**
   * Execute the server info details select menu
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    try {
      const selection = interaction.values[0];
      const { guild } = interaction;

      let embed;

      switch (selection) {
        case 'channels':
          embed = this.createChannelsEmbed(guild);
          break;
        case 'roles':
          embed = this.createRolesEmbed(guild);
          break;
        case 'boosts':
          embed = this.createBoostsEmbed(guild);
          break;
        default:
          embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Invalid Selection')
            .setDescription('Please select a valid option.');
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    } catch (error) {
      console.error('❌ Error in server_info_details component:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred while fetching server details.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * Create channels information embed
   * @param {import('discord.js').Guild} guild
   * @returns {EmbedBuilder}
   */
  createChannelsEmbed(guild) {
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const threads = guild.channels.cache.filter(c => c.isThread()).size;

    return new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('💬 Channel Information')
      .addFields(
        { name: '📝 Text Channels', value: textChannels.toString(), inline: true },
        { name: '🔊 Voice Channels', value: voiceChannels.toString(), inline: true },
        { name: '📁 Categories', value: categories.toString(), inline: true },
        { name: '🧵 Threads', value: threads.toString(), inline: true },
        { name: '📊 Total Channels', value: guild.channels.cache.size.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${guild.name} Channel Stats` });
  },

  /**
   * Create roles information embed
   * @param {import('discord.js').Guild} guild
   * @returns {EmbedBuilder}
   */
  createRolesEmbed(guild) {
    const roles = guild.roles.cache
      .filter(role => role.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 20); // Limit to first 20 roles

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🎭 Role Information')
      .addFields(
        { name: '📊 Total Roles', value: (guild.roles.cache.size - 1).toString(), inline: true },
        { name: '🎨 Colored Roles', value: guild.roles.cache.filter(r => r.color !== 0).size.toString(), inline: true },
        { name: '🔧 Managed Roles', value: guild.roles.cache.filter(r => r.managed).size.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${guild.name} Role Stats` });

    if (roles.length > 0) {
      embed.addFields({
        name: '🏷️ Roles (Top 20)',
        value: roles.join(', ') || 'None',
        inline: false
      });
    }

    return embed;
  },

  /**
   * Create boosts information embed
   * @param {import('discord.js').Guild} guild
   * @returns {EmbedBuilder}
   */
  createBoostsEmbed(guild) {
    return new EmbedBuilder()
      .setColor('#FF73FA')
      .setTitle('🚀 Server Boost Information')
      .addFields(
        { name: '✨ Boost Level', value: guild.premiumTier.toString(), inline: true },
        { name: '💎 Boost Count', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
        { name: '👑 Boosters', value: guild.members.cache.filter(m => m.premiumSince).size.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${guild.name} Boost Stats` });
  }
};
