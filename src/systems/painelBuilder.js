const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila1 = [], fila2 = []) => {
    // Garantir que a quantidade nunca seja undefined
    const qtd = config.quantidade || 2;

    // Configuração do título: Sempre "Modo | Valor" sem o "Qtd:" no topo
    const titulo = `${config.modo || "Mobile"} | ${config.valor || "R$ 0,00"}`;
    
    // Link da imagem do fantasma (O seu logo)
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png"; 

    const formatarFila = (fila) => {
        if (!fila || fila.length === 0) return "Vazio";
        return fila.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem) // Coloca o fantasma na direita, igual Imagem 2
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" });

    // Define os textos das filas com a quantidade (0/2) e o nome
    embed.addFields(
        {
            name: `🧊 Gel Normal (${fila1.length}/${qtd})`,
            value: formatarFila(fila1),
            inline: false
        },
        {
            name: `♾️ Gel Infinito (${fila2.length}/${qtd})`,
            value: formatarFila(fila2),
            inline: false
        }
    );

    // Botões
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
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair da Fila")
                .setEmoji(config.emojiSair || "🚪")
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [row] };
};