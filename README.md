# 🤖 HatchBot Framework

A comprehensive Discord.js v14 bot framework with automatic command deployment, message components, and robust error handling.

## ✨ Features

- 🚀 **Auto-deployment** of slash commands on startup
- 🎯 **Component System** for buttons, select menus, and modals
- 📁 **Modular Structure** with separate commands, events, and components
- 🛡️ **Error Handling** following standardized patterns
- 🔄 **Hot Reload** support for development
- 📊 **Comprehensive Logging** with emojis and context

## 🚀 Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your bot credentials:

```bash
cp .env.example .env
```

Required variables:
- `BOT_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application's client ID
- `GUILD_ID` - (Optional) Development guild ID for faster command deployment

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Bot

```bash
npm start
```

The bot will automatically:
- Load all commands from `src/commands/`
- Load all events from `src/events/`
- Load all components from `src/components/`
- Deploy slash commands to Discord

## 📁 Project Structure

```
HatchDiscordBot/
├── index.js                 # Main bot file
├── deploy-commands.js       # Manual command deployment script
├── package.json
├── .env.example
├── src/
│   ├── commands/           # Slash commands
│   │   ├── ping.js
│   │   └── info.js
│   ├── events/             # Event handlers
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   ├── components/         # Button/Menu handlers
│   │   ├── ping_again.js
│   │   └── server_info_details.js
│   └── utils/              # Utility functions
│       ├── loader.js       # File loading utilities
│       └── response.js     # Standardized response helpers
```

## 🎯 Creating Commands

Commands follow this structure in `src/commands/`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command'),

  async execute(interaction) {
    await interaction.reply('Hello World!');
  }
};
```

## 🔘 Creating Components

Components handle button clicks and select menu interactions:

```javascript
module.exports = {
  customId: 'my_button',
  
  async execute(interaction) {
    await interaction.reply('Button clicked!');
  }
};
```

## 📡 Creating Events

Events listen to Discord.js client events:

```javascript
const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  
  async execute(message) {
    console.log(\`Message received: \${message.content}\`);
  }
};
```

## 🛠️ Development Scripts

- `npm start` - Start the bot with auto-deployment
- `npm run dev` - Same as start (for development)
- `npm run deploy` - Manually deploy commands
- `npm run deploy:delete` - Delete all deployed commands

## 🛡️ Error Handling

The framework uses standardized error handling patterns:

```javascript
const { success, failure } = require('./src/utils/response');

// Function returns
return success(data);          // { success: true, error: null, data }
return failure('Error msg');   // { success: false, error: 'Error msg', data: null }
```

## 📊 Logging

The framework provides comprehensive logging:

- ✅ Success messages with green checkmarks
- ❌ Error messages with red X marks
- ⚠️ Warning messages with yellow warnings
- 🔧 Process messages with tools
- 📊 Statistical information

## 🔧 Configuration

### Auto-Deployment Behavior

- If `GUILD_ID` is set: Commands deploy to that guild only (instant)
- If `GUILD_ID` not set: Commands deploy globally (up to 1 hour)
- If `CLIENT_ID` not set: Auto-deployment is skipped with warning

### Intent Configuration

The bot requests these intents by default:
- Guilds, GuildMessages, DirectMessages
- GuildMembers, GuildMessageReactions
- GuildPresences, GuildVoiceStates
- MessageContent (for message processing)
- And more for comprehensive functionality

## 🤝 Contributing

1. Follow the established patterns for commands, events, and components
2. Use the standardized error handling format
3. Include proper JSDoc documentation
4. Test your changes with both guild and global deployment

## 📜 License

ISC License - see package.json for details.
