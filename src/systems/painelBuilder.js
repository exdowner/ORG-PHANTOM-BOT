const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config = {}, fila1 = [], fila2 = []) => {
    const qtd = config.quantidade || 2;
    const titulo = `${config.nomePainel || "PHANTOM"} | R$ ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    // Função para formatar os membros da fila na embed
    const formatarFila = (fila) => {
        if (!Array.isArray(fila) || fila.length === 0) return "`Vazio`";
        return fila.map(j => `<@${typeof j === 'object' ? j.id : j}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    const row = new ActionRowBuilder();

    // Prioriza os emojis salvos na config, depois os fixos por ID, e por fim um emoji nativo de segurança
    const emojiGel = config.emojiGelNormal || "<:gloowall:1532885980422475868>" || "🧊";
    const emojiEmulador = config.emojiEmul1 || "<:bluestacks:1532885656030806147>" || "💻";
    const emojiSair = config.emojiSair || "<:leave:1532886068767228136>" || "🚪";

    if (config.modoMisto === true) {
        embed.addFields(
            { name: `💻 1 Emulador (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: true },
            { name: `💻 2 Emuladores (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: true }
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
        embed.addFields(
            { name: `🧊 Gel Normal (${fila1.length}/${qtd})`, value: formatarFila(fila1), inline: true },
            { name: `♾️ Gel Infinito (${fila2.length}/${qtd})`, value: formatarFila(fila2), inline: true }
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
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji(emojiSair)
                .setStyle(ButtonStyle.Danger)
        );
    }

    return { embeds: [embed], components: [row] };
};