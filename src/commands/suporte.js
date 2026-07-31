const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suporte")
        .setDescription("Envia o painel de atendimento de suporte.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const ID_FAQ = "1531931964217495702";

        const embedSuporte = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("︱Atendimento Phantom")
            .setDescription(
                `Algumas dúvidas já estão respondidas no nosso <#${ID_FAQ}>.\n` +
                `Antes de abrir um ticket, dê uma olhada por lá — isso agiliza bastante o atendimento.`
            )
            .setFooter({ text: "ORG PHANTOM • Suporte" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abrir_ticket")
                .setLabel("Abrir Ticket")
                .setEmoji("📩")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embedSuporte], components: [row] });
        return interaction.reply({ content: "✅ Painel de suporte enviado com sucesso!", flags: 64 });
    }
};