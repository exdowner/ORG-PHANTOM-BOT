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

        if (!config.quantidade) config.quantidade = 2;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
            .setDescription("As mudanças aparecem aqui em tempo real")
            .addFields(
                { name: "**📛 Nome do Painel:**", value: `\`${config.nomePainel || "PHANTOM"}\``, inline: false },
                { name: "**🎮 Modo:**", value: `\`${config.modo || "Mobile"}\``, inline: true },
                { name: "**💰 Valor:**", value: `\`${config.valor || "20,00"}\``, inline: true },
                { name: "**👥 Quantidade:**", value: `\`${config.quantidade} jogadores\``, inline: true },
                { name: "**🔀 Misto:**", value: config.modoMisto ? "✅ Ativado" : "❌ Desativado", inline: false }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_nome_painel").setLabel("📛 Nome").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_valor").setLabel("💰 Valor").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("editar_modo").setLabel("🎮 Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_quantidade").setLabel("👥 Qtd").setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("🔀 Misto On/Off").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("💾 Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2] 
        });
    }
};