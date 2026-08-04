const {
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

module.exports = async (interaction) => {
    try {
        // ----- COMANDOS SLASH -----
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                const msg = { content: "❌ Erro ao executar comando!", flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
                else await interaction.reply(msg);
            }
            return;
        }

        // ----- MENUS DE SELEÇÃO (Valor e Quantidade) -----
        if (interaction.isStringSelectMenu()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const config = pegarConfig();
            const valor = interaction.values[0];

            if (interaction.customId === "select_valor") {
                config.valor = valor;
            } else if (interaction.customId === "select_quantidade") {
                const qtd = parseInt(valor);
                if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
            }

            salvarConfig(config);

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                if (interaction.customId === "select_valor") {
                    embed.spliceFields(0, 1, { name: "💰 Valor selecionado:", value: `\`${config.valor || "20,00"}\``, inline: true });
                } else {
                    embed.spliceFields(1, 1, { name: "👥 Tamanho da fila:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true });
                }
                await msgOriginal.edit({ embeds: [embed] });
            }

            return await interaction.editReply({ content: "✅ Configuração atualizada!" });
        }

        // ----- BOTÕES -----
        if (interaction.isButton()) {
            const { customId, user, guild, message } = interaction;

            // ----- BOTÃO "ENVIAR PAINÉIS" (do /setup) -----
            if (customId === "enviar_paineis") {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                const configBase = pegarConfig();
                if (!configBase.quantidade) configBase.quantidade = 1;

                const valores = ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"];
                let enviados = 0;

                for (const valor of valores) {
                    const configAtual = { ...configBase, valor };
                    const painel = painelBuilder(configAtual, []);
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

                return await interaction.editReply({ content: `✅ ${enviados} painéis enviados!` });
            }

            // ----- BOTÕES DO PAINEL DE FILA (Entrar / Sair) -----
            if (customId === "entrar_fila" || customId === "sair_fila") {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const painelId = message.id;

                // Verifica ou recupera a configuração do painel
                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const nomePainel = partes[0]?.trim() || "PHANTOM";
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { nomePainel, valor, quantidade: 1 };
                    filas.setConfig(painelId, configReal);
                }

                // Ações
                if (customId === "entrar_fila") {
                    const resultado = filas.entrarFila(painelId, "normal", user);
                    if (!resultado.ok) {
                        return await interaction.editReply({ content: resultado.motivo });
                    }
                } else if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                }

                // Atualiza o painel público (agora recebe apenas uma lista)
                const lista = filas.jogadores("normal", painelId);
                const novoPainel = painelBuilder(configReal, lista);

                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar painel:", err);
                    setTimeout(async () => {
                        try {
                            await message.edit(novoPainel);
                        } catch (e) {}
                    }, 1000);
                }

                if (customId === "sair_fila") {
                    return await interaction.editReply({ content: `🚪 <@${user.id}>, saiu da fila!` });
                } else {
                    return await interaction.editReply({ content: `✅ <@${user.id}>, entrou na fila!` });
                }
            }
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