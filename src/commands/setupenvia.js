const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para o chat.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // ⚠️ CORREÇÃO MILIONÁRIA: Deferir a resposta para ganhar tempo!
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 2;

        // Gera o painel com a configuração atual
        const painel = painelBuilder(config, [], []);

        // Envia o painel para o canal público
        await interaction.channel.send({
            embeds: painel.embeds,
            components: painel.components
        });

        // Finaliza a resposta ao admin usando editReply (já que deferimos antes)
        await interaction.editReply({ 
            content: "✅ Painel enviado com sucesso!" 
        });
    }
};