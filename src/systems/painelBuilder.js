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

    // =======================================================================
    // 🔥 EMOJIS FIXOS (OS SEUS)
    // =======================================================================
    const emojiGel = "<:gloowall:1532885980422475868>"; 
    const emojiEmulador = "<:bluestacks:1532885656030806147>"; 
    const emojiSair = "<:leave:1532886068767228136>"; 
    // =======================================================================

    // MODO MISTO (EMULADOR)
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
                .setStyle(ButtonStyle.Success), // 🟢 VERDE
            new ButtonBuilder()
                .setCustomId("entrar_2emuladores")
                .setLabel("2 Emuladores")
                .setEmoji(emojiEmulador)
                .setStyle(ButtonStyle.Success), // 🟢 VERDE
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(emojiSair)
                .setStyle(ButtonStyle.Danger) // 🔴 VERMELHO
        );
    } else {
        // MODO GEL (MOBILE)
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setEmoji(emojiGel) 
                .setStyle(ButtonStyle.Primary), // 🔵 AZUL
            new ButtonBuilder()
                .setCustomId("entrar_gel_inf")
                .setLabel("Gel Infinito")
                .setEmoji(emojiGel)
                .setStyle(ButtonStyle.Primary), // 🔵 AZUL (CORRIGIDO AQUI!)
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(emojiSair)
                .setStyle(ButtonStyle.Danger) // 🔴 VERMELHO
        );
    }

    return { embeds: [embed], components: [row] };
};