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
    StringSelectMenuOptionBuilder
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

        // --- TRATAMENTO DOS MODAIS (Valor, Modo, Qtd) + PREVIEW AO VIVO ---
        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();

            if (interaction.customId === "modal_editar_valor") {
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
                const embedAtualizado = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
                    .setDescription("As mudanças aparecem aqui em tempo real")
                    .addFields(
                        { name: "**Modo:**", value: `${config.modo || "mobile"}`, inline: false },
                        { name: "**Valor:**", value: `${config.valor || "20,00"}`, inline: false },
                        { name: "**Quantidade:**", value: `${config.quantidade || 2} jogadores`, inline: false },
                        { name: "**Misto:**", value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", inline: false }
                    )
                    .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });
                await msgOriginal.edit({ embeds: [embedAtualizado] }).catch(() => {});
            }

            return await interaction.editReply({ 
                content: "✅ Configuração alterada com sucesso! O painel de preview foi atualizado." 
            });
        }

        // --- TRATAMENTO DOS MENUS DE SELEÇÃO DE EMOJIS ---
        if (interaction.isStringSelectMenu()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();
            const valorEscolhido = interaction.values[0];
            const emojiFinal = valorEscolhido === "NONE" ? "" : valorEscolhido;

            if (interaction.customId === "select_emoji_gel_normal") {
                config.emojiGelNormal = emojiFinal;
            } else if (interaction.customId === "select_emoji_gel_inf") {
                config.emojiGelInfinito = emojiFinal;
            } else if (interaction.customId === "select_emoji_emul1") {
                config.emojiEmul1 = emojiFinal;
            } else if (interaction.customId === "select_emoji_emul2") {
                config.emojiEmul2 = emojiFinal;
            } else if (interaction.customId === "select_emoji_sair") {
                config.emojiSair = emojiFinal;
            }

            salvarConfig(config);

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embedAtualizado = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
                    .setDescription("As mudanças aparecem aqui em tempo real")
                    .addFields(
                        { name: "**Modo:**", value: `${config.modo || "mobile"}`, inline: false },
                        { name: "**Valor:**", value: `${config.valor || "20,00"}`, inline: false },
                        { name: "**Quantidade:**", value: `${config.quantidade || 2} jogadores`, inline: false },
                        { name: "**Misto:**", value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", inline: false }
                    )
                    .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });
                await msgOriginal.edit({ embeds: [embedAtualizado] }).catch(() => {});
            }

            return await interaction.editReply({ content: `✅ Emoji atualizado com sucesso!` });
        }

        // --- TRATAMENTO DOS BOTÕES ---
        if (interaction.isButton()) {
            const { customId, user, guild, channel, message } = interaction;

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
                const input = new TextInputBuilder().setCustomId("input_quantidade").setLabel("Quantidade por time").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

            if (customId === "ativar_misto") {
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const embedAtualizado = new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
                        .setDescription("As mudanças aparecem aqui em tempo real")
                        .addFields(
                            { name: "**Modo:**", value: `${config.modo || "mobile"}`, inline: false },
                            { name: "**Valor:**", value: `${config.valor || "20,00"}`, inline: false },
                            { name: "**Quantidade:**", value: `${config.quantidade || 2} jogadores`, inline: false },
                            { name: "**Misto:**", value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", inline: false }
                        )
                        .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });
                    await msgOriginal.edit({ embeds: [embedAtualizado] }).catch(() => {});
                }
                return await interaction.editReply({ content: `🔄 Modo misto agora está: **${config.modoMisto ? "ATIVADO" : "DESATIVADO"}**` });
            }

            if (customId === "salvar_config") {
                return await interaction.editReply({ content: "✅ Configurações salvas e aplicadas com sucesso!" });
            }

            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                const painelId = message.id;
                let tipoFila = customId.replace("entrar_", "");
                if (tipoFila === "gel_normal") tipoFila = "normal";
                if (tipoFila === "gel_inf") tipoFila = "infinito";

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, tipoFila, user);
                    if (!resultado.ok) return await interaction.editReply({ content: resultado.motivo });
                }

                const isMisto = tipoFila.includes("emulador");
                const lista1 = filas.jogadores(isMisto ? "1emulador" : "normal", painelId);
                const lista2 = filas.jogadores(isMisto ? "2emuladores" : "infinito", painelId);

                const tituloAtual = message.embeds[0]?.title || "";
                
                const configMock = pegarConfig();
                configMock.modo = tituloAtual.split("|")[0]?.trim() || configMock.modo;
                configMock.valor = tituloAtual.split("|")[1]?.trim() || configMock.valor;
                configMock.modoMisto = isMisto;

                try {
                    if (typeof painelBuilder === "function") {
                        const novoPainel = painelBuilder(configMock, lista1, lista2);
                        await message.edit(novoPainel).catch(() => {});
                    }
                } catch (err) {
                    console.error("Erro ao atualizar painel público:", err);
                }

                if (customId === "sair_fila") {
                    return await interaction.editReply({ content: `🚪 <@${user.id}>, você saiu de todas as filas!` });
                }
                return await interaction.editReply({ content: `✅ <@${user.id}>, você entrou na fila!` });
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
        // Evita que o bot trave por completo caso algo dê errado
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Ocorreu um erro interno.", flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
};