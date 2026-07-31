const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Painel de configuração do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
        const config = pegarConfig();

        // CORREÇÃO PARA O UNDEFINED SUMIR DO PAINEL DE EDIÇÃO
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚙️ Painel de Configuração - Preview")
            .setDescription("Abaixo está a pré-visualização das configurações atuais do bot.")
            .addFields(
                { name: "🎮 Modo", value: `\`${config.modo || "Mobile"}\``, inline: true },
                { name: "💰 Valor", value: `\`${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Qtd por time", value: `\`${config.quantidade}\``, inline: true },
                { name: "🔀 Modo Misto", value: config.modoMisto ? "✅ Ativado" : "❌ Desativado", inline: true }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_valor").setLabel("Valor").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_quantidade").setLabel("Qtd").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Misto On/Off").setStyle(ButtonStyle.Primary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_gel_normal").setLabel("Emoji Gel Normal").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_gel_inf").setLabel("Emoji Gel Inf").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_emul1").setLabel("Emoji Emul 1").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_emul2").setLabel("Emoji Emul 2").setStyle(ButtonStyle.Success)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_sair").setLabel("Emoji Sair").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar Tudo").setStyle(ButtonStyle.Primary)
        );

        return await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });
    }
};