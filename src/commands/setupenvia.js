const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para o canal.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
        
        const config = pegarConfig();

        // CORREÇÃO DE SEGURANÇA: Se quantidade vier vazia, define como 2
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        // Gera o painel com as filas vazias usando o builder
        const painel = painelBuilder(config, [], []);

        // Envia o painel para o chat
        return await interaction.editReply({
            embeds: painel.embeds,
            components: painel.components
        });
    }
};