const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");
const filas = require("../systems/filas.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para o chat.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 2;

        const painel = painelBuilder(config, [], []);
        const msg = await interaction.channel.send({
            embeds: painel.embeds,
            components: painel.components
        });

        filas.setConfig(msg.id, config);

        await interaction.editReply({ content: "✅ Painel enviado com sucesso!" });
    }
};