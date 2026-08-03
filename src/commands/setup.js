const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Painel de configuração do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
        const config = pegarConfig();

        // Se não tiver quantidade definida, assume 1x1 (multiplicador 1)
        if (!config.quantidade) config.quantidade = 1;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
            .setDescription("As mudanças aparecem aqui em tempo real")
            .addFields(
                { name: "**📛 Nome do Painel:**", value: `\`${config.nomePainel || "PHANTOM"}\``, inline: false },
                { name: "**🎮 Modo:**", value: `\`${config.modo || "Mobile"}\``, inline: true },
                { name: "**💰 Valor:**", value: `\`${config.valor || "20,00"}\``, inline: true },
                { name: "**👥 Multiplicador:**", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                { name: "**🔀 Misto:**", value: config.modoMisto ? "Ativado" : "Desativado", inline: false }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // LINHA 1: Botões de ação (Nome, Modo, Misto, Salvar)
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_nome_painel").setLabel("📛 Nome").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_modo").setLabel("🎮 Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("🔀 Misto On/Off").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("💾 Salvar").setStyle(ButtonStyle.Success)
        );

        // LINHA 2: Seletor de Valor
        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("Selecione o Valor do Painel")
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

        // LINHA 3: Seletor de Multiplicador (1x1, 2x2, 3x3, 4x4)
        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_quantidade")
                .setPlaceholder("Selecione o Tamanho da Fila")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("1x1 (2 jogadores)").setValue("1"),
                    new StringSelectMenuOptionBuilder().setLabel("2x2 (4 jogadores)").setValue("2"),
                    new StringSelectMenuOptionBuilder().setLabel("3x3 (6 jogadores)").setValue("3"),
                    new StringSelectMenuOptionBuilder().setLabel("4x4 (8 jogadores)").setValue("4")
                )
        );

        // LINHA 4: Botões de Emojis (Gel)
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_gel_normal").setLabel("🧊 Gel Normal").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_gel_inf").setLabel("♾️ Gel Inf").setStyle(ButtonStyle.Success)
        );

        // LINHA 5: Botões de Emojis (Emuladores e Sair) + Botão "Enviar Painel"
        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_emul1").setLabel("📱 Emul 1").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_emul2").setLabel("💻 Emul 2").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_sair").setLabel("🚪 Sair").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("enviar_painel_agora").setLabel("🚀 Enviar Painel").setStyle(ButtonStyle.Primary)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4, row5] 
        });
    }
};