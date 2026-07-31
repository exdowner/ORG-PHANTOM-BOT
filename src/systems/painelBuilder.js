const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    const qtd = config.quantidade || 2;
    const titulo = `${config.modo || "Mobile"} | ${config.valor || "2,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatarFila = (fila) => {
        if (!fila || fila.length === 0) return "Vazio";
        return fila.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" })
        .addFields(
            {
                name: `Gel Normal (${fila1.length}/${qtd})`,
                value: formatarFila(fila1),
                inline: false
            },
            {
                name: `Gel Infinito (${fila2.length}/${qtd})`,
                value: formatarFila(fila2),
                inline: false
            }
        );

    const row = new ActionRowBuilder()
        .addComponents(
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

    return { embeds: [embed], components: [row] };
};