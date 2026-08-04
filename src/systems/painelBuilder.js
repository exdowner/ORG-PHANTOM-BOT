const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    // 🔥 AQUI ESTÁ A CORREÇÃO DAS VAGAS (Multiplicador * 2)
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

    // ==================== LÓGICA DE CORES CORRIGIDA ====================
    // Prioridade 1: Se Misto estiver ATIVADO (config.modoMisto), é VERDE.
    if (config.modoMisto === true) {
        embed.addFields(
            { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
            { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
        );

        const btn1 = new ButtonBuilder()
            .setCustomId("entrar_1emulador")
            .setLabel("1 Emulador")
            .setStyle(ButtonStyle.Success);
        if (config.emojiEmul1) btn1.setEmoji(config.emojiEmul1);

        const btn2 = new ButtonBuilder()
            .setCustomId("entrar_2emuladores")
            .setLabel("2 Emuladores")
            .setStyle(ButtonStyle.Success);
        if (config.emojiEmul2) btn2.setEmoji(config.emojiEmul2);

        const btnSair = new ButtonBuilder()
            .setCustomId("sair_fila")
            .setLabel("Sair")
            .setStyle(ButtonStyle.Danger);
        if (config.emojiSair) btnSair.setEmoji(config.emojiSair);

        row.addComponents(btn1, btn2, btnSair);
    }
    // Prioridade 2: Se Misto NÃO estiver ativado, tanto Emulador quanto Mobile são AZUIS.
    else {
        // Detecta se o modo textual é Emulador para definir os rótulos
        const isEmulador = config.modo && config.modo.toLowerCase() === "emulador";

        if (isEmulador) {
            embed.addFields(
                { name: `1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
                { name: `2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
            );
        } else {
            embed.addFields(
                { name: `Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: false },
                { name: `Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: false }
            );
        }

        // 🔥 Agora os botões são montados com Style.Primary (AZUL) para ambos os casos
        const btn1 = new ButtonBuilder()
            .setCustomId(isEmulador ? "entrar_1emulador" : "entrar_gel_normal")
            .setLabel(isEmulador ? "1 Emulador" : "Gel Normal")
            .setStyle(ButtonStyle.Primary); // 🔵 AZUL
        if (isEmulador ? config.emojiEmul1 : config.emojiGelNormal) {
            btn1.setEmoji(isEmulador ? config.emojiEmul1 : config.emojiGelNormal);
        }

        const btn2 = new ButtonBuilder()
            .setCustomId(isEmulador ? "entrar_2emuladores" : "entrar_gel_inf")
            .setLabel(isEmulador ? "2 Emuladores" : "Gel Infinito")
            .setStyle(ButtonStyle.Primary); // 🔵 AZUL
        if (isEmulador ? config.emojiEmul2 : config.emojiGelInfinito) {
            btn2.setEmoji(isEmulador ? config.emojiEmul2 : config.emojiGelInfinito);
        }

        const btnSair = new ButtonBuilder()
            .setCustomId("sair_fila")
            .setLabel("Sair")
            .setStyle(ButtonStyle.Danger);
        if (config.emojiSair) btnSair.setEmoji(config.emojiSair);

        row.addComponents(btn1, btn2, btnSair);
    }

    return { embeds: [embed], components: [row] };
};