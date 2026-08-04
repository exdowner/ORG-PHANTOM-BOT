const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Configura e envia os painéis de fila.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 1;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚙️ Configuração do Painel")
            .setDescription("Configure abaixo e clique em 'Enviar Painéis'.")
            .addFields(
                { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true },
                { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // LINHA 1: Modo
        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_modo")
                .setPlaceholder("Modo")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("Mobile").setValue("Mobile"),
                    new StringSelectMenuOptionBuilder().setLabel("Emulador").setValue("Emulador"),
                    new StringSelectMenuOptionBuilder().setLabel("Misto").setValue("Misto")
                )
        );

        // LINHA 2: Valor
        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("Valor")
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

        // LINHA 3: Quantidade
        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_quantidade")
                .setPlaceholder("Tamanho da fila")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("1x1 (2 jogadores)").setValue("1"),
                    new StringSelectMenuOptionBuilder().setLabel("2x2 (4 jogadores)").setValue("2"),
                    new StringSelectMenuOptionBuilder().setLabel("3x3 (6 jogadores)").setValue("3"),
                    new StringSelectMenuOptionBuilder().setLabel("4x4 (8 jogadores)").setValue("4")
                )
        );

        // LINHA 4: Emoji Gel
        const row4 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_gel")
                .setPlaceholder("Emoji Gel")
                .addOptions(
                    interaction.guild.emojis.cache.first(25).map(e =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(e.name)
                            .setValue(`<:${e.name}:${e.id}>`)
                            .setEmoji({ id: e.id, name: e.name })
                    )
                )
        );

        // LINHA 5: Emoji Emulador + Botão Enviar
        const row5 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_emulador")
                .setPlaceholder("Emoji Emulador")
                .addOptions(
                    interaction.guild.emojis.cache.first(25).map(e =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(e.name)
                            .setValue(`<:${e.name}:${e.id}>`)
                            .setEmoji({ id: e.id, name: e.name })
                    )
                ),
            new ButtonBuilder()
                .setCustomId("enviar_paineis")
                .setLabel("🚀 Enviar Painéis")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4, row5],
            flags: MessageFlags.Ephemeral
        });
    }
};