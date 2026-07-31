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
        }).catch(() => {});

        const config = pegarConfig();

        if (!config.quantidade) config.quantidade = 2;

        // Usa o mesmo painel do /setupenvia
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
                .setLabel("Misto On/Off")
                .setStyle(ButtonStyle.Primary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("escolher_emoji_gel_normal")
                .setLabel("Emoji Gel Normal")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("escolher_emoji_gel_inf")
                .setLabel("Emoji Gel Inf")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("escolher_emoji_emul1")
                .setLabel("Emoji Emul 1")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("escolher_emoji_emul2")
                .setLabel("Emoji Emul 2")
                .setStyle(ButtonStyle.Success)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("escolher_emoji_sair")
                .setLabel("Emoji Sair")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("salvar_config")
                .setLabel("Salvar Tudo")
                .setStyle(ButtonStyle.Primary)
        );

        return interaction.editReply({
            embeds: painel.embeds,
            components: [row1, row2, row3]
        });
    }
};