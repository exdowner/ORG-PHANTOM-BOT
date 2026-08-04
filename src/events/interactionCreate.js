const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
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
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "❌ Erro ao executar comando!", flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.followUp({ content: "❌ Erro ao executar comando!", flags: MessageFlags.Ephemeral });
                }
            }
            return;
        }

        // --- MENUS ---
        if (interaction.isStringSelectMenu()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }

            const config = pegarConfig();
            const valor = interaction.values[0];

            if (interaction.customId === "select_modo") {
                config.modo = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_valor") {
                config.valor = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_quantidade") {
                const qtd = parseInt(valor);
                if (!isNaN(qtd) && qtd > 0) {
                    config.quantidade = qtd;
                    salvarConfig(config);
                }
            } else if (interaction.customId === "select_emoji_gel") {
                config.emojiGel = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_emoji_emulador") {
                config.emojiEmulador = valor;
                salvarConfig(config);
            }

            // Atualiza preview (se existir)
            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = msgOriginal.embeds[0];
                // Reconstruir campos simples (ou você pode usar EmbedBuilder.from)
                const newEmbed = embed.setFields(
                    { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                    { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                    { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                    { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true },
                    { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true },
                    { name: "👑 Cargos:", value: config.cargosPermitidos?.length ? config.cargosPermitidos.map(id => `<@&${id}>`).join(", ") : "Nenhum", inline: false }
                );
                try {
                    await msgOriginal.edit({ embeds: [newEmbed] });
                } catch (err) {
                    console.error("Erro ao atualizar preview:", err);
                }
            }

            await interaction.editReply({ content: "✅ Configuração atualizada!" });
            return;
        }

        // --- BOTÕES ---
        if (interaction.isButton()) {
            const { customId, user, guild, message, channel } = interaction;

            // Botão "Enviar Painéis"
            if (customId === "enviar_paineis") {
                // Não precisa de defer, pois reply é imediato
                const configBase = pegarConfig();
                if (!configBase.quantidade) configBase.quantidade = 1;

                const valores = ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"];
                let enviados = 0;

                for (const valor of valores) {
                    const configAtual = { ...configBase, valor };
                    const painel = painelBuilder(configAtual, [], []);
                    if (!painel.components || painel.components.length === 0) continue;

                    try {
                        const msg = await interaction.channel.send({
                            embeds: painel.embeds,
                            components: painel.components
                        });
                        filas.setConfig(msg.id, configAtual);
                        enviados++;
                    } catch (err) {
                        console.error(`Erro ao enviar painel com valor ${valor}:`, err);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                await interaction.reply({ content: `✅ ${enviados} painéis enviados!`, flags: MessageFlags.Ephemeral });
                return;
            }

            // Outros botões do painel (entrar, sair, confirmar, mediador...)
            // Você deve implementar a lógica aqui, mas sem chamar deferReply desnecessariamente.
            // Para evitar duplicidade, uso reply ou editReply conforme necessário.
            // Exemplo de estrutura (preencher com seu código):
            /*
            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                // ...
                await interaction.reply({ content: "...", flags: MessageFlags.Ephemeral });
            }
            if (customId === "confirmar_partida") {
                // ...
                await interaction.reply({ content: "...", flags: MessageFlags.Ephemeral });
            }
            // Botões do mediador...
            */
        }

        // Se nenhum caso foi atendido
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Interação não reconhecida.", flags: MessageFlags.Ephemeral });
        }

    } catch (err) {
        console.error("Erro geral na interação:", err);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: "❌ Ocorreu um erro inesperado.", flags: MessageFlags.Ephemeral });
            } catch (e) {}
        }
    }
};