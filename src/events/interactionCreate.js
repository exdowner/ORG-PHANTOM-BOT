const { 
    EmbedBuilder, 
    MessageFlags, 
    PermissionFlagsBits, 
    ChannelType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require("discord.js");
const ranking = require("../systems/ranking.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const { pegarConfig, salvarConfig } = require("../systems/config.js");
const { enviarPreview } = require("../commands/setup.js"); 

module.exports = async (interaction) => {
    // 1. COMANDOS SLASH
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

    // 2. SUBMISSÃO DE MODAIS (EDITOR DE SETUP)
    if (interaction.isModalSubmit()) {
        const config = pegarConfig();

        if (interaction.customId === "modal_editar_valor") {
            config.valor = interaction.fields.getTextInputValue("input_valor");
        } else if (interaction.customId === "modal_editar_modo") {
            config.modo = interaction.fields.getTextInputValue("input_modo");
        } else if (interaction.customId === "modal_editar_quantidade") {
            const qtd = parseInt(interaction.fields.getTextInputValue("input_quantidade"));
            if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
        } else if (interaction.customId === "modal_editar_emojis") {
            config.emojiGelNormal = interaction.fields.getTextInputValue("input_emoji_normal") || config.emojiGelNormal;
            config.emojiGelInfinito = interaction.fields.getTextInputValue("input_emoji_infinito") || config.emojiGelInfinito;
            config.emojiSair = interaction.fields.getTextInputValue("input_emoji_sair") || config.emojiSair;
        }

        salvarConfig(config);
        await enviarPreview(interaction, config);
        return;
    }

    // 3. INTERAÇÃO DE BOTÕES
    if (interaction.isButton()) {
        const { customId, user, guild, channel, message } = interaction;

        // --- BOTÕES DO EDITOR DE SETUP ---
        if (customId === "editar_valor") {
            const modal = new ModalBuilder()
                .setCustomId("modal_editar_valor")
                .setTitle("Editar Valor do X1/Partida");
            
            const input = new TextInputBuilder()
                .setCustomId("input_valor")
                .setLabel("Novo Valor (Ex: R$ 10,00 ou 500 gemas)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        if (customId === "editar_modo") {
            const modal = new ModalBuilder()
                .setCustomId("modal_editar_modo")
                .setTitle("Editar Modo de Jogo");
            
            const input = new TextInputBuilder()
                .setCustomId("input_modo")
                .setLabel("Novo Modo (Ex: Mobile, X1 dos Crias)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        if (customId === "editar_quantidade") {
            const modal = new ModalBuilder()
                .setCustomId("modal_editar_quantidade")
                .setTitle("Editar Quantidade de Jogadores");
            
            const input = new TextInputBuilder()
                .setCustomId("input_quantidade")
                .setLabel("Quantidade por time (Ex: 2 para X2)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        if (customId === "editar_emojis") {
            const modal = new ModalBuilder()
                .setCustomId("modal_editar_emojis")
                .setTitle("Editar Emojis do Painel");
            
            const inputNormal = new TextInputBuilder().setCustomId("input_emoji_normal").setLabel("Emoji Gel Normal / 1 Emul").setStyle(TextInputStyle.Short).setRequired(false);
            const inputInf = new TextInputBuilder().setCustomId("input_emoji_infinito").setLabel("Emoji Gel Infinito / 2 Emul").setStyle(TextInputStyle.Short).setRequired(false);
            const inputSair = new TextInputBuilder().setCustomId("input_emoji_sair").setLabel("Emoji Botão Sair").setStyle(TextInputStyle.Short).setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputNormal),
                new ActionRowBuilder().addComponents(inputInf),
                new ActionRowBuilder().addComponents(inputSair)
            );
            return await interaction.showModal(modal);
        }

        if (customId === "ativar_misto") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const config = pegarConfig();
            config.modoMisto = !(config.modoMisto === true || config.modoMisto === "true");
            salvarConfig(config);
            await enviarPreview(interaction, config);
            return;
        }

        if (customId === "salvar_config") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            return await interaction.editReply({ content: "✅ Configurações salvas e aplicadas com sucesso!" });
        }

        // --- TICKET DE SUPORTE ---
        if (customId === "abrir_ticket") {
            const canalExistente = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
            if (canalExistente) {
                return await interaction.reply({
                    content: `⚠️ Você já possui um ticket aberto em <#${canalExistente.id}>!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            try {
                const canalTicket = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                        { id: guild.roles.cache.find(r => r.permissions.has(PermissionFlagsBits.Administrator))?.id || guild.ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
                    ]
                });

                const embedTicket = new EmbedBuilder()
                    .setColor("#5865F2")
                    .setTitle(`📩 Atendimento - ${user.username}`)
                    .setDescription(`Bem-vindo <@${user.id}>! Descreva seu problema ou dúvida aqui.\nA equipe de suporte irá atendê-lo em breve.`)
                    .setFooter({ text: "ORG PHANTOM • Suporte" });

                const rowFechar = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("fechar_ticket_canal")
                        .setLabel("Encerrar Ticket")
                        .setEmoji("🔒")
                        .setStyle(ButtonStyle.Danger)
                );

                await canalTicket.send({ content: `<@${user.id}>`, embeds: [embedTicket], components: [rowFechar] });
                return await interaction.editReply({ content: `✅ Ticket criado em <#${canalTicket.id}>!` });
            } catch (err) {
                console.error(err);
                return await interaction.editReply({ content: "❌ Erro ao criar canal de ticket!" });
            }
        }

        if (customId === "fechar_ticket_canal") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: "❌ Apenas ADM pode encerrar o ticket!", flags: MessageFlags.Ephemeral });
            }
            await interaction.reply({ content: "🔒 Encerrando e deletando em 5 segundos..." });
            setTimeout(() => channel.delete().catch(() => {}), 5000);
            return;
        }

        // --- SISTEMA DE FILAS (ATUALIZAÇÃO PÚBLICA PARA O OPONENTE VER) ---
        if (customId.startsWith("entrar_") || customId === "sair_fila") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const painelId = message.id;

            let tipoFila = customId.replace("entrar_", "");
            if (tipoFila === "gel_normal") tipoFila = "normal";
            if (tipoFila === "gel_inf") tipoFila = "infinito";

            if (customId === "sair_fila") {
                filas.sairFila(painelId, user);
            } else {
                const resultado = filas.entrarFila(painelId, tipoFila, user);
                if (!resultado.ok) {
                    return await interaction.editReply({ content: resultado.motivo });
                }
            }

            const isMisto = tipoFila.includes("emulador");
            const lista1 = filas.jogadores(isMisto ? "1emulador" : "normal", painelId);
            const lista2 = filas.jogadores(isMisto ? "2emuladores" : "infinito", painelId);

            const tituloAtual = message.embeds[0]?.title || "";
            const configMock = {
                modo: tituloAtual.split("|")[0]?.trim() || "X1",
                valor: tituloAtual.split("|")[1]?.trim() || "R$ 10,00",
                quantidade: 2,
                modoMisto: isMisto
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
                return await interaction.editReply({ content: `🚪 <@${user.id}>, você saiu de todas as filas com sucesso!` });
            }

            return await interaction.editReply({
                content: `✅ <@${user.id}>, você entrou na fila com sucesso!`
            });
        }

        // --- BOTÕES DO RANKING ---
        if (customId === "btn_meu_perfil") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const perfil = ranking.pegarPerfil(user.id);
            const total = perfil.vitorias + perfil.derrotas;
            const wr = total > 0 ? ((perfil.vitorias / total) * 100).toFixed(1) : "0.0";

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle(`👤 Perfil de ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "🏆 Vitórias", value: `${perfil.vitorias}`, inline: true },
                    { name: "❌ Derrotas", value: `${perfil.derrotas}`, inline: true },
                    { name: "📊 Winrate", value: `${wr}%`, inline: true },
                    { name: "🔥 Winstreak", value: `${perfil.winstreak}`, inline: true },
                    { name: "⚡ Maior Winstreak", value: `${perfil.maxWinstreak}`, inline: true }
                )
                .setFooter({ text: "ORG PHANTOM | Sistema de Ranking" });

            return await interaction.editReply({ embeds: [embed] });
        }

        if (customId === "btn_ver_ranking") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const top20 = ranking.pegarTop20();
            if (top20.length === 0) {
                return await interaction.editReply({ content: "⚠️ Ninguém pontuou ainda!" });
            }

            const lista = top20.map((j, i) => `${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`} <@${j.id}> — **${j.vitorias}** V (🔥 ${j.winstreak})`).join("\n");

            const embed = new EmbedBuilder()
                .setColor("#FEE75C")
                .setTitle("🏆 Top 20 Ranking Geral")
                .setDescription(lista)
                .setFooter({ text: "ORG PHANTOM | Atualizado em tempo real" });

            return await interaction.editReply({ embeds: [embed] });
        }
    }
};