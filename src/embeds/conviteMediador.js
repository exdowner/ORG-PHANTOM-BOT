const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (partida) => {
    const embed = new EmbedBuilder()
        .setTitle("⚔️ NOVO X1 AGUARDANDO MEDIADOR")
        .setColor("#ff9900")
        .setDescription(`
**Modo:** ${partida.modo}
**Valor:** ${partida.valor}

**Jogadores:**
1️⃣ <@${partida.jogadores[0]}>
2️⃣ <@${partida.jogadores[1]}>
        `)
        .setFooter({ text: "Clique abaixo para assumir a partida ou destravar seu perfil." });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`aceitar_mediador_${partida.id}`)
            .setLabel("Aceitar Partida")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("resetar_meu_status")
            .setLabel("🔓 Desbloquear Meu Status")
            .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
};