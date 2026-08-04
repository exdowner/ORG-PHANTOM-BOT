const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
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

        // --- MENUS (Valor e Quantidade) ---
        if (interaction.isStringSelectMenu()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }

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
            }

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = msgOriginal.embeds[0];
                const newEmbed = embed.setFields(
                    { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                    { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                    { name: "🔀 Misto:", value: config.modoMisto ? "Ativado" : "Desativado", inline: true }
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

            // --- ALTERNAR MISTO ---
            if (customId === "alternar_misto") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const embed = msgOriginal.embeds[0];
                    const newEmbed = embed.setFields(
                        { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                        { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                        { name: "🔀 Misto:", value: config.modoMisto ? "Ativado" : "Desativado", inline: true }
                    );
                    try {
                        await msgOriginal.edit({ embeds: [newEmbed] });
                    } catch (err) {
                        console.error("Erro ao atualizar preview:", err);
                    }
                }

                // Atualiza o botão Misto
                const row3 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("alternar_misto")
                        .setLabel(config.modoMisto ? "🔀 Misto: Ativado" : "🔀 Misto: Desativado")
                        .setStyle(config.modoMisto ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("salvar_config")
                        .setLabel("💾 Salvar Configuração")
                        .setStyle(ButtonStyle.Primary)
                );
                await interaction.editReply({ 
                    content: "🔄 Modo Misto alterado!", 
                    components: [interaction.message.components[0], interaction.message.components[1], row3] 
                });
                return;
            }

            // --- SALVAR CONFIGURAÇÃO ---
            if (customId === "salvar_config") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
                await interaction.editReply({ content: "✅ Configuração salva com sucesso!" });
                return;
            }

            // --- ENVIAR PAINÉIS ---
            if (customId === "enviar_paineis") {
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

            // --- BOTÕES DO PAINEL (Entrar, Sair, Confirmar) ---
            if (customId === "entrar_fila1" || customId === "entrar_fila2" || customId === "sair_fila" || customId === "confirmar_partida") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                const painelId = message.id;
                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { valor, quantidade: 1, modoMisto: false };
                    filas.setConfig(painelId, configReal);
                }

                // Se for entrar, determina qual fila
                let tipoFila = null;
                if (customId === "entrar_fila1") {
                    tipoFila = "normal";
                } else if (customId === "entrar_fila2") {
                    tipoFila = "infinito";
                }

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else if (customId === "entrar_fila1" || customId === "entrar_fila2") {
                    const resultado = filas.entrarFila(painelId, tipoFila, user);
                    if (!resultado.ok) {
                        await interaction.editReply({ content: resultado.motivo });
                        return;
                    }
                } else if (customId === "confirmar_partida") {
                    // Lógica de confirmação progressiva
                    const qtd = (configReal.quantidade || 1) * 2;
                    const listaNormal = filas.jogadores("normal", painelId);
                    const listaInfinito = filas.jogadores("infinito", painelId);
                    const totalJogadores = listaNormal.length + listaInfinito.length;
                    const confirmados = filas.getConfirmados(painelId);

                    if (totalJogadores < qtd) {
                        await interaction.editReply({ content: "❌ A fila ainda não está cheia." });
                        return;
                    }

                    if (!confirmados.includes(user.id)) {
                        filas.adicionarConfirmado(painelId, user.id);
                    }

                    const novosConfirmados = filas.getConfirmados(painelId);
                    const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito, novosConfirmados);
                    try {
                        await message.edit(novoPainel);
                    } catch (err) {
                        console.error("Erro ao editar painel após confirmação:", err);
                    }

                    if (novosConfirmados.length >= qtd) {
                        // Criar canal da partida
                        try {
                            const nomeCanal = `partida-${Date.now()}`;
                            const canalPartida = await guild.channels.create({
                                name: nomeCanal,
                                type: ChannelType.GuildText,
                                topic: painelId,
                                permissionOverwrites: [
                                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                    ...listaNormal.map(j => ({
                                        id: j.id,
                                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                    })),
                                    ...listaInfinito.map(j => ({
                                        id: j.id,
                                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                    }))
                                ]
                            });

                            filas.setMatchChannel(painelId, canalPartida.id);
                            filas.setMatchStatus(painelId, "confirmada");
                            filas.limparFilas(painelId);

                            const jogadoresMencao = [...listaNormal, ...listaInfinito].map(j => `<@${j.id}>`).join(" ");

                            await canalPartida.send({
                                content: `🎮 **Partida confirmada!** ${jogadoresMencao}`
                            });

                            await interaction.editReply({ content: `✅ Partida confirmada! Canal criado: <#${canalPartida.id}>` });
                        } catch (err) {
                            console.error("Erro ao criar canal:", err);
                            await interaction.editReply({ content: "❌ Erro ao criar o canal de partida." });
                        }
                    } else {
                        const faltam = qtd - novosConfirmados.length;
                        await interaction.editReply({ content: `✅ Você confirmou! Faltam ${faltam} jogador(es) confirmarem.` });
                    }
                    return;
                }

                // Atualiza o painel após entrar/sair
                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId);
                const confirmados = filas.getConfirmados(painelId);
                const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito, confirmados);

                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar painel:", err);
                }

                const resposta = customId === "sair_fila" 
                    ? `🚪 <@${user.id}>, saiu da fila!` 
                    : `✅ <@${user.id}>, entrou na fila!`;
                await interaction.editReply({ content: resposta });
                return;
            }
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