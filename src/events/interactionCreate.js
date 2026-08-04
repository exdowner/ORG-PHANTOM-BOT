const {
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    PermissionFlagsBits
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

            // Atualiza o preview do /setup
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
            const { customId, user, guild, message, channel } = interaction;

            // ----- BOTÃO "ENVIAR PAINÉIS" (do /setup) -----
            if (customId === "enviar_paineis") {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
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

                return await interaction.editReply({ content: `✅ ${enviados} painéis enviados!` });
            }

            // ----- BOTÕES DO PAINEL DE FILA (Entrar / Sair / Confirmar) -----
            if (customId === "entrar_gel_normal" || customId === "sair_fila" || customId === "confirmar_partida") {
                // Defer a resposta para evitar travamentos
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const painelId = message.id;

                // Verifica se a configuração do painel existe
                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    // Tenta recuperar do título do embed
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const nomePainel = partes[0]?.trim() || "PHANTOM";
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { nomePainel, valor, quantidade: 1 };
                    filas.setConfig(painelId, configReal);
                }

                // Ações
                if (customId === "entrar_gel_normal") {
                    // Entra na fila Normal
                    const resultado = filas.entrarFila(painelId, "normal", user);
                    if (!resultado.ok) {
                        return await interaction.editReply({ content: resultado.motivo });
                    }
                } else if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else if (customId === "confirmar_partida") {
                    // Quando confirmar, cria um canal privado
                    const filaNormal = filas.jogadores("normal", painelId);
                    const qtd = (configReal.quantidade || 1) * 2;

                    if (filaNormal.length < qtd) {
                        return await interaction.editReply({ content: "❌ A fila ainda não está completa." });
                    }

                    try {
                        const nomeCanal = `partida-${Date.now()}`;
                        const canalPartida = await guild.channels.create({
                            name: nomeCanal,
                            type: ChannelType.GuildText,
                            permissionOverwrites: [
                                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                ...filaNormal.map(j => ({
                                    id: j.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                }))
                            ]
                        });

                        // Envia mensagem de confirmação
                        await canalPartida.send({
                            content: `👋 Olá ${filaNormal.map(j => `<@${j.id}>`).join(", ")}! A partida foi confirmada.\n\n**Valor:** ${configReal.valor}\n**Quantidade:** ${qtd} jogadores`
                        });

                        await interaction.editReply({ content: `✅ Partida confirmada! Canal criado: <#${canalPartida.id}>` });
                    } catch (err) {
                        console.error("Erro ao criar canal:", err);
                        await interaction.editReply({ content: "❌ Erro ao criar o canal de confirmação." });
                    }
                    return;
                }

                // Atualiza o painel público (embed)
                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId); // (não usado, mas mantido)
                const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito);

                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar painel:", err);
                    // Tentar novamente após 1s
                    setTimeout(async () => {
                        try {
                            await message.edit(novoPainel);
                        } catch (e) {}
                    }, 1000);
                }

                // Resposta ao usuário
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