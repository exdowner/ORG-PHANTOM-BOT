const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaTimeA, filaTimeB, confirmados = []) => {
    const qtd = (config.quantidade || 1) * 2;
    const modoLower = (config.modo || "mobile").toLowerCase();
    const isMisto = modoLower === "misto";

    const titulo = `${config.modo || "Mobile"} | R$ ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatar = (f) => {
        if (!f || f.length === 0) return "Vazio";
        return f.map(j => `<@${j.id}>`).join("\n");
    };

    const tratarEmoji = (emojiStr, emojiPadrao) => {
        if (!emojiStr || emojiStr === "Nenhum" || emojiStr === "none") return emojiPadrao;
        const match = emojiStr.match(/<a?:(\w+):(\d+)>/);
        if (match) {
            return { id: match[2], name: match[1] };
        }
        return emojiStr;
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    let nomeFila1, nomeFila2, emoji1, emoji2;

    if (isMisto) {
        // Se a regra configurada for 1 Emulador por time
        if (config.tipoMisto === "2emu") {
            nomeFila1 = "Time A (2 Emus)";
            nomeFila2 = "Time B (2 Emus)";
            emoji1 = tratarEmoji(config.emojiEmu2, "💻");
            emoji2 = tratarEmoji(config.emojiEmu2, "💻");
        } else {
            // Padrão: 1 Emulador por time
            nomeFila1 = "Time A (1 Emu)";
            nomeFila2 = "Time B (1 Emu)";
            emoji1 = tratarEmoji(config.emojiEmu1, "📱");
            emoji2 = tratarEmoji(config.emojiEmu1, "📱");
        }
    } else {
        // Modo Mobile ou Normal (Gel Normal vs Gel Infinito)
        nomeFila1 = "Gel Normal";
        nomeFila2 = "Gel Infinito";
        emoji1 = tratarEmoji(config.emojiGelNormal, "🧊");
        emoji2 = tratarEmoji(config.emojiGelInfinito, "♾️");
    }

    embed.addFields(
        { name: `${nomeFila1} (${filaTimeA.length}/${qtd / 2})`, value: formatar(filaTimeA), inline: true },
        { name: `${nomeFila2} (${filaTimeB.length}/${qtd / 2})`, value: formatar(filaTimeB), inline: true }
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

    const totalJogadores = filaTimeA.length + filaTimeB.length;
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