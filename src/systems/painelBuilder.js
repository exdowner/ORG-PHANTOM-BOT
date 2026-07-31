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

    // ==========================================
    // ✅ EMOJIS CORRETOS COM OS IDs QUE VOCÊ PASSOU
    const emojiEmulador = "<:bluestacks:1532885656030806147>";
    const emojiGel = "<:gloowall:1532885980422475868>";
    const emojiSair = "<:leave:1532886068767228136>";
    // ==========================================

    // MODO MISTO
    if (config.modoMisto === true) {
        embed.addFields(
            { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_1emulador")
                .setLabel("1 Emulador")
                .setEmoji(emojiEmulador)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("entrar_2emuladores")
                .setLabel("2 Emuladores")
                .setEmoji(emojiEmulador)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(emojiSair)
                .setStyle(ButtonStyle.Danger)
        );
    } else {
        // MODO GEL
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setEmoji(emojiGel)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("entrar_gel_inf")
                .setLabel("Gel Infinito")
                .setEmoji(emojiGel)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(emojiSair)
                .setStyle(ButtonStyle.Danger)
        );
    }

    return { embeds: [embed], components: [row] };
};