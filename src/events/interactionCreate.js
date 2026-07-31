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

        // --- MODAIS ---
        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();

            if (interaction.customId === "modal_editar_nome_painel") {
                config.nomePainel = interaction.fields.getTextInputValue("input_nome_painel");
            } else if (interaction.customId === "modal_editar_valor") {
                config.valor = interaction.fields.getTextInputValue("input_valor");
            } else if (interaction.customId === "modal_editar_modo") {
                config.modo = interaction.fields.getTextInputValue("input_modo");
            } else if (interaction.customId === "modal_editar_quantidade") {
                const qtd = parseInt(interaction.fields.getTextInputValue("input_quantidade"));
                if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
            }

            salvarConfig(config);

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const novoPreview = painelBuilder(config, [], []);
                await msgOriginal.edit({ embeds: novoPreview.embeds }).catch(() => {});
            }

            return await interaction.editReply({ content: "✅ Configuração alterada!" });
        }

        // --- MENUS DE EMOJIS ---
        if (interaction.isStringSelectMenu()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();
            const valorEscolhido = interaction.values[0];

            if (interaction.customId === "select_emoji_gel_normal") config.emojiGelNormal = valorEscolhido;
            if (interaction.customId === "select_emoji_gel_inf") config.emojiGelInfinito = valorEscolhido;
            if (interaction.customId === "select_emoji_emul1") config.emojiEmul1 = valorEscolhido;
            if (interaction.customId === "select_emoji_emul2") config.emojiEmul2 = valorEscolhido;
            if (interaction.customId === "select_emoji_sair") config.emojiSair = valorEscolhido;

            salvarConfig(config);
            return await interaction.editReply({ content: `✅ Emoji atualizado!` });
        }

        // --- BOTÕES ---
        if (interaction.isButton()) {
            // 🔥 LINHA MÁGICA: Sem isso o erro 404/InteractionNotReplied aparece
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

            const { customId, user, guild, channel, message } = interaction;

            if (customId === "editar_nome_painel") {
                const modal = new ModalBuilder().setCustomId("modal_editar_nome_painel").setTitle("Editar Nome");
                const input = new TextInputBuilder().setCustomId("input_nome_painel").setLabel("Nome do Painel").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_valor") {
                const modal = new ModalBuilder().setCustomId("modal_editar_valor").setTitle("Editar Valor");
                const input = new TextInputBuilder().setCustomId("input_valor").setLabel("Novo Valor").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_modo") {
                const modal = new ModalBuilder().setCustomId("modal_editar_modo").setTitle("Editar Modo");
                const input = new TextInputBuilder().setCustomId("input_modo").setLabel("Novo Modo").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_quantidade") {
                const modal = new ModalBuilder().setCustomId("modal_editar_quantidade").setTitle("Editar Quantidade");
                const input = new TextInputBuilder().setCustomId("input_quantidade").setLabel("Nova Quantidade").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "ativar_misto") {
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const novoPreview = painelBuilder(config, [], []);
                    await msgOriginal.edit({ embeds: novoPreview.embeds }).catch(() => {});
                }
                return await interaction.editReply({ content: `🔄 Misto: ${config.modoMisto ? "Ativado" : "Desativado"}` });
            }

            if (customId === "salvar_config") {
                return await interaction.editReply({ content: "✅ Salvo!" });
            }

            if (customId.startsWith("escolher_emoji_")) {
                const tipo = customId.replace("escolher_emoji_", "");
                const emojisDoServidor = guild.emojis.cache.first(25);

                if (!emojisDoServidor.length) {
                    return await interaction.editReply({ content: "⚠️ Este servidor não possui emojis personalizados!" });
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`select_emoji_${tipo}`)
                    .setPlaceholder("Selecione um emoji do servidor")
                    .addOptions(
                        emojisDoServidor.map(e => ({
                            label: e.name,
                            value: `<:${e.name}:${e.id}>`,
                            emoji: e.id
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);
                return await interaction.editReply({ content: "Escolha o emoji abaixo:", components: [row] });
            }

            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                const painelId = message.id;
                let tipoFila = customId.replace("entrar_", "");
                
                const isEmulador = tipoFila.includes("emulador") || tipoFila.includes("emuladores");

                let nomeFila = tipoFila;
                if (tipoFila === "gel_normal") nomeFila = "normal";
                else if (tipoFila === "gel_inf") nomeFila = "infinito";
                
                if (typeof filas.sairFila !== 'function' || typeof filas.entrarFila !== 'function') {
                    return await interaction.editReply({ content: "❌ Erro: Arquivo de filas não configurado corretamente." });
                }

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, nomeFila, user);
                    if (!resultado.ok) return await interaction.editReply({ content: resultado.motivo });
                }

                const lista1 = filas.jogadores(isEmulador ? "1emulador" : "normal", painelId);
                const lista2 = filas.jogadores(isEmulador ? "2emuladores" : "infinito", painelId);
                
                const configReal = pegarConfig();

                const configMock = {
                    modoMisto: isEmulador,
                    modo: configReal.modo || "Mobile",
                    valor: configReal.valor || "20,00",
                    nomePainel: configReal.nomePainel || "PHANTOM",
                    emojiGelNormal: configReal.emojiGelNormal,
                    emojiGelInfinito: configReal.emojiGelInfinito,
                    emojiEmul1: configReal.emojiEmul1,
                    emojiEmul2: configReal.emojiEmul2,
                    emojiSair: configReal.emojiSair,
                    quantidade: configReal.quantidade || 2
                };

                try {
                    if (typeof painelBuilder === "function") {
                        const novoPainel = painelBuilder(configMock, lista1, lista2);
                        await message.edit(novoPainel).catch(() => {});
                    }
                } catch (err) {
                    console.error("Erro ao atualizar painel público:", err);
                }

                const qtd = configMock.quantidade || 2;
                const filaAtual = lista1.length >= qtd ? lista1 : (lista2.length >= qtd ? lista2 : null);

                if (filaAtual && filaAtual.length >= qtd) {
                    console.log("🎯🎯🎯 FILA COMPLETA!");
                    const ID_CANAL_LOGS = "1532001733750952135"; 
                    const canalLogs = guild.channels.cache.get(ID_CANAL_LOGS);

                    if (canalLogs) {
                        try {
                            const rowBotoes = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder().setCustomId("aceitar_partida").setLabel("✅ Aceitar").setStyle(ButtonStyle.Success),
                                    new ButtonBuilder().setCustomId("cancelar_partida").setLabel("❌ Cancelar").setStyle(ButtonStyle.Danger)
                                );

                            await canalLogs.send({
                                content: `🟢 **NOVA PARTIDA FORMADA!**\n👥 Jogadores: ${filaAtual.map(j => `<@${j.id}>`).join(" e ")}\n📊 Fila: ${isEmulador ? "Mista" : "Gel"} (${qtd}vs${qtd})\n\nClique em **Aceitar** para criar o canal de texto.`,
                                components: [rowBotoes]
                            });
                            console.log("✅ Mensagem enviada para a aba de logs!");
                        } catch (err) {
                            console.error("❌ Erro ao enviar para a aba de logs:", err);
                            await interaction.channel.send({ content: `❌ Erro ao enviar notificação.` });
                        }
                    } else {
                        console.error(`❌ CANAL DE LOGS NÃO ENCONTRADO! ID: ${ID_CANAL_LOGS}`);
                        await interaction.channel.send({ content: `❌ Canal de logs não encontrado!` });
                    }
                }

                if (customId === "sair_fila") {
                    return await interaction.editReply({ content: `🚪 <@${user.id}>, saiu da fila!` });
                }
                return await interaction.editReply({ content: `✅ <@${user.id}>, entrou na fila!` });
            }

            if (customId === "aceitar_partida") {
                const guild = interaction.guild;

                try {
                    const nomeCanal = `partida-${Date.now()}`;
                    const novoCanal = await guild.channels.create({
                        name: nomeCanal,
                        type: ChannelType.GuildText
                    });

                    console.log(`✅ CANAL DE TEXTO CRIADO: #${novoCanal.name}`);
                    await interaction.editReply({ content: `✅ **PARTIDA CONFIRMADA!** Canal de texto criado: <#${novoCanal.id}>` });
                    await novoCanal.send(`👋 Bem-vindos à partida!`);

                    const mensagemPainel = message; 
                    const painelId = mensagemPainel.id;
                    filas.sairFila(painelId, user);

                    const configReal = pegarConfig();
                    const isEmulador = mensagemPainel.embeds[0]?.title?.includes("Emulador") || false;
                    const lista = filas.jogadores(isEmulador ? "1emulador" : "normal", painelId);
                    
                    if (lista && lista.length > 0) {
                        for (let jogador of lista) {
                            filas.sairFila(painelId, jogador);
                        }
                        console.log(`🧹 FILA LIMPA!`);
                    }

                    const novoPainel = painelBuilder(configReal, [], []);
                    await mensagemPainel.edit(novoPainel).catch(() => {});

                } catch (err) {
                    console.error("❌ ERRO AO CRIAR CANAL DE TEXTO:", err);
                    await interaction.editReply({ content: `❌ Erro ao criar o canal de texto.` });
                }
            }

            if (customId === "cancelar_partida") {
                await interaction.editReply({ content: `❌ Partida cancelada pelo jogador.` });
            }

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
        }
    } catch (err) {
        console.error("Erro geral na interação:", err);
    }
};