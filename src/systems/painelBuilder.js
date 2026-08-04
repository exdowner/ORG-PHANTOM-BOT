const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaNormal, filaInfinito) => {
    const qtd = (config.quantidade || 1) * 2;
    const titulo = `${config.nomePainel || "PHANTOM"} | ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatar = (f) => {
        if (!f || f.length === 0) return "Vazio";
        return f.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const row = new ActionRowBuilder();

    // 🔥 MODO MISTO (Emuladores) ou Normal (Gel)
    if (config.modoMisto === true) {
        embed.addFields(
            { name: `1 Emulador (${filaNormal.length}/${qtd})`, value: formatar(filaNormal), inline: false },
            { name: `2 Emuladores (${filaInfinito.length}/${qtd})`, value: formatar(filaInfinito), inline: false }
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_1emulador")
                .setLabel("1 Emulador")
                .setEmoji(config.emojiEmulador || "📱")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("entrar_2emuladores")
                .setLabel("2 Emuladores")
                .setEmoji(config.emojiEmulador || "💻")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setStyle(ButtonStyle.Danger)
        );
    } else {
        embed.addFields(
            { name: `Gel Normal (${filaNormal.length}/${qtd})`, value: formatar(filaNormal), inline: false },
            { name: `Gel Infinito (${filaInfinito.length}/${qtd})`, value: formatar(filaInfinito), inline: false }
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setEmoji(config.emojiGel || "🧊")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("entrar_gel_infinito")
                .setLabel("Gel Infinito")
                .setEmoji(config.emojiGel || "♾️")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setStyle(ButtonStyle.Danger)
        );
    }

    // 🔥 Botão Confirmar aparece quando a fila Normal (ou Emulador 1) estiver cheia
    if (filaNormal.length >= qtd) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("confirmar_partida")
                .setLabel("Confirmar")
                .setStyle(ButtonStyle.Success)
        );
    }

    return { embeds: [embed], components: [row] };
};