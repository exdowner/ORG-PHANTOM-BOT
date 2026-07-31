const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para o chat.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 2;

        // Gera o painel correto com a configuração atual do bot (Misto ou Gel)
        const painel = painelBuilder(config, [], []);

        // Envia para o chat
        await interaction.channel.send({
            embeds: painel.embeds,
            components: painel.components
        });

        await interaction.reply({ 
            content: "✅ Painel enviado!", 
            ephemeral: true 
        });
    }
};