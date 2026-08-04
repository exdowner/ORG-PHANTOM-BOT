const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (config, filaNormal = [], filaInfinito = []) => {
    const multiplicador = config.quantidade || 1;
    const qtd = multiplicador * 2;

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

    // Sempre mostra as duas filas (Gel Normal e Gel Infinito)
    embed.addFields(
        { name: `🧊 Gel Normal (${filaNormal.length}/${qtd})`, value: formatarFila(filaNormal), inline: false },
        { name: `♾️ Gel Infinito (${filaInfinito.length}/${qtd})`, value: formatarFila(filaInfinito), inline: false }
    );

    const row = new ActionRowBuilder();

    // Botão Entrar (sempre visível)
    const btnEntrar = new ButtonBuilder()
        .setCustomId("entrar_gel_normal")
        .setLabel("Entrar")
        .setStyle(ButtonStyle.Success);

    // Botão Sair (sempre visível)
    const btnSair = new ButtonBuilder()
        .setCustomId("sair_fila")
        .setLabel("Sair")
        .setStyle(ButtonStyle.Danger);

    row.addComponents(btnEntrar, btnSair);

    // Botão Confirmar (aparece apenas quando a fila Normal está cheia)
    if (filaNormal.length >= qtd) {
        const btnConfirmar = new ButtonBuilder()
            .setCustomId("confirmar_partida")
            .setLabel("✅ Confirmar Partida")
            .setStyle(ButtonStyle.Primary);
        row.addComponents(btnConfirmar);
    }

    return { embeds: [embed], components: [row] };
};