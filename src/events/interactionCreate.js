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

// 🔥 SUBSTITUA ESSES IDs PELOS IDS REAIS DO SEU SERVIDOR
const MEDIADOR_ROLE_ID = "ID_DO_CARGO_MEDIADOR";
const ADMIN_ROLE_ID = "ID_DO_CARGO_ADMIN";

function temPermissaoMediador(member) {
    return member.roles.cache.has(MEDIADOR_ROLE_ID) || member.roles.cache.has(ADMIN_ROLE_ID);
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

        // --- MENUS DE SELEÇÃO (Valor e Quantidade) ---
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
                const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                if (interaction.customId === "select_valor") {
                    embed.spliceFields(0, 1, { name: "💰 Valor selecionado:", value: `\`${config.valor || "5,00"}\``, inline: true });
                } else {
                    embed.spliceFields(1, 1, { name: "👥 Tamanho da fila:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true });
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

            // 🔥 CORREÇÃO DA REDECLARAÇÃO: Declaramos uma única vez
            let painelId = null;

            // ======== BOTÃO "ENVIAR PAINÉIS" (do /setup) ========
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

            // ======== BOTÕES DO PAINEL DE FILA ========
            if (customId === "entrar_gel_normal" || customId === "entrar_gel_infinito" || customId === "sair_fila") {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                }

                // 🔥 Atribuição única
                painelId = message.id;

                let configReal = filas.getConfig(painelId);
                if (!configReal) {
                    const titulo = message.embeds[0]?.title || "";
                    const partes = titulo.split("|");
                    const nomePainel = partes[0]?.trim() || "PHANTOM";
                    const valor = partes[1]?.trim() || "5,00";
                    configReal = { nomePainel, valor, quantidade: 1 };
                    filas.setConfig(painelId, configReal);
                }

                const tipoFila = customId === "entrar_gel_normal" ? "normal" : 
                                 customId === "entrar_gel_infinito" ? "infinito" : null;

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

                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId);
                const novoPainel = painelBuilder(configReal, listaNormal, listaInfinito);

                try {
                    await message.edit(novoPainel);
                } catch (err) {
                    console.error("Erro ao editar painel (mensagem deletada?):", err);
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

                // 🔥 Atribuição única
                painelId = message.id;

                const configReal = filas.getConfig(painelId);
                if (!configReal) {
                    await interaction.editReply({ content: "❌ Configuração do painel não encontrada." });
                    return;
                }

                const qtd = (configReal.quantidade || 1) * 2;
                const listaNormal = filas.jogadores("normal", painelId);
                const listaInfinito = filas.jogadores("infinito", painelId);

                if (listaNormal.length < qtd) {
                    await interaction.editReply({ content: "❌ A fila ainda não está cheia." });
                    return;
                }

                // Cria o canal temporário
                try {
                    const nomeCanal = `partida-${Date.now()}`;
                    const canalPartida = await guild.channels.create({
                        name: nomeCanal,
                        type: ChannelType.GuildText,
                        // 🔥 Salva o painelId no tópico do canal para ser lido pelo Mediador depois
                        topic: painelId,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
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

                    // Salva o ID do canal na fila
                    filas.setMatchChannel(painelId, canalPartida.id);
                    filas.setMatchStatus(painelId, "confirmada");

                    // Envia mensagem de boas-vindas com o painel de mediador
                    const controlRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("mediador_senha")
                                .setLabel("🔑 Definir Senha")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId("mediador_codigo")
                                .setLabel("📟 Código da Sala")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId("mediador_cancelar")
                                .setLabel("❌ Cancelar Partida")
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId("mediador_vencedor")
                                .setLabel("🏆 Declarar Vencedor")
                                .setStyle(ButtonStyle.Success)
                        );

                    const controlRow2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("mediador_finalizar")
                                .setLabel("🏁 Finalizar Partida")
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId("mediador_pagamento")
                                .setLabel("💰 Chave de Pagamento")
                                .setStyle(ButtonStyle.Primary)
                        );

                    await canalPartida.send({
                        content: `🎮 **Partida confirmada!**\nJogadores: ${[...listaNormal, ...listaInfinito].map(j => `<@${j.id}>`).join(", ")}`,
                        components: [controlRow, controlRow2]
                    });

                    await interaction.editReply({ content: `✅ Partida confirmada! Canal criado: <#${canalPartida.id}>` });
                } catch (err) {
                    console.error("Erro ao criar canal:", err);
                    await interaction.editReply({ content: "❌ Erro ao criar o canal de partida." });
                }
                return;
            }

            // ======== BOTÕES DO MEDIADOR ========
            if (customId.startsWith("mediador_")) {
                // Verifica permissão
                if (!temPermissaoMediador(interaction.member)) {
                    await interaction.reply({ content: "❌ Você não tem permissão para usar estes botões.", flags: MessageFlags.Ephemeral });
                    return;
                }

                // 🔥 Lê o painelId diretamente do tópico do canal da partida
                painelId = interaction.channel.topic || null;

                if (!painelId) {
                    await interaction.reply({ content: "❌ Painel não encontrado. Canal sem tópico.", flags: MessageFlags.Ephemeral });
                    return;
                }

                // Exemplo de ação: abrir modal para senha
                if (customId === "mediador_senha") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_senha_${painelId}`)
                        .setTitle("Definir Senha da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_senha")
                        .setLabel("Digite a senha")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_codigo") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_codigo_${painelId}`)
                        .setTitle("Código da Sala");
                    const input = new TextInputBuilder()
                        .setCustomId("input_codigo")
                        .setLabel("Digite o código da sala")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(input));
                    await interaction.showModal(modal);
                    return;
                }

                if (customId === "mediador_cancelar") {
                    const canal = interaction.channel;
                    await filas.limparFilas(painelId);
                    filas.setMatchStatus(painelId, "cancelada");
                    await interaction.reply({ content: "✅ Partida cancelada. Canal será deletado.", flags: MessageFlags.Ephemeral });
                    setTimeout(async () => {
                        try {
                            await canal.delete();
                        } catch (err) {
                            console.error("Erro ao deletar canal:", err);
                        }
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
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Time A (Gel Normal)")
                                .setValue("normal"),
                            new StringSelectMenuOptionBuilder()
                                .setLabel("Time B (Gel Infinito)")
                                .setValue("infinito")
                        );
                    const row = new ActionRowBuilder().addComponents(select);
                    await interaction.reply({ content: "Escolha o time vencedor:", components: [row], flags: MessageFlags.Ephemeral });
                    return;
                }

                if (customId === "mediador_finalizar") {
                    await interaction.reply({ content: "🏁 Partida finalizada! Canal será deletado.", flags: MessageFlags.Ephemeral });
                    const canal = interaction.channel;
                    setTimeout(async () => {
                        try {
                            await canal.delete();
                        } catch (err) {
                            console.error("Erro ao deletar canal:", err);
                        }
                    }, 3000);
                    return;
                }

                if (customId === "mediador_pagamento") {
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_pagamento_${painelId}`)
                        .setTitle("Chave de Pagamento");
                    const inputChave = new TextInputBuilder()
                        .setCustomId("input_chave")
                        .setLabel("Digite a chave PIX")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(inputChave));
                    await interaction.showModal(modal);
                    return;
                }

                await interaction.reply({ content: "Botão em desenvolvimento.", flags: MessageFlags.Ephemeral });
                return;
            }
        }

        // ======== MODAIS (respostas dos mediadores) ========
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
                await interaction.editReply({ content: `📟 Código da sala: \`${codigo}\`` });
            } else if (modalType === 'pagamento') {
                const chave = interaction.fields.getTextInputValue('input_chave');
                await interaction.editReply({ content: `💰 Chave PIX: \`${chave}\`\n\nEnvie a imagem do QR code neste chat.` });
            }
            return;
        }

        // ======== MENU DE SELEÇÃO DO VENCEDOR ========
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_vencedor_')) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }
            const painelId = interaction.customId.replace('select_vencedor_', '');
            const vencedor = interaction.values[0];
            await interaction.editReply({ content: `🏆 Vencedor declarado: **${vencedor === 'normal' ? 'Time A (Gel Normal)' : 'Time B (Gel Infinito)'}**` });
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