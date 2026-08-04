const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

// Armazena temporariamente qual campo de emoji o usuário escolheu editar
let editTarget = {}; 

module.exports = async (interaction) => {
    try {
        const config = pegarConfig();

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

        // --- MENU VENCEDOR DO MEDIADOR ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_vencedor_')) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const vencedor = interaction.values[0];
            await interaction.editReply({ content: `🏆 Vencedor registrado: **${vencedor === 'normal' ? 'Time Normal / A' : 'Time Infinito / B'}**` });
            return;
        }

        // --- SELETORES DO SETUP ---
        if (interaction.isStringSelectMenu()) {
            if (["select_modo", "select_valor", "select_emoji_universal"].includes(interaction.customId)) {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }

                if (interaction.customId === "select_modo") {
                    config.modo = interaction.values[0];
                } else if (interaction.customId === "select_valor") {
                    config.valor = interaction.values[0];
                } else if (interaction.customId === "select_emoji_universal") {
                    const target = editTarget[interaction.user.id];
                    const emojiId = interaction.values[0];

                    if (target && emojiId !== "none") {
                        const emojiObj = interaction.guild.emojis.cache.get(emojiId);
                        if (emojiObj) {
                            config[target] = `<:${emojiObj.name}:${emojiObj.id}>`;
                        }
                    }
                    // Limpa a seleção ativa do usuário para evitar sobreposição nos próximos cliques
                    delete editTarget[interaction.user.id];
                }

                // Salva permanentemente a configuração
                salvarConfig(config);

                // Atualiza o Embed no setup mantendo TODOS os valores já salvos
                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const newEmbed = EmbedBuilder.from(msgOriginal.embeds[0])
                        .setFields(
                            { name: "🎮 Modo", value: `\`${config.modo || "Mobile"}\``, inline: true },
                            { name: "💰 Valor", value: `\`R$ ${config.valor || "5,00"}\``, inline: true },
                            { name: "👥 Tamanho", value: `\`${(config.quantidade || 1) * 2} Players\``, inline: true },
                            { name: "🧊 Gel Normal", value: config.emojiGelNormal || "🧊", inline: true },
                            { name: "♾️ Gel Infinito", value: config.emojiGelInfinito || "♾️", inline: true },
                            { name: "📱 1 Emulador", value: config.emojiEmu1 || "📱", inline: true },
                            { name: "💻 2 Emuladores", value: config.emojiEmu2 || "💻", inline: true }
                        );

                    await interaction.editReply({ 
                        content: "✅ Configuração atualizada com sucesso!",
                        embeds: [newEmbed] 
                    });
                }
                return;
            }
        }

        // --- BOTÕES DO SETUP E PAINÉIS ---
        if (interaction.isButton()) {
            const { customId, user, guild, message } = interaction;

            // --- SELECIONAR CAMPO DE EMOJI PARA EDITAR ---
            if (customId.startsWith("edit_")) {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }

                const targets = { 
                    edit_gel_normal: "emojiGelNormal", 
                    edit_gel_infinito: "emojiGelInfinito", 
                    edit_emu1: "emojiEmu1", 
                    edit_emu2: "emojiEmu2" 
                };

                const nomesFormatados = {
                    edit_gel_normal: "Gel Normal 🧊",
                    edit_gel_infinito: "Gel Infinito ♾️",
                    edit_emu1: "1 Emulador 📱",
                    edit_emu2: "2 Emuladores 💻"
                };

                editTarget[user.id] = targets[customId];

                await interaction.followUp({ 
                    content: `👉 Seleção ativa para **${nomesFormatados[customId]}**. Escolha o emoji desejado no menu **"Selecionar Emoji"**.`, 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            // --- ENVIO ÚNICO (SNAPSHOT INDEPENDENTE) ---
            if (customId === "enviar_unico") {
                const snapshot = JSON.parse(JSON.stringify(config));
                const painel = painelBuilder(snapshot, [], []);

                try {
                    const msg = await interaction.channel.send({ embeds: painel.embeds, components: painel.components });
                    filas.setConfig(msg.id, snapshot);
                    await interaction.reply({ 
                        content: `✅ Painel único enviado (**${snapshot.modo || "Mobile"}** - R$ ${snapshot.valor || "5,00"})!`, 
                        flags: MessageFlags.Ephemeral 
                    });
                } catch (err) {
                    console.error("Erro ao enviar painel único:", err);
                    await interaction.reply({ content: "❌ Erro ao enviar painel no canal.", flags: MessageFlags.Ephemeral });
                }
                return;
            }

            // --- ENVIO DO PACK COMPLETO (100,00 ATÉ 0,50) ---
            if (customId === "enviar_todos_valores") {
                await interaction.reply({ content: "⏳ Enviando pack de 9 painéis...", flags: MessageFlags.Ephemeral });
                const valores = ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"];
                let enviados = 0;

                for (const v of valores) {
                    const snapshot = JSON.parse(JSON.stringify(config));
                    snapshot.valor = v;
                    const painel = painelBuilder(snapshot, [], []);

                    try {
                        const msg = await interaction.channel.send({ embeds: painel.embeds, components: painel.components });
                        filas.setConfig(msg.id, snapshot);
                        enviados++;
                    } catch (err) {
                        console.error(`Erro ao enviar painel R$ ${v}:`, err);
                    }
                    await new Promise(r => setTimeout(r, 800));
                }

                await interaction.editReply({ content: `✅ Pack concluído! ${enviados}/9 painéis enviados com sucesso.` });
                return;
            }

            // --- BOTÕES DE FILA (Entrar / Sair) ---
            if (customId === "entrar_fila1" || customId === "entrar_fila2" || customId === "sair_fila") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                const painelId = message.id;
                let configReal = filas.getConfig(painelId);

                // Fallback de segurança caso o bot reinicie
                if (!configReal) {
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const modo = partes[0]?.trim() || "Mobile";
                    const valor = partes[1]?.replace("R$", "")?.trim() || "5,00";
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
                    console.error("Erro ao editar painel de fila:", err);
                }

                const resposta = customId === "sair_fila" 
                    ? `🚪 <@${user.id}>, você saiu da fila!` 
                    : `✅ <@${user.id}>, você entrou na fila!`;
                await interaction.editReply({ content: resposta });
                return;
            }

            // --- BOTÃO CONFIRMAR PRESENÇA ---
            if (customId === "confirmar_partida") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                const painelId = message.id;
                const configReal = filas.getConfig(painelId);
                if (!configReal) {
                    await interaction.editReply({ content: "❌ Configuração da partida não encontrada." });
                    return;
                }

                const qtd = (configReal.quantidade || 1) * 2;
                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId);
                const totalJogadores = listaNormal.length + listaInfinito.length;

                if (totalJogadores < qtd) {
                    await interaction.editReply({ content: "❌ A fila precisa estar totalmente cheia!" });
                    return;
                }

                if (!filas.getConfirmados(painelId).includes(user.id)) {
                    filas.adicionarConfirmado(painelId, user.id);
                }

                const novosConfirmados = filas.getConfirmados(painelId);
                const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito, novosConfirmados);

                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar confirmação:", err);
                }

                if (novosConfirmados.length >= qtd) {
                    try {
                        const canalPartida = await guild.channels.create({
                            name: `partida-${Date.now().toString().slice(-4)}`,
                            type: ChannelType.GuildText,
                            topic: painelId,
                            permissionOverwrites: [
                                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                ...listaNormal.map(j => ({ id: j.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] })),
                                ...listaInfinito.map(j => ({ id: j.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
                            ]
                        });

                        filas.setMatchChannel(painelId, canalPartida.id);
                        filas.setMatchStatus(painelId, "confirmada");
                        filas.limparFilas(painelId);

                        const jogadoresMencao = [...listaNormal, ...listaInfinito].map(j => `<@${j.id}>`).join(" ");

                        const controlRow1 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("mediador_senha").setLabel("🔑 Senha").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("mediador_codigo").setLabel("📟 Código").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("mediador_cancelar").setLabel("❌ Cancelar").setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId("mediador_vencedor").setLabel("🏆 Vencedor").setStyle(ButtonStyle.Success)
                        );
                        const controlRow2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("mediador_finalizar").setLabel("🏁 Finalizar").setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId("mediador_pagamento").setLabel("💰 Pagamento").setStyle(ButtonStyle.Primary)
                        );

                        await canalPartida.send({ content: `🎮 **Partida confirmada!** ${jogadoresMencao}` });
                        await canalPartida.send({ content: "🛠️ **Painel do Mediador**", components: [controlRow1, controlRow2] });

                        await interaction.editReply({ content: `✅ Partida confirmada! Canal criado: <#${canalPartida.id}>` });
                    } catch (err) {
                        console.error("Erro ao criar canal:", err);
                        await interaction.editReply({ content: "❌ Ocorreu um erro ao criar o canal da partida." });
                    }
                } else {
                    const faltam = qtd - novosConfirmados.length;
                    await interaction.editReply({ content: `✅ Presença confirmada! Faltam ${faltam} jogador(es).` });
                }
                return;
            }

            // --- AÇÕES DO PAINEL DO MEDIADOR ---
            if (customId.startsWith("mediador_")) {
                const painelId = interaction.channel.topic || null;
                if (!painelId) {
                    await interaction.reply({ content: "❌ Erro: ID do painel não encontrado no tópico.", flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_senha") {
                    const modal = new ModalBuilder().setCustomId(`modal_senha_${painelId}`).setTitle("Senha da Sala");
                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("input_senha").setLabel("Senha").setStyle(TextInputStyle.Short).setRequired(true)
                    ));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_codigo") {
                    const modal = new ModalBuilder().setCustomId(`modal_codigo_${painelId}`).setTitle("Código da Sala");
                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("input_codigo").setLabel("Código").setStyle(TextInputStyle.Short).setRequired(true)
                    ));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_cancelar") {
                    await filas.limparFilas(painelId);
                    await interaction.reply({ content: "✅ Partida cancelada. Excluindo canal em 5 segundos...", flags: MessageFlags.Ephemeral });
                    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
                    return;
                }

                if (customId === "mediador_vencedor") {
                    const select = new StringSelectMenuBuilder()
                        .setCustomId(`select_vencedor_${painelId}`)
                        .setPlaceholder("Selecione o vencedor")
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel("Time Normal / Time A").setValue("normal"),
                            new StringSelectMenuOptionBuilder().setLabel("Time Infinito / Time B").setValue("infinito")
                        );
                    await interaction.reply({ content: "Escolha o time vencedor:", components: [new ActionRowBuilder().addComponents(select)], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_finalizar") {
                    await filas.limparFilas(painelId);
                    await interaction.reply({ content: "🏁 Partida finalizada! Apagando o canal em breve...", flags: MessageFlags.Ephemeral });
                    setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                    return;
                }

                if (customId === "mediador_pagamento") {
                    const modal = new ModalBuilder().setCustomId(`modal_pagamento_${painelId}`).setTitle("Chave PIX");
                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("input_chave").setLabel("Chave PIX").setStyle(TextInputStyle.Short).setRequired(true)
                    ));
                    await interaction.showModal(modal);
                    return;
                }
            }
        }

        // --- SUBMISSÃO DE MODAIS ---
        if (interaction.isModalSubmit()) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const modalType = interaction.customId.split('_')[1];

            if (modalType === 'senha') {
                const senha = interaction.fields.getTextInputValue('input_senha');
                await interaction.editReply({ content: `🔑 **Senha da Sala:** \`${senha}\`` });
            } else if (modalType === 'codigo') {
                const codigo = interaction.fields.getTextInputValue('input_codigo');
                await interaction.editReply({ content: `📟 **Código da Sala:** \`${codigo}\`` });
            } else if (modalType === 'pagamento') {
                const chave = interaction.fields.getTextInputValue('input_chave');
                await interaction.editReply({ content: `💰 **Chave PIX:** \`${chave}\`` });
            }
            return;
        }

    } catch (err) {
        console.error("Erro geral na interação:", err);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: "❌ Ocorreu um erro ao processar esta ação.", flags: MessageFlags.Ephemeral });
            } catch (e) {}
        }
    }
};