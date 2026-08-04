const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    const multiplicador = config.quantidade || 1; 
    const qtd = multiplicador * 2; // 1x1 = 2, 2x2 = 4, etc.

    const titulo = `${config.nomePainel || "PHANTOM"} | ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatarFila = (fila) => {
        if (!fila || fila.length === 0) return "Vazio";
        return fila.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const row = new ActionRowBuilder();

    // 🔥 CORREÇÃO: Nomes das filas dependem APENAS do Misto
    if (config.modoMisto === true) {
        // MISTO ATIVADO → Emuladores (VERDE)
        embed.addFields(
            { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_1emulador")
                .setLabel("1 Emulador")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.emojiEmul1 || "📱"),
            new ButtonBuilder()
                .setCustomId("entrar_2emuladores")
                .setLabel("2 Emuladores")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.emojiEmul2 || "💻"),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(config.emojiSair || "🚪")
        );
    } else {
        // MISTO DESATIVADO → Sempre GEL (AZUL)
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(config.emojiGelNormal || "🧊"),
            new ButtonBuilder()
                .setCustomId("entrar_gel_inf")
                .setLabel("Gel Infinito")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(config.emojiGelInfinito || "♾️"),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(config.emojiSair || "🚪")
        );
    }

    return { embeds: [embed], components: [row] };
};