const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    const qtd = config.quantidade || 2;

    const modoTexto = (config.modo || "").toLowerCase();
    const tipoTexto = (config.tipo || "").toLowerCase();

    const isMisto = 
        tipoTexto === "misto" ||
        (config.modoMisto === true && tipoTexto !== "mobile" && !modoTexto.includes("mobile")) ||
        (modoTexto.includes("misto") && !modoTexto.includes("mobile"));

    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png?ex=6a6d239a&is=6a6bd21a&hm=0c53d558813d0ffb4a976680dea0d5cc61fa2d46c6f64709d464c85e35c6bdf4&=&format=webp&quality=lossless&width=214&height=214";

    const formatarFila = (fila) => {
        if (!fila || fila.length === 0) return "\n> *Vazio*\n";
        return "\n" + fila.map(j => `> <@${j.id}>`).join("\n") + "\n";
    };

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setThumbnail(config.urlThumbnail || urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const row = new ActionRowBuilder();

    if (isMisto) {
        embed
            .setTitle(`${config.modo || "Misto"} | ${config.valor}`)
            .setDescription(
                `**1 Emulador (${fila1.length}/${qtd})**` +
                formatarFila(fila1) +
                `\n**2 Emuladores (${fila2.length}/${qtd})**` +
                formatarFila(fila2)
            );

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_1emulador")
                .setLabel("1 Emulador")
                .setEmoji(config.emojiEmulador || "🟢")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("entrar_2emuladores")
                .setLabel("2 Emuladores")
                .setEmoji(config.emojiEmulador || "🟢")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(config.emojiSair || "🚪")
                .setStyle(ButtonStyle.Danger)
        );
    } else {
        embed
            .setTitle(`${config.modo || "Mobile"} | ${config.valor}`)
            .setDescription(
                `**Gel Normal (${fila1.length}/${qtd})**` +
                formatarFila(fila1) +
                `\n**Gel Infinito (${fila2.length}/${qtd})**` +
                formatarFila(fila2)
            );

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setEmoji(config.emojiGelNormal || "🧊")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("entrar_gel_inf")
                .setLabel("Gel Infinito")
                .setEmoji(config.emojiGelInfinito || "♾️")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(config.emojiSair || "🚪")
                .setStyle(ButtonStyle.Danger)
        );
    }

    return { embeds: [embed], components: [row] };
};