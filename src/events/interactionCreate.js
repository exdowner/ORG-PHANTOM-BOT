const {
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");
const ranking = require("../systems/ranking.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

module.exports = async (interaction) => {
    try {
        // ----------- COMANDOS SLASH -----------
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

        // ----------- MODAIS (Nome e Modo apenas) -----------
        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();

            if (interaction.customId === "modal_editar_nome_painel") {
                config.nomePainel = interaction.fields.getTextInputValue("input_nome_painel");
            } else if (interaction.customId === "modal_editar_modo") {
                config.modo = interaction.fields.getTextInputValue("input_modo");
                config.modoMisto = false;
            }

            salvarConfig(config);

            // Atualiza o preview do /setup ao vivo
            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                if (interaction.customId === "modal_editar_nome_painel") {
                    embed.spliceFields(0, 1, { name: "**📛 Nome do Painel:**", value: `\`${config.nomePainel || "PHANTOM"}\``, inline: false });
                } else if (interaction.customId === "modal_editar_modo") {
                    embed.spliceFields(1, 1, { name: "**🎮 Modo:**", value: `\`${config.modo || "Mobile"}\``, inline: true });
                    embed.spliceFields(4, 1, { name: "**🔀 Misto:**", value: "Desativado", inline: false });
                }
                await msgOriginal.edit({ embeds: [embed] }).catch(() => {});
            }

            return await interaction.editReply({ content: "✅ Configuração alterada!" });
        }

        // ----------- MENUS DE SELEÇÃO (Valor, Quantidade e Emojis) -----------
        if (interaction.isStringSelectMenu()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();
            const valorEscolhido = interaction.values[0];

            if (interaction.customId === "select_valor") {
                config.valor = valorEscolhido;
            } else if (interaction.customId === "select_quantidade") {
                const qtd = parseInt(valorEscolhido);
                if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
            } else if (interaction.customId === "select_emoji_gel_normal") {
                config.emojiGelNormal = valorEscolhido;
            } else if (interaction.customId === "select_emoji_gel_inf") {
                config.emojiGelInfinito = valorEscolhido;
            } else if (interaction.customId === "select_emoji_emul1") {
                config.emojiEmul1 = valorEscolhido;
            } else if (interaction.customId === "select_emoji_emul2") {
                config.emojiEmul2 = valorEscolhido;
            } else if (interaction.customId === "select_emoji_sair") {
                config.emojiSair = valorEscolhido;
            }

            salvarConfig(config);

            // Atualiza o preview do /setup ao vivo
            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                if (interaction.customId === "select_valor") {
                    embed.spliceFields(2, 1, { name: "**💰 Valor:**", value: `\`${config.valor || "20,00"}\``, inline: true });
                } else if (interaction.customId === "select_quantidade") {
                    embed.spliceFields(3, 1, { name: "**👥 Multiplicador:**", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true });
                }
                await msgOriginal.edit({ embeds: [embed] }).catch(() => {});
            }

            return await interaction.editReply({ content: "✅ Configuração alterada!" });
        }

        // ----------- BOTÕES -----------
        if (interaction.isButton()) {
            const { customId, user, guild, message, channel } = interaction;

            // =========== BOTÕES QUE ABREM MODAIS (NÃO TEM deferReply) ===========
            if (customId === "editar_nome_painel") {
                const modal = new ModalBuilder().setCustomId("modal_editar_nome_painel").setTitle("Editar Nome");
                const input = new TextInputBuilder().setCustomId("input_nome_painel").setLabel("Nome do Painel").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_modo") {
                const modal = new ModalBuilder().setCustomId("modal_editar_modo").setTitle("Editar Modo");
                const input = new TextInputBuilder().setCustomId("input_modo").setLabel("Novo Modo (Mobile ou Emulador)").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            // =========== BOTÕES DE ESCOLHA DE EMOJI (NÃO TEM deferReply) ===========
            if (customId.startsWith("escolher_emoji_")) {
                const tipo = customId.replace("escolher_emoji_", "");
                const emojisDoServidor = guild.emojis.cache.first(25);
                if (!emojisDoServidor.length) {
                    return await interaction.reply({ content: "⚠️ Este servidor não possui emojis personalizados!", flags: MessageFlags.Ephemeral });
                }
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`select_emoji_${tipo}`)
                    .setPlaceholder("Selecione um emoji do servidor")
                    .addOptions(
                        emojisDoServidor.map(e =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(e.name)
                                .setValue(`<:${e.name}:${e.id}>`)
                                .setEmoji({ id: e.id, name: e.name })
                        )
                    );
                const row = new ActionRowBuilder().addComponents(selectMenu);
                return await interaction.reply({ content: "Escolha o emoji abaixo:", components: [row], flags: MessageFlags.Ephemeral });
            }

            // =========== BOTÕES QUE PRECISAM DE deferReply ===========
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

            if (customId === "ativar_misto") {
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const embed = EmbedBuilder.from(msgOriginal.embeds[0]);
                    embed.spliceFields(4, 1, { name: "**🔀 Misto:**", value: config.modoMisto ? "Ativado" : "Desativado", inline: false });
                    await msgOriginal.edit({ embeds: [embed] }).catch(() => {});
                }
                return await interaction.editReply({ content: `🔄 Misto: ${config.modoMisto ? "Ativado" : "Desativado"}` });
            }

            if (customId === "salvar_config") {
                return await interaction.editReply({ content: "✅ Salvo!" });
            }

            // 🔥 BOTÃO "ENVIAR PAINEL" (Simula o /setupenvia)
            if (customId === "enviar_painel_agora") {
                const config = pegarConfig();
                if (!config.quantidade) config.quantidade = 1;

                const painel = painelBuilder(config, [], []);
                const msg = await interaction.channel.send({
                    embeds: painel.embeds,
                    components: painel.components
                });

                filas.setConfig(msg.id, config);
                return await interaction.editReply({ content: "✅ Painel enviado com sucesso!" });
            }

            // =========== BOTÕES DE RANKING E PERFIL ===========
            if (customId === "btn_meu_perfil") {
                const perfil = ranking.pegarPerfil(user.id);
                const total = perfil.vitorias + perfil.derrotas;
                const wr = total > 0 ? ((perfil.vitorias / total) * 100).toFixed(1) : "0.0";
                const embed = new EmbedBuilder()
                    .setColor("#5865F2")
                    .setTitle(`👤 Perfil de ${user.username}`)
                    .addFields(
                        { name: "🏆 Vitórias", value: `${perfil.vitorias}`, inline: true },
                        { name: "❌ Derrotas", value: `${perfil.derrotas}`, inline: true },
                        { name: "📊 Winrate", value: `${wr}%`, inline: true }
                    );
                return await interaction.editReply({ embeds: [embed] });
            }

            if (customId === "btn_ver_ranking") {
                const top20 = ranking.pegarTop20();
                if (top20.length === 0) return await interaction.editReply({ content: "⚠️ Ninguém pontuou ainda!" });
                const lista = top20.map((j, i) => `**#${i + 1}** <@${j.id}> — **${j.vitorias}** V`).join("\n");
                const embed = new EmbedBuilder().setColor("#FEE75C").setTitle("🏆 Top 20 Ranking").setDescription(lista);
                return await interaction.editReply({ embeds: [embed] });
            }

            // =========== CRIAÇÃO E FECHAMENTO DE TICKETS ===========
            if (customId === "abrir_ticket") {
                const ticketsExistentes = guild.channels.cache.filter(c => 
                    c.type === ChannelType.GuildText && 
                    c.name.startsWith(`ticket-${user.username}`)
                );
                
                if (ticketsExistentes.size > 0) {
                    return await interaction.editReply({ 
                        content: `❌ Você já possui um ticket aberto! Acesse: <#${ticketsExistentes.first().id}>` 
                    });
                }

                try {
                    const nomeTicket = `ticket-${user.username}`;
                    const ticketChannel = await guild.channels.create({
                        name: nomeTicket,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                        ]
                    });

                    const fecharRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("🔒 Fechar Ticket")
                                .setStyle(ButtonStyle.Danger)
                        );

                    await ticketChannel.send({
                        content: `👋 Olá <@${user.id}>, bem-vindo ao seu ticket de suporte!\n\nDescreva o seu problema abaixo que nossa equipe irá te ajudar o mais rápido possível.\n\nClique no botão abaixo para fechar este ticket quando quiser.`,
                        components: [fecharRow]
                    });

                    return await interaction.editReply({ 
                        content: `✅ Ticket criado com sucesso! Acesse: <#${ticketChannel.id}>` 
                    });

                } catch (err) {
                    console.error("Erro ao criar ticket:", err);
                    return await interaction.editReply({ 
                        content: `❌ Erro ao criar o ticket. Verifique se o bot tem permissão para criar canais.` 
                    });
                }
            }

            if (customId === "fechar_ticket") {
                const canal = interaction.channel;
                if (!canal.name.startsWith("ticket-")) {
                    return await interaction.editReply({ content: "❌ Este comando só pode ser usado em um ticket." });
                }
                try {
                    await canal.delete();
                    await interaction.editReply({ content: "✅ Ticket fechado com sucesso!" });
                } catch (err) {
                    console.error("Erro ao fechar ticket:", err);
                    await interaction.editReply({ content: "❌ Erro ao fechar o ticket. Verifique minhas permissões." });
                }
            }

            // =========== LÓGICA DAS FILAS (ENTRAR / SAIR) ===========
            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                const painelId = message.id;

                // 🔥 Pega a configuração CONGELADA do filas.js
                const configReal = filas.getConfig(painelId);
                if (!configReal) {
                    return await interaction.editReply({ content: "❌ Este painel está corrompido. Use /setupenvia para gerar um novo." });
                }

                const isMisto = configReal.modoMisto === true;
                const isEmulador = isMisto || (configReal.modo && configReal.modo.toLowerCase() === "emulador");

                let tipoFila = customId.replace("entrar_", "");
                let nomeFila = tipoFila;
                if (tipoFila === "gel_normal") nomeFila = "normal";
                else if (tipoFila === "gel_inf") nomeFila = "infinito";

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, nomeFila, user);
                    if (!resultado.ok) return await interaction.editReply({ content: resultado.motivo });
                }

                const lista1 = filas.jogadores(isEmulador ? "1emulador" : "normal", painelId);
                const lista2 = filas.jogadores(isEmulador ? "2emuladores" : "infinito", painelId);

                const configMock = {
                    modoMisto: configReal.modoMisto,
                    modo: configReal.modo || "Mobile",
                    valor: configReal.valor || "20,00",
                    nomePainel: configReal.nomePainel || configReal.nome || "PHANTOM",
                    emojiGelNormal: configReal.emojiGelNormal,
                    emojiGelInfinito: configReal.emojiGelInfinito,
                    emojiEmul1: configReal.emojiEmul1,
                    emojiEmul2: configReal.emojiEmul2,
                    emojiSair: configReal.emojiSair,
                    quantidade: configReal.quantidade || 1
                };

                try {
                    if (typeof painelBuilder === "function") {
                        const novoPainel = painelBuilder(configMock, lista1, lista2);
                        await message.edit(novoPainel).catch(() => {});
                    }
                } catch (err) {
                    console.error("Erro ao atualizar painel público:", err);
                }

                if (customId === "sair_fila") {
                    return await interaction.editReply({ content: `🚪 <@${user.id}>, saiu da fila!` });
                }
                return await interaction.editReply({ content: `✅ <@${user.id}>, entrou na fila!` });
            }
        }
    } catch (err) {
        console.error("Erro geral na interação:", err);
    }
};