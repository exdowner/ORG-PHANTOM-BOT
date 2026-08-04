const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");
const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

// Função auxiliar para atualizar a embed do setup em tempo real
function gerarEmbedEditor(config) {
    return new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("ORG PHANTOM | Editor (Preview ao Vivo)")
        .setDescription(
            `**Modo:** ${config.modo || "mobile"}\n` +
            `**Valor:** ${config.valor || "20,00"}\n` +
            `**Quantidade:** ${(config.quantidade || 1) * 2} jogadores\n` +
            `**Misto:** ${config.misto ? "✅ ATIVADO" : "❌ DESATIVADO"}\n\n` +
            `${config.emojiGelNormal || "🧊"} **Gel Normal**\n` +
            `${config.emojiGelInfinito || "♾️"} **Gel Infinito**\n` +
            `🚪 **Sair**\n\n` +
            `*As mudanças aparecem aqui em tempo real*`
        );
}

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

        // --- BOTÕES DO SETUP (LAYOUT DA IMAGEM) ---
        if (interaction.isButton()) {
            const { customId, message } = interaction;

            // 1. ALTERAR MISTO
            if (customId === "btn_setup_misto") {
                config.misto = !config.misto;
                salvarConfig(config);

                const row1 = message.components[0];
                const row2 = ActionRowBuilder.from(message.components[1]);
                row2.components[1].setLabel(config.misto ? " Desativar Misto" : "🔀 Ativar Misto");

                await interaction.update({
                    embeds: [gerarEmbedEditor(config)],
                    components: [row1, row2]
                });
                return;
            }

            // 2. MODAL DE VALOR
            if (customId === "btn_setup_valor") {
                const modal = new ModalBuilder().setCustomId("modal_editor_valor").setTitle("Definir Valor");
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("input_valor").setLabel("Exemplo: 20,00 ou 5,00").setStyle(TextInputStyle.Short).setValue(config.valor || "20,00").setRequired(true)
                ));
                await interaction.showModal(modal);
                return;
            }

            // 3. MODAL DE MODO
            if (customId === "btn_setup_modo") {
                const modal = new ModalBuilder().setCustomId("modal_editor_modo").setTitle("Definir Modo");
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("input_modo").setLabel("Exemplo: mobile, emulador, misto").setStyle(TextInputStyle.Short).setValue(config.modo || "mobile").setRequired(true)
                ));
                await interaction.showModal(modal);
                return;
            }

            // 4. MODAL DE QUANTIDADE
            if (customId === "btn_setup_quantidade") {
                const modal = new ModalBuilder().setCustomId("modal_editor_qtd").setTitle("Jogadores por Fila");
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("input_qtd").setLabel("Digite a qtd por time (Ex: 1 para 1x1)").setStyle(TextInputStyle.Short).setValue(String(config.quantidade || 1)).setRequired(true)
                ));
                await interaction.showModal(modal);
                return;
            }

            // 5. MODAL DE EMOJIS (AQUI VOCÊ PODE REPETIR O MESMO EMOJI!)
            if (customId === "btn_setup_emojis") {
                const modal = new ModalBuilder().setCustomId("modal_editor_emojis").setTitle("Configurar Emojis");
                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("input_gel_normal").setLabel("Emoji Gel Normal").setStyle(TextInputStyle.Short).setValue(config.emojiGelNormal || "🧊").setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId("input_gel_infinito").setLabel("Emoji Gel Infinito").setStyle(TextInputStyle.Short).setValue(config.emojiGelInfinito || "♾️").setRequired(true)
                    )
                );
                await interaction.showModal(modal);
                return;
            }

            // 6. SALVAR E ENVIAR PAINEL DEFINITIVO
            if (customId === "btn_setup_salvar") {
                salvarConfig(config);
                const painel = painelBuilder(config, [], []);

                try {
                    const msg = await interaction.channel.send({ embeds: painel.embeds, components: painel.components });
                    filas.setConfig(msg.id, config);
                    await interaction.reply({ content: "✅ Painel publicado com sucesso no canal!", flags: MessageFlags.Ephemeral });
                } catch (err) {
                    console.error("Erro ao publicar painel:", err);
                    await interaction.reply({ content: "❌ Erro ao postar o painel no canal.", flags: MessageFlags.Ephemeral });
                }
                return;
            }
        }

        // --- PROCESSAMENTO DOS MODAIS (ATUALIZAÇÃO EM TEMPO REAL) ---
        if (interaction.isModalSubmit()) {
            const { customId, fields } = interaction;

            if (customId === "modal_editor_valor") {
                config.valor = fields.getTextInputValue("input_valor");
            } else if (customId === "modal_editor_modo") {
                config.modo = fields.getTextInputValue("input_modo");
            } else if (customId === "modal_editor_qtd") {
                const parsed = parseInt(fields.getTextInputValue("input_qtd"));
                config.quantidade = isNaN(parsed) ? 1 : parsed;
            } else if (customId === "modal_editor_emojis") {
                // Aqui você pode colá o MESMO emoji nos dois campos se quiser!
                config.emojiGelNormal = fields.getTextInputValue("input_gel_normal");
                config.emojiGelInfinito = fields.getTextInputValue("input_gel_infinito");
            }

            salvarConfig(config);

            await interaction.update({
                embeds: [gerarEmbedEditor(config)]
            });
            return;
        }

    } catch (err) {
        console.error("Erro na interação:", err);
    }
};