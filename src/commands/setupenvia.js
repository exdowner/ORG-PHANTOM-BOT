const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");
const filas = require("../systems/filas.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de fila configurado no canal atual.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Pega as configurações salvas (modo, valor, emojis, etc.)
            const config = pegarConfig();

            if (!config) {
                return await interaction.reply({
                    content: "❌ Nenhuma configuração encontrada! Use `/setup` primeiro para configurar.",
                    flags: MessageFlags.Ephemeral
                });
            }

            // Clona a configuração para a mensagem atual
            const snapshot = JSON.parse(JSON.stringify(config));
            
            // Monta o painel usando o seu builder
            const painel = painelBuilder(snapshot, [], []);

            // Envia o painel diretamente no canal onde o comando foi usado
            const msg = await interaction.channel.send({
                embeds: painel.embeds,
                components: painel.components
            });

            // Registra a mensagem no sistema de filas
            filas.setConfig(msg.id, snapshot);

            // Confirmação efêmera para quem rodou o comando
            await interaction.reply({
                content: `✅ Painel enviado com sucesso neste canal! (**${snapshot.modo || "Mobile"}** - R$ ${snapshot.valor || "5,00"})`,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error("Erro ao executar /setupenvia:", error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Ocorreu um erro ao tentar enviar o painel.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};