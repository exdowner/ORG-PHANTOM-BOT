const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

// Guarda o ID da mensagem do setup principal para atualizar a Embed depois
let msgSetupId = {};

module.exports = async (interaction) => {
    try {
        const config = pegarConfig();

        // --- COMANDOS SLASH ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
            return;
        }

        // --- SELEÇÃO DE EMOJI PERSONALIZADO NO MENU EFÊMERO ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith("set_emoji_")) {
            await interaction.deferUpdate();

            const campo = interaction.customId.replace("set_emoji_", ""); // ex: emojiGelNormal
            const emojiId = interaction.values[0];

            if (emojiId !== "none") {
                const emojiObj = interaction.guild.emojis.cache.get(emojiId);
                if (emojiObj) {
                    config[campo] = `<:${emojiObj.name}:${emojiObj.id}>`;
                    salvarConfig(config);
                }
            }

            // Tenta atualizar a Embed do painel principal de setup
            const mainMsgId = msgSetupId[interaction.user.id];
            if (mainMsgId) {
                const mainMsg = await interaction.channel.messages.fetch(mainMsgId).catch(() => null);
                if (mainMsg && mainMsg.embeds.length > 0) {
                    const newEmbed = EmbedBuilder.from(mainMsg.embeds[0])
                        .setFields(
                            { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                            { name: "💰 Valor:", value: `R$ ${config.valor || "5,00"}`, inline: true },
                            { name: "👥 Tamanho:", value: `${config.quantidade || 1}x${config.quantidade || 1}`, inline: true },
                            { name: "🧊 Gel Normal:", value: config.emojiGelNormal || "🧊", inline: true },
                            { name: "♾️ Gel Infinito:", value: config.emojiGelInfinito || "♾️", inline: true },
                            { name: "📱 1 Emu:", value: config.emojiEmu1 || "📱", inline: true },
                            { name: "💻 2 Emus:", value: config.emojiEmu2 || "💻", inline: true }
                        );

                    await mainMsg.edit({ embeds: [newEmbed] }).catch(() => {});
                }
            }

            // Deleta a mensagem efêmera do seletor
            await interaction.deleteReply().catch(() => {});
            return;
        }

        // --- SELETORES DO SETUP (MODO E VALOR) ---
        if (interaction.isStringSelectMenu()) {
            if (["select_modo", "select_valor"].includes(interaction.customId)) {
                await interaction.deferUpdate();

                if (interaction.customId === "select_modo") {
                    config.modo = interaction.values[0];
                } else if (interaction.customId === "select_valor") {
                    config.valor = interaction.values[0];
                }

                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const newEmbed = EmbedBuilder.from(msgOriginal.embeds[0])
                        .setFields(
                            { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                            { name: "💰 Valor:", value: `R$ ${config.valor || "5,00"}`, inline: true },
                            { name: "👥 Tamanho:", value: `${config.quantidade || 1}x${config.quantidade || 1}`, inline: true },
                            { name: "🧊 Gel Normal:", value: config.emojiGelNormal || "🧊", inline: true },
                            { name: "♾️ Gel Infinito:", value: config.emojiGelInfinito || "♾️", inline: true },
                            { name: "📱 1 Emu:", value: config.emojiEmu1 || "📱", inline: true },
                            { name: "💻 2 Emus:", value: config.emojiEmu2 || "💻", inline: true }
                        );

                    await interaction.editReply({ embeds: [newEmbed] });
                }
                return;
            }
        }

        // --- BOTÕES DO SETUP ---
        if (interaction.isButton()) {
            const { customId, user, guild, message } = interaction;

            // --- BOTÕES DE DEFINIR EMOJI (ABRE SELETOR EFÊMERO COM EMOJIS DO SERVIDOR) ---
            if (customId.startsWith("edit_")) {
                msgSetupId[user.id] = message.id; // Guarda a referência do painel principal

                const targets = { 
                    edit_gel_normal: { key: "emojiGelNormal", nome: "Gel Normal 🧊" }, 
                    edit_gel_infinito: { key: "emojiGelInfinito", nome: "Gel Infinito ♾️" }, 
                    edit_emu1: { key: "emojiEmu1", nome: "1 Emulador 📱" }, 
                    edit_emu2: { key: "emojiEmu2", nome: "2 Emuladores 💻" } 
                };

                const targetInfo = targets[customId];

                // Pega os emojis customizados cadastrados no servidor
                const emojisServidor = guild.emojis.cache.first(25).map(e => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(e.name)
                        .setValue(e.id)
                        .setEmoji({ id: e.id, name: e.name })
                );

                if (emojisServidor.length === 0) {
                    await interaction.reply({ content: "❌ O servidor não possui emojis personalizados cadastrados.", flags: MessageFlags.Ephemeral });
                    return;
                }

                const menuEmoji = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`set_emoji_${targetInfo.key}`)
                        .setPlaceholder(`Selecione o emoji do servidor para ${targetInfo.nome}`)
                        .addOptions(emojisServidor)
                );

                await interaction.reply({ 
                    content: `✨ Escolha no menu abaixo o emoji do servidor para **${targetInfo.nome}**:`, 
                    components: [menuEmoji], 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            // --- ENVIO ÚNICO DO PAINEL ---
            if (customId === "enviar_unico") {
                const snapshot = JSON.parse(JSON.stringify(config));
                const painel = painelBuilder(snapshot, [], []);

                try {
                    const msg = await interaction.channel.send({ embeds: painel.embeds, components: painel.components });
                    filas.setConfig(msg.id, snapshot);
                    await interaction.reply({ content: `✅ Painel enviado com sucesso!`, flags: MessageFlags.Ephemeral });
                } catch (err) {
                    console.error("Erro ao enviar painel:", err);
                    await interaction.reply({ content: "❌ Erro ao enviar painel.", flags: MessageFlags.Ephemeral });
                }
                return;
            }

            // --- ENVIO DO PACK COMPLETO ---
            if (customId === "enviar_todos_valores") {
                await interaction.reply({ content: "⏳ Enviando pack...", flags: MessageFlags.Ephemeral });
                const valores = ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"];

                for (const v of valores) {
                    const snapshot = JSON.parse(JSON.stringify(config));
                    snapshot.valor = v;
                    const painel = painelBuilder(snapshot, [], []);

                    try {
                        const msg = await interaction.channel.send({ embeds: painel.embeds, components: painel.components });
                        filas.setConfig(msg.id, snapshot);
                    } catch (err) {}
                    await new Promise(r => setTimeout(r, 800));
                }

                await interaction.editReply({ content: `✅ Pack completo enviado com sucesso!` });
                return;
            }
        }

    } catch (err) {
        console.error("Erro geral na interação:", err);
    }
};