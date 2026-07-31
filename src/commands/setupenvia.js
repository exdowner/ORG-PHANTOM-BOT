const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas para todos no canal.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // NÃO USE deferReply EPHEMERAL AQUI! 
        // Ele precisa ser público, afinal é o painel que todos vão ver.
        // Apenas respondemos que deu certo depois.
        
        const config = pegarConfig();
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        // Gera o painel com as filas vazias
        const painel = painelBuilder(config, [], []);

        // Envia o painel para o chat público (não é ephemeral)
        await interaction.channel.send({
            embeds: painel.embeds,
            components: painel.components
        });

        // Agora sim, mandamos uma confirmação APENAS para o administrador (Ephemeral)
        return await interaction.reply({ 
            content: "✅ Painel de filas enviado com sucesso para o chat!", 
            ephemeral: true 
        });
    }
};