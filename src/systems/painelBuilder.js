const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaNormal, filaInfinito, confirmados = []) => {
    const qtd = (config.quantidade || 1) * 2;
    const titulo = `${config.modo || "Mobile"} | ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatar = (f) => {
        if (!f || f.length === 0) return "Vazio";
        return f.map(j => `<@${j.id}>`).join("\n");
    };

    // Função para tratar emojis do servidor (<:nome:id>) vs Emojis nativos (🧊, 💻)
    const tratarEmoji = (emojiStr, emojiPadrao) => {
        if (!emojiStr || emojiStr === "Nenhum") return emojiPadrao;
        
        // Se for um emoji customizado do Discord (<:nome:id> ou <a:nome:id>)
        const match = emojiStr.match(/<a?:(\w+):(\d+)>/);
        if (match) {
            return { id: match[2], name: match[1] };
        }
        return emojiStr; // Retorna o emoji nativo
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const modoLower = (config.modo || "mobile").toLowerCase();
    const isMisto = modoLower === "misto";
    const isEmulador = modoLower === "emulador";

    let nomeFila1, nomeFila2, emoji1, emoji2;
    if (isMisto || isEmulador) {
        nomeFila1 = "1 Emulador";
        nomeFila2 = "2 Emuladores";
        emoji1 = tratarEmoji(config.emojiGel, "📱");
        emoji2 = tratarEmoji(config.emojiEmulador, "💻");
    } else {
        nomeFila1 = "Gel Normal";
        nomeFila2 = "Gel Infinito";
        emoji1 = tratarEmoji(config.emojiGel, "🧊");
        emoji2 = tratarEmoji(config.emojiEmulador, "♾️");
    }

    embed.addFields(
        { name: `${nomeFila1} (${filaNormal.length}/${qtd})`, value: formatar(filaNormal), inline: false },
        { name: `${nomeFila2} (${filaInfinito.length}/${qtd})`, value: formatar(filaInfinito), inline: false }
    );

    const btnFila1 = new ButtonBuilder()
        .setCustomId("entrar_fila1")
        .setLabel(nomeFila1)
        .setStyle(ButtonStyle.Secondary);

    if (emoji1) btnFila1.setEmoji(emoji1);

    const btnFila2 = new ButtonBuilder()
        .setCustomId("entrar_fila2")
        .setLabel(nomeFila2)
        .setStyle(ButtonStyle.Secondary);

    if (emoji2) btnFila2.setEmoji(emoji2);

    const btnSair = new ButtonBuilder()
        .setCustomId("sair_fila")
        .setLabel("Sair")
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(btnFila1, btnFila2, btnSair);

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
                .setDisabled(isComplete)
        );
    }

    return { embeds: [embed], components: [row] };
};