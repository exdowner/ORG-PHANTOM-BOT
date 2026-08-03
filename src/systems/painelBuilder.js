const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    const qtd = config.quantidade || 2;
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

    // ================================
    // MODO MISTO (EMULADOR) -> 🟢 VERDE
    // ================================
    if (config.modoMisto === true) {
        embed.addFields(
            { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );

        const btn1 = new ButtonBuilder()
            .setCustomId("entrar_1emulador")
            .setLabel("1 Emulador")
            .setStyle(ButtonStyle.Success); // 🟢 VERDE (CORRIGIDO!)
        if (config.emojiEmul1) btn1.setEmoji(config.emojiEmul1);

        const btn2 = new ButtonBuilder()
            .setCustomId("entrar_2emuladores")
            .setLabel("2 Emuladores")
            .setStyle(ButtonStyle.Success); // 🟢 VERDE (CORRIGIDO!)
        if (config.emojiEmul2) btn2.setEmoji(config.emojiEmul2);

        const btnSair = new ButtonBuilder()
            .setCustomId("sair_fila")
            .setLabel("Sair")
            .setStyle(ButtonStyle.Danger);
        if (config.emojiSair) btnSair.setEmoji(config.emojiSair);

        row.addComponents(btn1, btn2, btnSair);

    } else {
        // ================================
        // MODO GEL (MOBILE) -> 🔵 AZUL
        // ================================
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );

        const btnGelNormal = new ButtonBuilder()
            .setCustomId("entrar_gel_normal")
            .setLabel("Gel Normal")
            .setStyle(ButtonStyle.Primary); // 🔵 AZUL
        if (config.emojiGelNormal) btnGelNormal.setEmoji(config.emojiGelNormal);

        const btnGelInf = new ButtonBuilder()
            .setCustomId("entrar_gel_inf")
            .setLabel("Gel Infinito")
            .setStyle(ButtonStyle.Primary); // 🔵 AZUL
        if (config.emojiGelInfinito) btnGelInf.setEmoji(config.emojiGelInfinito);
        
        const btnSair = new ButtonBuilder()
            .setCustomId("sair_fila")
            .setLabel("Sair")
            .setStyle(ButtonStyle.Danger);
        if (config.emojiSair) btnSair.setEmoji(config.emojiSair);

        row.addComponents(btnGelNormal, btnGelInf, btnSair);
    }

    return { embeds: [embed], components: [row] };
};