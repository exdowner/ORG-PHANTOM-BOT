const express = require("express");
const app = express();

// Servidor web simples para manter o Render acordado 24/7
app.get("/", (req, res) => {
    res.send("ORG PHANTOM BOT ONLINE 24/7!");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Servidor HTTP rodando para o Render.");
});

// Importações do Discord.js
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Inicialização do Client do Discord com as intents necessárias
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Carregador de comandos (da pasta commands)
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando carregado: /${command.data.name}`);
        } else {
            console.log(`[AVISO] O comando em ${filePath} está sem a propriedade "data" ou "execute".`);
        }
    }
}

// Carregador de eventos (da pasta events)
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = file.split(".")[0];

        // Trata o evento clientReady (compatível com v14/v15)
        if (eventName === "ready" || eventName === "clientReady") {
            client.once("ready", (c) => event(c));
        } else {
            // Eventos gerais (como interactionCreate)
            client.on(eventName, (...args) => event(...args));
        }
        console.log(`⚡ Evento carregado: ${eventName}`);
    }
}

// Evento padrão caso o arquivo events/ready.js não exista
client.once("clientReady", (c) => {
    console.log("--------------------------------");
    console.log("ORG PHANTOM ONLINE");
    console.log(`Bot conectado como: ${c.user.tag}`);
    console.log("--------------------------------");
});

// Login do Bot usando o token das variáveis de ambiente (Render / .env)
client.login(process.env.DISCORD_TOKEN);