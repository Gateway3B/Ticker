const { Client, Intents, Collection} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
client.commands = new Collection();

const { discordBotToken, ATLASUSER, ATLASPASS } = require('../config.json');
const commandFunctions = require('./Helpers/CommandFunctions');


const mongoose = require('mongoose');
var conn;

// Response Schema
const favoriteSchema = new mongoose.Schema({
    ticker: String
});
var Favorites;

// Connects to MongoDB Atlas with mongoose and registers commands on connection with discord.
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const uri = `mongodb+srv://${ATLASUSER}:${ATLASPASS}@g3-cluster.8tlri.mongodb.net/TICKER?retryWrites=true&w=majority`;
    mongoose.connect(uri, {useNewUrlParser: true});
    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));

    commandFunctions.registerCommands(client, 'CommandJSONs');
    commandFunctions.fetchCommands(client, 'Commands');
});

// On interaction execute the command and setup any interactive elements.
client.on('interactionCreate', async interaction => {
    Favorites = mongoose.model('Favorite', favoriteSchema, interaction.guild.id);

    // Guards
    if(!interaction.isCommand()) return;
    if(!client.commands.has(interaction.commandName)) return;

    // Try executing command
    try {
        await client.commands.get(interaction.commandName).execute(interaction, Favorites);
    } catch(err) {
        console.error(err);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(discordBotToken);

process.on('SIGINT', async () => {
    console.log('Bot Shutdown');
    await commandFunctions.deleteCommands(client, 'CommandJSONs');
    await client.destroy();
    process.exit(1);
});
