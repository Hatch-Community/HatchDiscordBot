const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const { loadCommands, loadEvents, loadComponents } = require('./src/utils/loader');
const { success, failure } = require('./src/utils/response');
const { deployCommands } = require('./deploy-commands');

dotenv.config();



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
  ],
});
// Initialize collections for commands and components
client.commands = new Collection();
client.components = new Collection();

/**
 * Initialize and load all bot components
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function initializeBot() {
  try {
    console.log('🔧 Initializing HatchBot Framework...');

    // Load commands
    const commandsResult = await loadCommands(path.join(__dirname, 'src', 'commands'));
    if (!commandsResult.success) {
      return failure(`Failed to load commands: ${commandsResult.error}`);
    }
    client.commands = commandsResult.data;

    // Load events
    const eventsResult = await loadEvents(client, path.join(__dirname, 'src', 'events'));
    if (!eventsResult.success) {
      return failure(`Failed to load events: ${eventsResult.error}`);
    }

    // Load components
    const componentsResult = await loadComponents(path.join(__dirname, 'src', 'components'));
    if (!componentsResult.success) {
      return failure(`Failed to load components: ${componentsResult.error}`);
    }
    client.components = componentsResult.data;

    console.log('✅ All components loaded successfully');
    return success({
      commands: client.commands.size,
      events: eventsResult.data,
      components: client.components.size
    });

  } catch (error) {
    console.error('❌ Error initializing bot:', error);
    return failure(error.message);
  }
}

/**
 * Auto-deploy commands to Discord
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function autoDeployCommands() {
  try {
    console.log('🚀 Auto-deploying slash commands...');
    
    const deployResult = await deployCommands();
    if (!deployResult.success) {
      return failure(`Command deployment failed: ${deployResult.error}`);
    }

    const { commandCount, isGlobal } = deployResult.data;
    const scope = isGlobal ? 'globally' : 'to development guild';
    console.log(`✅ Successfully deployed ${commandCount} commands ${scope}`);
    
    return success(deployResult.data);

  } catch (error) {
    console.error('❌ Error during command deployment:', error);
    return failure(error.message);
  }
}

/**
 * Start the Discord bot with auto-deployment
 * @returns {Promise<{ success: boolean, error: string|null, data?: any }>}
 */
async function startBot() {
  try {
    if (!process.env.BOT_TOKEN) {
      return failure('BOT_TOKEN environment variable is required');
    }

    if (!process.env.CLIENT_ID) {
      console.warn('⚠️ CLIENT_ID not set - command auto-deployment will be skipped');
    }

    // Initialize bot components first
    const initResult = await initializeBot();
    if (!initResult.success) {
      return failure(`Initialization failed: ${initResult.error}`);
    }

    // Login to Discord
    await client.login(process.env.BOT_TOKEN);
    console.log('🔐 Bot authentication successful');

    // Auto-deploy commands if CLIENT_ID is available
    if (process.env.CLIENT_ID) {
      const deployResult = await autoDeployCommands();
      if (!deployResult.success) {
        console.warn('⚠️ Command deployment failed, but bot will continue:', deployResult.error);
      }
    }

    return success({
      initialized: initResult.data,
      status: 'Bot started successfully'
    });

  } catch (error) {
    console.error('💥 Failed to start bot:', error.message);
    return failure(error.message);
  }
}

// Enhanced error handling for client events
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.on('warn', (warning) => {
  console.warn('⚠️ Discord client warning:', warning);
});

client.on('shardError', (error) => {
  console.error('❌ Shard error:', error);
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Start the bot with auto-deployment
startBot()
  .then(result => {
    if (!result.success) {
      console.error('💥 Bot startup failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error during startup:', error);
    process.exit(1);
  });   