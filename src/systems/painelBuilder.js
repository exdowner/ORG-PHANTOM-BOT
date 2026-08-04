const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, fila = []) => {
    const qtd = (config.quantidade || 1) * 2; // 1x1 = 2 vagas, 2x2 = 4 vagas
    const titulo = `${config.nomePainel || "PHANTOM"} | ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatarFila = (f) => {
        if (!f || f.length === 0) return "Vazio";
        return f.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" })
        .addFields(
            { name: `Jogadores (${fila.length}/${qtd})`, value: formatarFila(fila), inline: false }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_fila")
                .setLabel("Entrar")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setStyle(ButtonStyle.Danger)
        );

    return { embeds: [embed], components: [row] };
};