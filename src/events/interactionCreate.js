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
    TextInputStyle,
    StringSelectMenuBuilder 
} = require("discord.js");
const ranking = require("../systems/ranking.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");

const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => {});

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

            if (interaction.customId === "modal_editar_valor") {
                config.valor = interaction.fields.getTextInputValue("input_valor");
            } else if (interaction.customId === "modal_editar_modo") {
                config.modo = interaction.fields.getTextInputValue("input_modo");
            } else if (interaction.customId === "modal_editar_quantidade") {
                const qtd = parseInt(interaction.fields.getTextInputValue("input_quantidade"));
                if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
            }

            salvarConfig(config);

            return await interaction.editReply({ 
                content: "✅ Configuração alterada com sucesso! O painel de preview foi atualizado." 
            });
        }

        if (interaction.isStringSelectMenu()) {
            const { customId, values, guild } = interaction;
            const valorEscolhido = values[0];

            // 1. PRIMEIRO MENU: Selecionar qual categoria de emoji configurar
            if (customId === "select_categoria_emoji") {
                const emojisDoServidor = guild.emojis.cache.first(25);

                if (!emojisDoServidor.length) {
                    return await interaction.reply({ 
                        content: "⚠️ Este servidor não possui emojis personalizados salvos para listar!", 
                        flags: MessageFlags.Ephemeral 
                    });
                }

                const selectEmojiMenu = new StringSelectMenuBuilder()
                    .setCustomId(`select_emoji_${valorEscolhido}`)
                    .setPlaceholder("Selecione o novo emoji do servidor")
                    .addOptions(
                        emojisDoServidor.map(e => ({
                            label: e.name,
                            value: `<:${e.name}:${e.id}>`,
                            emoji: e.id
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectEmojiMenu);
                return await interaction.update({ 
                    content: `🔧 Categoria selecionada: **${valorEscolhido.replace(/_/g, " ").toUpperCase()}**\nEscolha o novo emoji abaixo:`, 
                    components: [row] 
                });
            }

            // 2. SEGUNDO MENU: Salvar o emoji escolhido para a categoria correspondente
            if (customId.startsWith("select_emoji_")) {
                const categoria = customId.replace("select_emoji_", "");
                const config = pegarConfig();

                if (categoria === "gel_normal") config.emojiGelNormal = valorEscolhido;
                if (categoria === "gel_infinito") config.emojiGelInfinito = valorEscolhido;
                if (categoria === "emul1") config.emojiEmul1 = valorEscolhido;
                if (categoria === "emul2") config.emojiEmul2 = valorEscolhido;
                if (categoria === "sair") config.emojiSair = valorEscolhido;

                salvarConfig(config);

                return await interaction.update({ 
                    content: "✅ Emoji atualizado com sucesso.", 
                    components: [] 
                });
            }
        }

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

            // NOVO FLUXO: Botão único para iniciar a configuração de emojis via StringSelectMenu
            if (customId === "configurar_emojis") {
                const selectCategoria = new StringSelectMenuBuilder()
                    .setCustomId("select_categoria_emoji")
                    .setPlaceholder("Selecione qual emoji deseja alterar")
                    .addOptions([
                        { label: "Gel Normal", value: "gel_normal", emoji: "🧊" },
                        { label: "Gel Infinito", value: "gel_infinito", emoji: "♾️" },
                        { label: "Emulador 1", value: "emul1", emoji: "📱" },
                        { label: "Emulador 2", value: "emul2", emoji: "💻" },
                        { label: "Sair", value: "sair", emoji: "🚪" }
                    ]);

                const row = new ActionRowBuilder().addComponents(selectCategoria);
                return await interaction.reply({ 
                    content: "⚙️ Selecione abaixo qual emoji você deseja configurar:", 
                    components: [row], 
                    flags: MessageFlags.Ephemeral 
                });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

            if (customId === "ativar_misto") {
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);
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
    }
};