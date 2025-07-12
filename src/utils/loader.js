const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { success, failure } = require('./response');

/**
 * Load all command files from the commands directory
 * @param {string} commandsPath - Path to the commands directory
 * @returns {{ success: boolean, error: string|null, data?: Collection }}
 */
async function loadCommands(commandsPath) {
  try {
    const commands = new Collection();
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)]; // Hot reload support
      const command = require(filePath);

      if (!command.data || !command.execute) {
        console.warn(`⚠️ Command file ${file} is missing required properties`);
        continue;
      }

      commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    }

    return success(commands);
  } catch (error) {
    console.error('❌ Error loading commands:', error);
    return failure(`Failed to load commands: ${error.message}`);
  }
}

/**
 * Load all event files from the events directory
 * @param {Client} client - Discord client instance
 * @param {string} eventsPath - Path to the events directory
 * @returns {{ success: boolean, error: string|null, data?: number }}
 */
async function loadEvents(client, eventsPath) {
  try {
    let loadedCount = 0;
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      delete require.cache[require.resolve(filePath)]; // Hot reload support
      const event = require(filePath);

      if (!event.name || !event.execute) {
        console.warn(`⚠️ Event file ${file} is missing required properties`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      loadedCount++;
      console.log(`✅ Loaded event: ${event.name}`);
    }

    return success(loadedCount);
  } catch (error) {
    console.error('❌ Error loading events:', error);
    return failure(`Failed to load events: ${error.message}`);
  }
}

/**
 * Load all component handlers from the components directory
 * @param {string} componentsPath - Path to the components directory
 * @returns {{ success: boolean, error: string|null, data?: Collection }}
 */
async function loadComponents(componentsPath) {
  try {
    const components = new Collection();
    const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));

    for (const file of componentFiles) {
      const filePath = path.join(componentsPath, file);
      delete require.cache[require.resolve(filePath)]; // Hot reload support
      const component = require(filePath);

      if (!component.customId || !component.execute) {
        console.warn(`⚠️ Component file ${file} is missing required properties`);
        continue;
      }

      components.set(component.customId, component);
      console.log(`✅ Loaded component: ${component.customId}`);
    }

    return success(components);
  } catch (error) {
    console.error('❌ Error loading components:', error);
    return failure(`Failed to load components: ${error.message}`);
  }
}

module.exports = {
  loadCommands,
  loadEvents,
  loadComponents
};
