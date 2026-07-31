const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { pegarConfig } = require("../systems/config");

async function enviarPreview(interaction, config) {
    const isMisto = config.modoMisto === true || config.modoMisto === "true";

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("ORG PHANTOM | Editor (Preview)")
        .setDescription(`
**Modo:** ${config.modo || "X1"}
**Valor:** ${config.valor || "R$ 10,00"}
**Quantidade:** ${config.quantidade || 2} jogadores
**Misto:** ${isMisto ? "✅ ATIVADO" : "❌ DESATIVADO"}

${isMisto ? `
${config.emojiEmulador || "🟢"} **1 Emulador**
${config.emojiEmulador || "🟢"} **2 Emuladores**
${config.emojiSair || "🚪"} **Sair**
` : `
${config.emojiGelNormal || "🧊"} **Gel Normal**
${config.emojiGelInfinito || "♾️"} **Gel Infinito**
${config.emojiSair || "🚪"} **Sair**
`}
        `)
        .setFooter({ text: "Preview ao vivo" });

    const linha1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("editar_valor").setLabel("Valor").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("editar_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("editar_quantidade").setLabel("Quantidade").setEmoji("👥").setStyle(ButtonStyle.Secondary)
    );

    const linha2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("editar_emojis").setLabel("Emojis").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("ativar_misto")
            .setLabel(isMisto ? "Desativar Misto" : "Ativar Misto")
            .setEmoji("🔀")
            .setStyle(isMisto ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
    );

    const payload = { embeds: [embed], components: [linha1, linha2], flags: 64 };

    if (interaction.deferred || interaction.replied) {
        return interaction.editReply(payload).catch(() => {});
    }
    return interaction.reply(payload).catch(() => {});
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Abrir editor da ORG PHANTOM"),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const config = pegarConfig();
        await enviarPreview(interaction, config);
    }
};

module.exports.enviarPreview = enviarPreview;