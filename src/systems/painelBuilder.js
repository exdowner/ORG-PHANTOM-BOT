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

    if (config.modoMisto === true) {
        embed.addFields(
            { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_1emulador").setLabel("1 Emulador").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("entrar_2emuladores").setLabel("2 Emuladores").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("sair_fila").setLabel("Sair").setStyle(ButtonStyle.Danger)
        );
    } else {
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_gel_normal").setLabel("Gel Normal").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("entrar_gel_inf").setLabel("Gel Infinito").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("sair_fila").setLabel("Sair").setStyle(ButtonStyle.Danger)
        );
    }

    // Adiciona os emojis se existirem (opcional, mas seguro)
    const botoes = row.components;
    if (botoes && botoes.length > 0) {
        if (config.modoMisto) {
            if (config.emojiEmul1 && botoes[0]) botoes[0].setEmoji(config.emojiEmul1);
            if (config.emojiEmul2 && botoes[1]) botoes[1].setEmoji(config.emojiEmul2);
        } else {
            if (config.emojiGelNormal && botoes[0]) botoes[0].setEmoji(config.emojiGelNormal);
            if (config.emojiGelInfinito && botoes[1]) botoes[1].setEmoji(config.emojiGelInfinito);
        }
        if (config.emojiSair && botoes[2]) botoes[2].setEmoji(config.emojiSair);
    }

    return { embeds: [embed], components: [row] };
};