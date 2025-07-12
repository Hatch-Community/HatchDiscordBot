const { REST, Routes, Client } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Deploy slash commands to Discord
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function deployCommands() {
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Load all command data
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      
      if (!command.data) {
        console.warn(`⚠️ Command file ${file} is missing data property`);
        continue;
      }

      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command data: ${command.data.name}`);
    }

    if (commands.length === 0) {
      return {
        success: false,
        error: 'No commands found to deploy',
        data: null
      };
    }

    // Validate environment variables
    if (!process.env.BOT_TOKEN) {
      return {
        success: false,
        error: 'BOT_TOKEN environment variable is required',
        data: null
      };
    }

    if (!process.env.CLIENT_ID) {
      return {
        success: false,
        error: 'CLIENT_ID environment variable is required',
        data: null
      };
    }

    const rest = new REST().setToken(process.env.BOT_TOKEN);

    console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

    let data;
    
    if (process.env.GUILD_ID) {
      // Deploy to specific guild (faster for development)
      data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} guild commands for guild ${process.env.GUILD_ID}.`);
    } else {
      // Deploy globally (takes up to 1 hour)
      data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} global application commands.`);
    }

    return {
      success: true,
      error: null,
      data: {
        commandCount: data.length,
        isGlobal: !process.env.GUILD_ID
      }
    };

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Deploy slash commands to all guilds the bot is connected to
 * @param {Client} client - Discord client instance
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function deployCommandsToAllGuilds(client) {
  try {
    if (!client || !client.guilds) {
      return {
        success: false,
        error: 'Valid Discord client instance is required',
        data: null
      };
    }

    const commands = [];
    const commandsPath = path.join(__dirname, 'src', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Load all command data
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)]; // Hot reload support
      const command = require(filePath);
      
      if (!command.data) {
        console.warn(`⚠️ Command file ${file} is missing data property`);
        continue;
      }

      commands.push(command.data.toJSON());
    }

    if (commands.length === 0) {
      return {
        success: false,
        error: 'No commands found to deploy',
        data: null
      };
    }

    // Validate environment variables
    if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
      return {
        success: false,
        error: 'BOT_TOKEN and CLIENT_ID environment variables are required',
        data: null
      };
    }

    const rest = new REST().setToken(process.env.BOT_TOKEN);
    const guilds = client.guilds.cache;

    console.log(`🚀 Started deploying ${commands.length} commands to ${guilds.size} guilds...`);

    const deploymentResults = [];
    let successCount = 0;
    let failureCount = 0;

    // Deploy to each guild
    for (const [guildId, guild] of guilds) {
      try {
        console.log(`📡 Deploying to ${guild.name} (${guildId})...`);
        
        const data = await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
          { body: commands }
        );

        console.log(`✅ Successfully deployed ${data.length} commands to ${guild.name}`);
        deploymentResults.push({
          guildId,
          guildName: guild.name,
          success: true,
          commandCount: data.length,
          error: null
        });
        successCount++;

        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to deploy to ${guild.name} (${guildId}):`, error.message);
        deploymentResults.push({
          guildId,
          guildName: guild.name,
          success: false,
          commandCount: 0,
          error: error.message
        });
        failureCount++;
      }
    }

    console.log(`📊 Deployment Summary:`);
    console.log(`✅ Successful: ${successCount}/${guilds.size} guilds`);
    console.log(`❌ Failed: ${failureCount}/${guilds.size} guilds`);

    return {
      success: successCount > 0,
      error: failureCount > 0 ? `${failureCount} deployments failed` : null,
      data: {
        totalGuilds: guilds.size,
        successCount,
        failureCount,
        commandCount: commands.length,
        results: deploymentResults
      }
    };

  } catch (error) {
    console.error('❌ Error during guild deployment:', error);
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Delete commands from all guilds
 * @param {Client} client - Discord client instance
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function deleteCommandsFromAllGuilds(client) {
  try {
    if (!client || !client.guilds) {
      return {
        success: false,
        error: 'Valid Discord client instance is required',
        data: null
      };
    }

    if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
      return {
        success: false,
        error: 'BOT_TOKEN and CLIENT_ID environment variables are required',
        data: null
      };
    }

    const rest = new REST().setToken(process.env.BOT_TOKEN);
    const guilds = client.guilds.cache;

    console.log(`🗑️ Started deleting commands from ${guilds.size} guilds...`);

    let successCount = 0;
    let failureCount = 0;

    for (const [guildId, guild] of guilds) {
      try {
        console.log(`🗑️ Deleting commands from ${guild.name} (${guildId})...`);
        
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
          { body: [] }
        );

        console.log(`✅ Successfully deleted commands from ${guild.name}`);
        successCount++;

        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to delete commands from ${guild.name} (${guildId}):`, error.message);
        failureCount++;
      }
    }

    console.log(`📊 Deletion Summary:`);
    console.log(`✅ Successful: ${successCount}/${guilds.size} guilds`);
    console.log(`❌ Failed: ${failureCount}/${guilds.size} guilds`);

    return {
      success: successCount > 0,
      error: failureCount > 0 ? `${failureCount} deletions failed` : null,
      data: {
        totalGuilds: guilds.size,
        successCount,
        failureCount
      }
    };

  } catch (error) {
    console.error('❌ Error during guild command deletion:', error);
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Run deployment if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--delete')) {
    deleteCommands();
  } else {
    deployCommands();
  }
}

module.exports = {
  deployCommands,
  
  deployCommandsToAllGuilds,
  deleteCommandsFromAllGuilds
};
