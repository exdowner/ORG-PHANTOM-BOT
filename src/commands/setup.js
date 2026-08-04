const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Configura e envia os painéis de fila.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const config = pegarConfig();

        if (!config.quantidade) config.quantidade = 1;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`⚙️ Configuração do Painel`)
            .setDescription("Configure abaixo e clique em 'Enviar Painéis' para gerar os painéis.")
            .addFields(
                { name: "💰 Valor selecionado:", value: `\`${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho da fila:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("Selecione o Valor")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("R$ 100,00").setValue("100,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 50,00").setValue("50,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 20,00").setValue("20,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 10,00").setValue("10,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 5,00").setValue("5,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 3,00").setValue("3,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 2,00").setValue("2,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 1,00").setValue("1,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 0,50").setValue("0,50")
                )
        );

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_quantidade")
                .setPlaceholder("Selecione o tamanho da fila")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("1x1 (2 jogadores)").setValue("1"),
                    new StringSelectMenuOptionBuilder().setLabel("2x2 (4 jogadores)").setValue("2"),
                    new StringSelectMenuOptionBuilder().setLabel("3x3 (6 jogadores)").setValue("3"),
                    new StringSelectMenuOptionBuilder().setLabel("4x4 (8 jogadores)").setValue("4")
                )
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("enviar_paineis")
                .setLabel("🚀 Enviar Painéis")
                .setStyle(ButtonStyle.Primary)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3] 
        });
    }
};