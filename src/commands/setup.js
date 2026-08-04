const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Abre o editor de painéis em tempo real.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = pegarConfig();

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("ORG PHANTOM | Editor (Preview ao Vivo)")
            .setDescription(
                `**Modo:** ${config.modo || "mobile"}\n` +
                `**Valor:** ${config.valor || "20,00"}\n` +
                `**Quantidade:** ${(config.quantidade || 1) * 2} jogadores\n` +
                `**Misto:** ${config.misto ? "✅ ATIVADO" : "❌ DESATIVADO"}\n\n` +
                `${config.emojiGelNormal || "🧊"} **Gel Normal**\n` +
                `${config.emojiGelInfinito || "♾️"} **Gel Infinito**\n` +
                `${config.emojiEmu1 || "📱"} **1 Emulador**\n` +
                `${config.emojiEmu2 || "💻"} **2 Emuladores**\n` +
                `${config.emojiSair || "🚪"} **Sair**\n\n` +
                `*As mudanças aparecem aqui em tempo real*`
            );

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_setup_valor").setLabel("Valor").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("btn_setup_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("btn_setup_quantidade").setLabel("Quantidade").setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_setup_emojis").setLabel("Emojis").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("btn_setup_misto").setLabel(config.misto ? "Desativar Misto" : "🔀 Ativar Misto").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("btn_setup_salvar").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2],
            flags: MessageFlags.Ephemeral
        });
    }
};