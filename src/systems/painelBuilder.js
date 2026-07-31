const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    const qtd = config.quantidade || 2;
    const titulo = `${config.modo || "Mobile"} | ${config.valor || "2,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatarFila = (fila) => {
        if (!fila || fila.length === 0) return "Vazio";
        return fila.map(j => `<@${j.id}>`).join("\n");
    };

    // --- CONSTRUÇÃO DO EMBED (SEM EMOJIS NOS NOMES DA LISTA) ---
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

    // --- CONSTRUÇÃO DOS BOTÕES ---
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_gel_normal")
                .setLabel("Gel Normal")
                .setEmoji(config.emojiGelNormal || "🧊") // Pega o emoji salvo
                .setStyle(ButtonStyle.Primary), // AZUL

            new ButtonBuilder()
                .setCustomId("entrar_gel_inf")
                .setLabel("Gel Infinito")
                .setEmoji(config.emojiGelNormal || "🧊") // USA O MESMO EMOJI DO GEL NORMAL
                .setStyle(ButtonStyle.Primary), // TAMBÉM AZUL

            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair") // TEXTO CORRIGIDO
                .setEmoji(config.emojiSair || "🚪") // Pega o emoji salvo
                .setStyle(ButtonStyle.Danger) // VERMELHO
        );

    return { embeds: [embed], components: [row] };
};