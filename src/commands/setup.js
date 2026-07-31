
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionFlagsBits
} = require("discord.js");

const { pegarConfig } = require("../systems/config.js");
const painelBuilder = require("../systems/painelBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Painel de configuração do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const config = pegarConfig();

        if (!config.quantidade) config.quantidade = 2;

        // Usa exatamente o mesmo painel do /setupenvia
        const painel = painelBuilder(config, [], []);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("editar_modo")
                .setLabel("Modo")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("editar_valor")
                .setLabel("Valor")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("editar_quantidade")
                .setLabel("Qtd")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ativar_misto")
                .setLabel("Misto")
                .setStyle(ButtonStyle.Primary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("configurar_emojis")
                .setLabel("😀 Configurar Emojis")
                .setStyle(ButtonStyle.Success)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("salvar_config")
                .setLabel("💾 Salvar Tudo")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({
            embeds: painel.embeds,
            components: [row1, row2, row3]
        });
    }
};