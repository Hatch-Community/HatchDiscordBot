const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * Execute when the client is ready
   * @param {import('discord.js').Client} client
   * @returns {Promise<void>}
   */
  async execute(client) {
    try {
      console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
      console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
      console.log(`👥 Serving ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users`);
      
      // Set bot status
      client.user.setPresence({
        activities: [{ 
          name: `${client.guilds.cache.size} servers | /help`, 
          type: 3 // Watching
        }],
        status: 'online'
      });

      console.log('🎮 Bot status set successfully');
      
    } catch (error) {
      console.error('❌ Error in ready event:', error);
    }
  }
};
