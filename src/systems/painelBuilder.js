
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaNormal, filaInfinito, confirmados = []) => {
    const qtd = (config.quantidade || 1) * 2;
    const titulo = `Mobile | ${config.valor || "5,00"}`;
    const urlImagem = "https://media.discordapp.net/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png";

    const formatar = (f) => {
        if (!f || f.length === 0) return "Vazio";
        return f.map(j => `<@${j.id}>`).join("\n");
    };

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(titulo)
        .setThumbnail(urlImagem)
        .setFooter({ text: "ORG PHANTOM | Sistema de Partidas" })
        .addFields(
            { name: `🧊 Gel Normal (${filaNormal.length}/${qtd})`, value: formatar(filaNormal), inline: false },
            { name: `♾️ Gel Infinito (${filaInfinito.length}/${qtd})`, value: formatar(filaInfinito), inline: false }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("entrar_fila1")
                .setLabel("Entrar")
                .setEmoji("🧊")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("sair_fila")
                .setLabel("Sair")
                .setEmoji("🚪")
                .setStyle(ButtonStyle.Danger)
        );

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