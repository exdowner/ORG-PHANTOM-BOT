const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-rank")
        .setDescription("Envia o painel fixo do Ranking no canal")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embedPainel = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("🏆 ORG PHANTOM | Sistema de Ranking")
            .setDescription("Clique nos botões abaixo para ver o ranking ou o seu perfil!")
            .setFooter({ text: "ORG PHANTOM • Atualizado em tempo real" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("btn_meu_perfil")
                .setLabel("Meu perfil")
                .setEmoji("👤")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("btn_ver_ranking")
                .setLabel("Ranking")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Success)
        );

        // Envia a mensagem fixa no canal
        await interaction.channel.send({ embeds: [embedPainel], components: [row] });
        
        // Resposta privada de confirmação para o adm
        await interaction.reply({ 
            content: "✅ Painel do Ranking enviado com sucesso!", 
            flags: MessageFlags.Ephemeral 
        });
    }
};