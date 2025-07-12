const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about the server or a user')
    .addSubcommand(subcommand =>
      subcommand
        .setName('server')
        .setDescription('Get server information'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Get user information')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The user to get info about')
            .setRequired(false))),

  /**
   * Execute the info command
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'server') {
        await this.handleServerInfo(interaction);
      } else if (subcommand === 'user') {
        await this.handleUserInfo(interaction);
      }

    } catch (error) {
      console.error('❌ Error in info command:', error);
      
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
  },

  /**
   * Handle server info subcommand
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async handleServerInfo(interaction) {
    const { guild } = interaction;
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`📊 ${guild.name} Server Information`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
        { name: '💬 Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '😊 Emojis', value: guild.emojis.cache.size.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Server ID: ${guild.id}` });

    if (guild.description) {
      embed.setDescription(guild.description);
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('server_info_details')
      .setPlaceholder('Select category for more details...')
      .addOptions([
        {
          label: 'Channels',
          description: 'View channel breakdown',
          value: 'channels',
          emoji: '💬'
        },
        {
          label: 'Roles',
          description: 'View role information',
          value: 'roles',
          emoji: '🎭'
        },
        {
          label: 'Boosts',
          description: 'View boost information',
          value: 'boosts',
          emoji: '🚀'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },

  /**
   * Handle user info subcommand
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async handleUserInfo(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`👤 ${user.displayName} User Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🏷️ Username', value: user.username, inline: true },
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    if (member) {
      embed.addFields(
        { name: '📅 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1}` : 'None', inline: true }
      );

      if (member.nickname) {
        embed.addFields({ name: '📝 Nickname', value: member.nickname, inline: true });
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
};
