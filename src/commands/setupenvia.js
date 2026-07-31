const { SlashCommandBuilder } = require("discord.js");
const { pegarConfig } = require("../systems/config");
const criarPainel = require("../embeds/painel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de partidas no canal atual"),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const config = pegarConfig();
        console.log("modoMisto:", config.modoMisto);

        const painel = criarPainel(config, [], []);
        await interaction.channel.send(painel);

        return interaction.editReply({
            content: `✅ Painel enviado!\nModo Misto: **${config.modoMisto ? "ATIVADO" : "DESATIVADO"}**`
        }).catch(() => {});
    }
};