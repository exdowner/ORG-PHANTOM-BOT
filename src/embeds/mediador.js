const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

module.exports = (partida) => {
    const nick1 = partida.nick1 || "Jogador 1";
    const nick2 = partida.nick2 || "Jogador 2";

    const embed = new EmbedBuilder()
        .setTitle("🛠️ PAINEL DO MEDIADOR")
        .setColor("#2f3136")
        .setDescription(`
**Modo:** ${partida.modo || "X1"}
**Valor:** ${partida.valor || "N/A"}

**Jogadores:**
1️⃣ ${nick1}
2️⃣ ${nick2}
        `)
        .setFooter({ text: "ORG PHANTOM • Mediação" });

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mediador_definir_sala_${partida.id}`).setLabel("Enviar Código e Senha").setEmoji("🔑").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`mediador_cancelar_${partida.id}`).setLabel("Fechar Canal").setEmoji("❌").setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`selecionar_vencedor_${partida.id}`)
            .setPlaceholder("🏆 Declarar Vencedor")
            .addOptions(
                { label: nick1, description: `Vitória de ${nick1}`, value: String(partida.jogadores[0]), emoji: "1️⃣" },
                { label: nick2, description: `Vitória de ${nick2}`, value: String(partida.jogadores[1]), emoji: "2️⃣" }
            )
    );

    return { embeds: [embed], components: [row1, row2] };
};