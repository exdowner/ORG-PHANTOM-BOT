const { MessageFlags } = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

// Função auxiliar para responder com segurança
async function responder(interaction, content, isEdit = false) {
    try {
        if (isEdit) {
            await interaction.editReply(content);
        } else {
            // Se não foi respondido ainda, tenta reply
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content, flags: MessageFlags.Ephemeral });
            } else {
                // Se já foi deferido ou respondedo, usa followUp
                await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
            }
        }
    } catch (err) {
        console.error("Erro ao responder:", err);
        // Ignora, para não derrubar o bot
    }
}

module.exports = async (interaction) => {
    try {
        // --- COMANDOS SLASH ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                // Não fazemos deferReply aqui, delegamos ao comando
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                await responder(interaction, "❌ Erro ao executar comando!", false);
            }
            return;
        }

        // --- MENUS ---
        if (interaction.isStringSelectMenu()) {
            // Só faz defer se necessário
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            // Processa o menu (aqui você coloca a lógica)
            // ... (coloque o código de processamento de menus)
            // Depois, responda com editReply
            await responder(interaction, "✅ Configuração atualizada!", true);
            return;
        }

        // --- BOTÕES ---
        if (interaction.isButton()) {
            // Não faz deferReply automaticamente; cada handler decide
            // Vamos usar a função responder para garantir segurança
            const { customId, user, guild, message, channel } = interaction;

            // Aqui você coloca a lógica dos botões, mas sempre usando `responder`
            // Exemplo:
            if (customId === "enviar_paineis") {
                // ... lógica
                await responder(interaction, "✅ Painéis enviados!", true);
                return;
            }
            // ... outros botões
        }
    } catch (err) {
        console.error("Erro geral na interação:", err);
        // Tenta responder algo apenas se não tiver respondido ainda
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: "❌ Ocorreu um erro inesperado.", flags: MessageFlags.Ephemeral });
            } catch (e) {}
        }
    }
};