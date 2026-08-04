const { MessageFlags } = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

module.exports = async (interaction) => {
    try {
        // --- COMANDOS SLASH ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                // Executa o comando – ele mesmo cuidará da resposta
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                // Responde apenas se o comando não tiver respondido ainda
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: "❌ Erro ao executar comando!", 
                        flags: MessageFlags.Ephemeral 
                    });
                } else {
                    await interaction.followUp({ 
                        content: "❌ Erro ao executar comando!", 
                        flags: MessageFlags.Ephemeral 
                    });
                }
            }
            return;
        }

        // --- MENUS DE SELEÇÃO ---
        if (interaction.isStringSelectMenu()) {
            // Apenas defer se necessário e responder depois
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }

            // (Aqui você coloca sua lógica de menus)
            // Exemplo:
            const config = pegarConfig();
            const valor = interaction.values[0];
            if (interaction.customId === "select_valor") {
                config.valor = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_quantidade") {
                const qtd = parseInt(valor);
                if (!isNaN(qtd) && qtd > 0) {
                    config.quantidade = qtd;
                    salvarConfig(config);
                }
            } // ... outros menus

            // Atualiza o preview do /setup (opcional, mas cuidado para não responder duas vezes)
            // Você pode usar editReply aqui, já que deferimos antes
            await interaction.editReply({ content: "✅ Configuração atualizada!" });
            return;
        }

        // --- BOTÕES ---
        if (interaction.isButton()) {
            // Decida se precisa de deferReply dependendo do botão
            // Para a maioria, você pode usar reply direto se for interação efêmera
            const { customId, user, guild, message, channel } = interaction;

            // Exemplo: botão "enviar_paineis" – não precisa de defer, pois reply é imediato
            if (customId === "enviar_paineis") {
                // ... lógica de enviar painéis
                // Use reply (não editReply)
                await interaction.reply({ content: "✅ Painéis enviados!", flags: MessageFlags.Ephemeral });
                return;
            }

            // Outros botões... use `deferReply` apenas se precisar de processamento longo
            // e sempre use `editReply` depois.
            // Mas evite duplicar respostas!
        }

        // Se nenhum dos casos acima, responda com erro (caso não tenha respondido)
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: "❌ Interação não reconhecida.", 
                flags: MessageFlags.Ephemeral 
            });
        }

    } catch (err) {
        console.error("Erro geral na interação:", err);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ 
                    content: "❌ Ocorreu um erro inesperado.", 
                    flags: MessageFlags.Ephemeral 
                });
            } catch (e) {}
        }
    }
};