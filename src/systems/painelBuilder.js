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

    // SE MISTO ESTIVER ATIVADO
    if (config.modoMisto === true) {
        embed.addFields(
            { name: `📱 1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `💻 2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_1emulador").setLabel("1 Emulador").setEmoji(config.emojiEmul1 || "📱").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("entrar_2emuladores").setLabel("2 Emuladores").setEmoji(config.emojiEmul2 || "💻").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("sair_fila").setLabel("Sair").setEmoji(config.emojiSair || "🚪").setStyle(ButtonStyle.Danger)
        );
    } else {
        // SE NÃO ESTIVER MISTO
        embed.addFields(
            { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );
        row.addComponents(
            new ButtonBuilder().setCustomId("entrar_gel_normal").setLabel("Gel Normal").setEmoji(config.emojiGelNormal || "🧊").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("entrar_gel_inf").setLabel("Gel Infinito").setEmoji(config.emojiGelInfinito || "♾️").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("sair_fila").setLabel("Sair").setEmoji(config.emojiSair || "🚪").setStyle(ButtonStyle.Danger)
        );
    }

    return { embeds: [embed], components: [row] };
};