const { 
    EmbedBuilder, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    StringSelectMenuBuilder
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

        if (interaction.isButton()) {
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

            if (customId.startsWith("escolher_emoji_")) {
                const tipo = customId.replace("escolher_emoji_", "");
                const emojisDoServidor = guild.emojis.cache.first(25);

                if (!emojisDoServidor.length) {
                    return await interaction.reply({ content: "⚠️ Sem emojis personalizados!", flags: MessageFlags.Ephemeral });
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
                return await interaction.reply({ content: "Escolha o emoji:", components: [row], flags: MessageFlags.Ephemeral });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

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

            // --- Lógica das Filas (Entrar/Sair) ---
            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                const painelId = message.id;
                let tipoFila = customId.replace("entrar_", "");
                
                // AQUI É A CORREÇÃO MILIONÁRIA! 
                // O bot vai ler o que está no CUSTOM ID e decidir o que é Misto
                const isEmulador = tipoFila.includes("emulador") || tipoFila.includes("emuladores");

                // Mapeamento correto das filas para o banco
                let nomeFila = tipoFila;
                if (tipoFila === "gel_normal") nomeFila = "normal";
                else if (tipoFila === "gel_inf") nomeFila = "infinito";
                // Para emulador, mantemos o nome exato que o banco espera
                
                if (typeof filas.sairFila !== 'function' || typeof filas.entrarFila !== 'function') {
                    return await interaction.editReply({ content: "❌ Erro: Arquivo de filas não configurado corretamente." });
                }

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, nomeFila, user);
                    if (!resultado.ok) return await interaction.editReply({ content: resultado.motivo });
                }

                // Pega as listas com base no que o botão disse ser
                const lista1 = filas.jogadores(isEmulador ? "1emulador" : "normal", painelId);
                const lista2 = filas.jogadores(isEmulador ? "2emuladores" : "infinito", painelId);
                
                const configMock = pegarConfig();
                // AQUI É A MÁGICA: O modo Misto é decidido pelo que o usuário clicou!
                configMock.modoMisto = isEmulador;
                // Passamos o resto das configs
                configMock.modo = configMock.modo || "Mobile";
                configMock.valor = configMock.valor || "20,00";
                configMock.nomePainel = configMock.nomePainel || "PHANTOM";
                configMock.emojiGelNormal = configMock.emojiGelNormal || "🧊";
                configMock.emojiGelInfinito = configMock.emojiGelInfinito || "♾️";
                configMock.emojiEmul1 = configMock.emojiEmul1 || "📱";
                configMock.emojiEmul2 = configMock.emojiEmul2 || "💻";
                configMock.emojiSair = configMock.emojiSair || "🚪";

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