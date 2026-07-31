require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Comando carregado: /${command.data.name}`);
    }
}

const interactionCreate = require("./events/interactionCreate");
client.on("interactionCreate", interactionCreate);

client.once("ready", () => {
    console.log("--------------------------------");
    console.log("ORG PHANTOM ONLINE");
    console.log(`Bot conectado como: ${client.user.tag}`);
    console.log("--------------------------------");
});

client.login(process.env.DISCORD_TOKEN);