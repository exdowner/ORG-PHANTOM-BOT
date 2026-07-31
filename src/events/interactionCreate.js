const { EmbedBuilder, MessageFlags, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ranking = require("../systems/ranking.js");
const filas = require("../systems/filas.js");

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

    // 2. INTERAÇÃO DE BOTÕES
    if (interaction.isButton()) {
        const { customId, user, guild, channel, message } = interaction;

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

        // --- SISTEMA DE FILAS (COM QUEBRAS DE LINHA CORRETAS) ---
        if (customId.startsWith("entrar_") || customId === "sair_fila") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const painelId = message.id;

            if (customId === "sair_fila") {
                filas.sairFila(painelId, user);
                return await interaction.editReply({
                    content: `🚪 <@${user.id}>, você saiu de todas as filas deste painel com sucesso!`
                });
            }

            const tipoFila = customId.replace("entrar_", "");
            const resultado = filas.entrarFila(painelId, tipoFila, user);

            if (!resultado.ok) {
                return await interaction.editReply({
                    content: resultado.motivo
                });
            }

            // Atualiza o painel público com as quebras de linha certas
            try {
                const embedAntigo = message.embeds[0];
                if (embedAntigo) {
                    const novoEmbed = EmbedBuilder.from(embedAntigo);
                    
                    const jNormal = filas.jogadores("normal", painelId).map(j => `<@${j.id}>`).join(", ") || "Vazio";
                    const jInfinito = filas.jogadores("infinito", painelId).map(j => `<@${j.id}>`).join(", ") || "Vazio";
                    const j1Emul = filas.jogadores("1emulador", painelId).map(j => `<@${j.id}>`).join(", ") || "Vazio";
                    const j2Emul = filas.jogadores("2emuladores", painelId).map(j => `<@${j.id}>`).join(", ") || "Vazio";

                    const novaDescricao = [
                        `**Status da Fila Atualizada:**`,
                        `🧊 **Gel Normal:** ${jNormal}`,
                        `♾️ **Gel Infinito:** ${jInfinito}`,
                        `🟢 **1 Emulador:** ${j1Emul}`,
                        `🟢 **2 Emuladores:** ${j2Emul}`
                    ].join("\n");

                    novoEmbed.setDescription(novaDescricao);
                    await message.edit({ embeds: [novoEmbed] }).catch(() => {});
                }
            } catch (err) {
                console.error("Erro ao atualizar o painel público:", err);
            }

            return await interaction.editReply({
                content: `✅ <@${user.id}>, você entrou na fila **${tipoFila.toUpperCase()}** com sucesso!`
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