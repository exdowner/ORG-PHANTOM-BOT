const { REST, Routes } = require("discord.js");
require("dotenv").config(); // Carrega as variáveis do arquivo .env

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🧹 Apagando comandos antigos duplicados...");

        // 1. Limpa comandos globais
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log("✅ Comandos globais apagados!");

        // 2. Limpa comandos do servidor (Guild)
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] }
            );
            console.log("✅ Comandos do servidor apagados!");
        }

        console.log("🎉 Limpeza concluída!");
    } catch (error) {
        console.error("❌ Erro ao apagar comandos:", error);
    }
})();