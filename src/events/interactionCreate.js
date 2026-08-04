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

        // --- MENU VENCEDOR (Tratado primeiro para não conflitar) ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_vencedor_')) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const painelId = interaction.customId.replace('select_vencedor_', '');
            const vencedor = interaction.values[0];
            await interaction.editReply({ content: `🏆 Vencedor registrado: **${vencedor === 'normal' ? 'Time Normal' : 'Time Infinito'}**` });
            return;
        }

        // --- MENUS DE CONFIGURAÇÃO DO SETUP ---
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

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = msgOriginal.embeds[0];
                const newEmbed = embed.setFields(
                    { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                    { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                    { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                    { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true },
                    { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true }
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
            const { customId, user, guild, message } = interaction;

            // --- BOTÃO "ENVIAR PAINÉIS" ---
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

            // --- BOTÕES DO PAINEL DE FILAS (Entrar, Sair) ---
            if (customId === "entrar_fila1" || customId === "entrar_fila2" || customId === "sair_fila") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                const painelId = message.id;
                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const modo = partes[0]?.trim() || "Mobile";
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { modo, valor, quantidade: 1 };
                    filas.setConfig(painelId, configReal);
                }

                let tipoFila = null;
                if (customId === "entrar_fila1") tipoFila = "normal";
                if (customId === "entrar_fila2") tipoFila = "infinito";

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, tipoFila, user);
                    if (!resultado.ok) {
                        await interaction.editReply({ content: resultado.motivo });
                        return;
                    }
                }

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

            // --- BOTÃO "CONFIRMAR" ---
            if (customId === "confirmar_partida") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                const painelId = message.id;
                const configReal = filas.getConfig(painelId);
                if (!configReal) {
                    await interaction.editReply({ content: "❌ Configuração não encontrada." });
                    return;
                }

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

                        const controlRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId("mediador_senha").setLabel("🔑 Senha").setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder().setCustomId("mediador_codigo").setLabel("📟 Código").setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder().setCustomId("mediador_cancelar").setLabel("❌ Cancelar").setStyle(ButtonStyle.Danger),
                                new ButtonBuilder().setCustomId("mediador_vencedor").setLabel("🏆 Vencedor").setStyle(ButtonStyle.Success)
                            );
                        const controlRow2 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId("mediador_finalizar").setLabel("🏁 Finalizar").setStyle(ButtonStyle.Danger),
                                new ButtonBuilder().setCustomId("mediador_pagamento").setLabel("💰 Pagamento").setStyle(ButtonStyle.Primary)
                            );

                        await canalPartida.send({
                            content: `🎮 **Partida confirmada!** ${jogadoresMencao}`
                        });

                        await canalPartida.send({
                            content: "🛠️ **Painel de Controle do Mediador**",
                            components: [controlRow, controlRow2]
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

            // --- BOTÕES DO MEDIADOR ---
            if (customId.startsWith("mediador_")) {
                const painelId = interaction.channel.topic || null;
                if (!painelId) {
                    await interaction.reply({ content: "❌ Painel não encontrado no tópico do canal.", flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_senha") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_senha_${painelId}`)
                        .setTitle("Senha da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_senha").setLabel("Senha").setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_codigo") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_codigo_${painelId}`)
                        .setTitle("Código da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_codigo").setLabel("Código").setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_cancelar") {
                    await filas.limparFilas(painelId);
                    filas.setMatchStatus(painelId, "cancelada");
                    await interaction.reply({ content: "✅ Partida cancelada.", flags: MessageFlags.Ephemeral });
                    setTimeout(async () => {
                        try { await interaction.channel.delete(); } catch (err) { console.error(err); }
                    }, 5000);
                    return;
                }

                if (customId === "mediador_vencedor") {
                    const select = new StringSelectMenuBuilder()
                        .setCustomId(`select_vencedor_${painelId}`)
                        .setPlaceholder("Vencedor")
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel("Time Normal").setValue("normal"),
                            new StringSelectMenuOptionBuilder().setLabel("Time Infinito").setValue("infinito")
                        );
                    await interaction.reply({ content: "Escolha o time vencedor:", components: [new ActionRowBuilder().addComponents(select)], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_finalizar") {
                    await filas.limparFilas(painelId);
                    filas.setMatchStatus(painelId, "finalizada");
                    await interaction.reply({ content: "🏁 Partida finalizada! Apagando o canal em breve...", flags: MessageFlags.Ephemeral });
                    setTimeout(async () => {
                        try { await interaction.channel.delete(); } catch (err) { console.error(err); }
                    }, 3000);
                    return;
                }

                if (customId === "mediador_pagamento") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_pagamento_${painelId}`)
                        .setTitle("Chave de Pagamento");
                    const input = new TextInputBuilder()
                        .setCustomId("input_chave").setLabel("Chave PIX").setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }
            }
        }

        // --- MODAIS ---
        if (interaction.isModalSubmit()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const customId = interaction.customId;
            const parts = customId.split('_');
            const modalType = parts[1];

            if (modalType === 'senha') {
                const senha = interaction.fields.getTextInputValue('input_senha');
                await interaction.editReply({ content: `🔑 Senha: \`${senha}\`` });
            } else if (modalType === 'codigo') {
                const codigo = interaction.fields.getTextInputValue('input_codigo');
                await interaction.editReply({ content: `📟 Código: \`${codigo}\`` });
            } else if (modalType === 'pagamento') {
                const chave = interaction.fields.getTextInputValue('input_chave');
                await interaction.editReply({ content: `💰 Chave PIX: \`${chave}\`` });
            }
            return;
        }

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