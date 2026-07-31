const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = function (config, lista1 = [], lista2 = []) {
    const qtdMax = config.quantidade || 2;

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`${config.modo || "Mobile"} | ${config.valor || "R$ 5,00"}`)
        .setDescription("Selecione uma das opções abaixo para entrar na fila:")
        .addFields(
            { 
                name: config.modoMisto ? `📱 1 Emulador (${lista1.length}/${qtdMax})` : `🧊 Gel Normal (${lista1.length}/${qtdMax})`, 
                value: lista1.length > 0 ? lista1.map(j => `<@${j.id}>`).join("\n") : "Vazio", 
                inline: false 
            },
            { 
                name: config.modoMisto ? `💻 2 Emuladores (${lista2.length}/${qtdMax})` : `♾️ Gel Infinito (${lista2.length}/${qtdMax})`, 
                value: lista2.length > 0 ? lista2.map(j => `<@${j.id}>`).join("\n") : "Vazio", 
                inline: false 
            }
        )
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const row = new ActionRowBuilder();

    if (config.modoMisto) {
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_1emulador").setLabel("1 Emulador").setEmoji(config.emojiEmul1 || "📱").setStyle(ButtonStyle.Primary),
            newButtonBuilder().setCustomId("entrar_2emuladores").setLabel("2 Emuladores").setEmoji(config.emojiEmul2 || "💻").setStyle(ButtonStyle.Primary)
        );
    } else {
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_gel_normal").setLabel("Gel Normal").setEmoji(config.emojiGelNormal || "🧊").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("entrar_gel_inf").setLabel("Gel Infinito").setEmoji(config.emojiGelInfinito || "♾️").setStyle(ButtonStyle.Primary)
        );
    }

    row.addComponents(
        new ButtonBuilder().setCustomId("sair_fila").setLabel("Sair").setEmoji(config.emojiSair || "🚪").setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row] };
};