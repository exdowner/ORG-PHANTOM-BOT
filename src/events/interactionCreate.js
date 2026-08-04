const {
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

// Função para verificar se o usuário pode ver o painel de mediador
function temPermissaoMediador(member, cargosPermitidos) {
    if (member.id === member.guild.ownerId) return true; // Owner sempre pode
    if (!cargosPermitidos || cargosPermitidos.length === 0) return false;
    return member.roles.cache.some(r => cargosPermitidos.includes(r.id));
}

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
                const msg = { content: "❌ Erro ao executar comando!", flags: MessageFlags.Ephemeral };
                if (!interaction.replied && !interaction.deferred) await interaction.reply(msg);
                else await interaction.followUp(msg);
            }
            return;
        }

        // --- MENUS DE SELEÇÃO ---
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
            } else if (interaction.customId === "select_cargos") {
                config.cargosPermitidos = valor; // array de IDs
                salvarConfig(config);
            }

            // Atualiza preview
            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                // Atualizar campos conforme necessário
                if (interaction.customId === "select_modo") {
                    embed.spliceFields(0, 1, { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true });
                } else if (interaction.customId === "select_valor") {
                    embed.spliceFields(1, 1, { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true });
                } else if (interaction.customId === "select_quantidade") {
                    embed.spliceFields(2, 1, { name: "👥 Tamanho da fila:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true });
                } else if (interaction.customId === "select_emoji_gel") {
                    embed.spliceFields(3, 1, { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true });
                } else if (interaction.customId === "select_emoji_emulador") {
                    embed.spliceFields(4, 1, { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true });
                } else if (interaction.customId === "select_cargos") {
                    const cargoList = config.cargosPermitidos?.length ? config.cargosPermitidos.map(id => `<@&${id}>`).join(", ") : "Nenhum";
                    embed.spliceFields(5, 1, { name: "👑 Cargos Permitidos:", value: cargoList, inline: false });
                }
                try {
                    await msgOriginal.edit({ embeds: [embed] });
                } catch (err) {
                    console.error("Erro ao atualizar preview:", err);
                }
            }

            try {
                await interaction.editReply({ content: "✅ Configuração atualizada!" });
            } catch (err) {
                console.error("Erro ao responder menu:", err);
            }
            return;
        }

        // --- BOTÕES ---
        if (interaction.isButton()) {
            const { customId, user, guild, message, channel } = interaction;
            let painelId = null;

            // ======== BOTÃO "ENVIAR PAINÉIS" ========
            if (customId === "enviar_paineis") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
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

                try {
                    await interaction.editReply({ content: `✅ ${enviados} painéis enviados!` });
                } catch (err) {
                    console.error("Erro ao responder botão enviar painéis:", err);
                }
                return;
            }

            // ======== BOTÕES DE FILA (Entrar / Sair) ========
            if (customId === "entrar_fila1" || customId === "entrar_fila2" || customId === "sair_fila") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
                painelId = message.id;

                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    // Fallback
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const modo = partes[0]?.trim() || "Mobile";
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { modo, valor, quantidade: 1, emojiGel: null, emojiEmulador: null, cargosPermitidos: [] };
                    filas.setConfig(painelId, configReal);
                }

                // Mapear tipo de fila: normal (fila1) ou infinito (fila2)
                let tipoFila = null;
                if (customId === "entrar_fila1") {
                    tipoFila = "normal";
                } else if (customId === "entrar_fila2") {
                    tipoFila = "infinito";
                }

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, tipoFila, user);
                    if (!resultado.ok) {
                        try {
                            await interaction.editReply({ content: resultado.motivo });
                        } catch (err) {
                            console.error("Erro ao responder erro de entrada:", err);
                        }
                        return;
                    }
                }

                // Atualizar painel com os confirmados atuais
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
                try {
                    await interaction.editReply({ content: resposta });
                } catch (err) {
                    console.error("Erro ao responder ao jogador:", err);
                }
                return;
            }

            // ======== BOTÃO "CONFIRMAR" ========
            if (customId === "confirmar_partida") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }
                painelId = message.id;

                const configReal = filas.getConfig(painelId);
                if (!configReal) {
                    await interaction.editReply({ content: "❌ Configuração do painel não encontrada." });
                    return;
                }

                const qtd = (configReal.quantidade || 1) * 2;
                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId);
                const totalJogadores = listaNormal.length + listaInfinito.length;
                const confirmados = filas.getConfirmados(painelId);

                // Verifica se a fila está cheia
                if (totalJogadores < qtd) {
                    await interaction.editReply({ content: "❌ A fila ainda não está cheia." });
                    return;
                }

                // Adiciona o jogador à lista de confirmados
                if (!confirmados.includes(user.id)) {
                    filas.adicionarConfirmado(painelId, user.id);
                }

                // Atualiza o painel com os confirmados atualizados
                const novosConfirmados = filas.getConfirmados(painelId);
                const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito, novosConfirmados);
                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar painel após confirmação:", err);
                }

                // Verifica se todos confirmaram
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
                        filas.limparFilas(painelId); // limpa as filas após criar o canal

                        // Menciona os jogadores no canal
                        const jogadoresMencao = [...listaNormal, ...listaInfinito].map(j => `<@${j.id}>`).join(" ");

                        // Painel de controle (ephemeral) para cargos autorizados
                        const cargosPermitidos = configReal.cargosPermitidos || [];

                        // Botões de controle
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

                        // Envia mensagem de boas-vindas pública
                        await canalPartida.send({
                            content: `🎮 **Partida confirmada!** ${jogadoresMencao}`
                        });

                        // Envia painel ephemeral (apenas cargos autorizados e owner podem ver)
                        // Usamos um botão para que o usuário possa interagir, mas a mensagem é ephemeral
                        await canalPartida.send({
                            content: "🛠️ **Painel de Controle** (apenas cargos autorizados)",
                            components: [controlRow, controlRow2],
                            ephemeral: true // ephemeral
                        });

                        await interaction.editReply({ content: `✅ Partida confirmada! Canal criado: <#${canalPartida.id}>` });
                    } catch (err) {
                        console.error("Erro ao criar canal:", err);
                        await interaction.editReply({ content: "❌ Erro ao criar o canal de partida." });
                    }
                } else {
                    // Ainda não confirmaram todos
                    const faltam = qtd - novosConfirmados.length;
                    await interaction.editReply({ content: `✅ Você confirmou! Faltam ${faltam} jogador(es) confirmarem.` });
                }
                return;
            }

            // ======== BOTÕES DO MEDIADOR (ephemeral) ========
            if (customId.startsWith("mediador_")) {
                // Verifica permissão
                const configReal = pegarConfig(); // configuração global (para cargos permitidos)
                const cargosPermitidos = configReal.cargosPermitidos || [];
                if (!temPermissaoMediador(interaction.member, cargosPermitidos)) {
                    await interaction.reply({ content: "❌ Você não tem permissão para usar estes botões.", flags: MessageFlags.Ephemeral });
                    return;
                }

                painelId = interaction.channel.topic || null;
                if (!painelId) {
                    await interaction.reply({ content: "❌ Painel não encontrado.", flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_senha") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_senha_${painelId}`)
                        .setTitle("Senha da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_senha").setLabel("Digite a senha").setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_codigo") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_codigo_${painelId}`)
                        .setTitle("Código da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_codigo").setLabel("Digite o código").setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_cancelar") {
                    await filas.limparFilas(painelId);
                    filas.setMatchStatus(painelId, "cancelada");
                    await interaction.reply({ content: "✅ Partida cancelada. Canal será deletado.", flags: MessageFlags.Ephemeral });
                    setTimeout(async () => {
                        try { await interaction.channel.delete(); } catch (err) { console.error(err); }
                    }, 5000);
                    return;
                }

                if (customId === "mediador_vencedor") {
                    const listaNormal = filas.jogadores("normal", painelId);
                    const listaInfinito = filas.jogadores("infinito", painelId);
                    const select = new StringSelectMenuBuilder()
                        .setCustomId(`select_vencedor_${painelId}`)
                        .setPlaceholder("Escolha o vencedor")
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel("Time A (Normal)").setValue("normal"),
                            new StringSelectMenuOptionBuilder().setLabel("Time B (Infinito)").setValue("infinito")
                        );
                    await interaction.reply({ content: "Escolha o time vencedor:", components: [new ActionRowBuilder().addComponents(select)], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_finalizar") {
                    await filas.limparFilas(painelId);
                    filas.setMatchStatus(painelId, "finalizada");
                    await interaction.reply({ content: "🏁 Partida finalizada. Canal será deletado.", flags: MessageFlags.Ephemeral });
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
                        .setCustomId("input_chave").setLabel("Digite a chave PIX").setStyle(TextInputStyle.Short).setRequired(true);
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
            const painelId = parts.slice(2).join('_');

            if (modalType === 'senha') {
                const senha = interaction.fields.getTextInputValue('input_senha');
                await interaction.editReply({ content: `🔑 Senha definida: \`${senha}\`` });
            } else if (modalType === 'codigo') {
                const codigo = interaction.fields.getTextInputValue('input_codigo');
                await interaction.editReply({ content: `📟 Código: \`${codigo}\`` });
            } else if (modalType === 'pagamento') {
                const chave = interaction.fields.getTextInputValue('input_chave');
                await interaction.editReply({ content: `💰 Chave PIX: \`${chave}\`\n\nEnvie a imagem do QR code neste chat.` });
            }
            return;
        }

        // --- MENU DE VENCEDOR ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_vencedor_')) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const painelId = interaction.customId.replace('select_vencedor_', '');
            const vencedor = interaction.values[0];
            await interaction.editReply({ content: `🏆 Vencedor: **${vencedor === 'normal' ? 'Time A (Normal)' : 'Time B (Infinito)'}**` });
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