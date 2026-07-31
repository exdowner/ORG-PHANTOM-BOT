const { EmbedBuilder, MessageFlags, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ranking = require("../systems/ranking.js");

module.exports = async (interaction) => {
    // 1. TRATAMENTO DE COMANDOS SLASH
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erro em /${interaction.commandName}:`, error);
            const msg = { content: "❌ Ocorreu um erro ao executar este comando!", flags: MessageFlags.Ephemeral };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(msg);
            } else {
                await interaction.reply(msg);
            }
        }
        return;
    }

    // 2. TRATAMENTO DE BOTÕES (COM RESPOSTA INSTANTÂNEA)
    if (interaction.isButton()) {
        const { customId, user, guild, channel } = interaction;

        // --- BOTÃO DE TICKET (SUPORTE) ---
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
                return await interaction.editReply({ content: `✅ Seu ticket foi criado com sucesso em <#${canalTicket.id}>!` });
            } catch (err) {
                console.error("Erro ao criar ticket:", err);
                return await interaction.editReply({ content: "❌ Ocorreu um erro ao criar o seu ticket!" });
            }
        }

        // --- FECHAR TICKET NO CANAL ---
        if (customId === "fechar_ticket_canal") {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: "❌ Apenas administradores podem encerrar este ticket!", flags: MessageFlags.Ephemeral });
            }
            await interaction.reply({ content: "🔒 Encerrando e deletando este ticket em 5 segundos..." });
            setTimeout(() => channel.delete().catch(() => {}), 5000);
            return;
        }

        // --- BOTÕES DE FILAS / APOSTAS ---
        if (
            customId.startsWith("entrar_") || 
            customId === "sair_fila" || 
            customId.startsWith("cancelar_") || 
            customId.startsWith("encerrar_")
        ) {
            // Responde imediatamente para o Discord não dar timeout de 3 segundos
            return await interaction.reply({
                content: `✅ Ação processada com sucesso!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // --- BOTÃO: MEU PERFIL ---
        if (customId === "btn_meu_perfil") {
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
                    { name: "🔥 Sequência Atual", value: `${perfil.winstreak}`, inline: true },
                    { name: "⚡ Maior Sequência", value: `${perfil.maxWinstreak}`, inline: true }
                )
                .setFooter({ text: "ORG PHANTOM | Sistema de Ranking" });

            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        // --- BOTÃO: VER RANKING ---
        if (customId === "btn_ver_ranking") {
            const top20 = ranking.pegarTop20();
            if (top20.length === 0) {
                return await interaction.reply({ content: "⚠️ Ninguém pontuou no ranking ainda!", flags: MessageFlags.Ephemeral });
            }

            const lista = top20.map((j, i) => {
                const pos = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
                return `${pos} <@${j.id}> — **${j.vitorias}** Vitórias (🔥 ${j.winstreak} seq.)`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setColor("#FEE75C")
                .setTitle("🏆 Top 20 Ranking Geral")
                .setDescription(lista)
                .setFooter({ text: "ORG PHANTOM | Atualizado em tempo real" });

            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};