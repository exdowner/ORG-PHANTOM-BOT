const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaNormal, filaInfinito, confirmados = []) => {
    const qtd = (config.quantidade || 1) * 2;
    const titulo = `${config.modo || "Mobile"} | ${config.valor || "5,00"}`;
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

    // Determina se é misto, emulador ou mobile
    const modoLower = (config.modo || "mobile").toLowerCase();
    const isMisto = modoLower === "misto";
    const isEmulador = modoLower === "emulador";

    // Nomes e emojis
    let nomeFila1, nomeFila2, emoji1, emoji2;
    if (isMisto || isEmulador) {
        nomeFila1 = "1 Emulador";
        nomeFila2 = "2 Emuladores";
        emoji1 = config.emojiEmulador || "📱";
        emoji2 = config.emojiEmulador || "💻";
    } else {
        // Mobile
        nomeFila1 = "Gel Normal";
        nomeFila2 = "Gel Infinito";
        emoji1 = config.emojiGel || "🧊";
        emoji2 = config.emojiGel || "♾️";
    }

    embed.addFields(
        { name: `${nomeFila1} (${filaNormal.length}/${qtd})`, value: formatar(filaNormal), inline: false },
        { name: `${nomeFila2} (${filaInfinito.length}/${qtd})`, value: formatar(filaInfinito), inline: false }
    );

    // Botões
    row.addComponents(
        new ButtonBuilder()
            .setCustomId("entrar_fila1")
            .setLabel(nomeFila1)
            .setEmoji(emoji1)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("entrar_fila2")
            .setLabel(nomeFila2)
            .setEmoji(emoji2)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("sair_fila")
            .setLabel("Sair")
            .setStyle(ButtonStyle.Danger)
    );

    // Botão Confirmar - mostra progresso
    const totalJogadores = filaNormal.length + filaInfinito.length;
    const confirmadosCount = confirmados.length;
    if (totalJogadores >= qtd) {
        const label = `Confirmar (${confirmadosCount}/${qtd})`;
        const isComplete = confirmadosCount >= qtd;
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("confirmar_partida")
                .setLabel(label)
                .setStyle(isComplete ? ButtonStyle.Success : ButtonStyle.Primary)
                .setDisabled(isComplete) // desabilita quando já confirmaram todos
        );
    }

    return { embeds: [embed], components: [row] };
};