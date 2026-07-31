const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para todos verem e entrarem.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 2;

        // CRIA O PAINEL
        const painel = painelBuilder(config, [], []);

        // ENVIA PARA O CHAT (PÚBLICO - TODOS VEEM)
        await interaction.channel.send({
            embeds: painel.embeds,
            components: painel.components
        });

        // AVISA O ADMIN (EPHEMERAL - SÓ O ADMIN VÊ)
        await interaction.reply({ 
            content: "✅ Painel de filas enviado para o canal! Agora outros jogadores podem entrar.",
            ephemeral: true 
        });
    }
};