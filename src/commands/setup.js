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

        // CORREÇÃO DE SEGURANÇA: Se não tiver quantidade, define como 2
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        // --- CONSTRUÇÃO DO PAINEL DE PREVIEW ---
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`)
            .setDescription("As mudanças aparecem aqui em tempo real")
            .addFields(
                { name: "**Modo:**", value: `${config.modo || "mobile"}`, inline: false },
                { name: "**Valor:**", value: `${config.valor || "20,00"}`, inline: false },
                { name: "**Quantidade:**", value: `${config.quantidade} jogadores`, inline: false },
                { name: "**Misto:**", value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", inline: false }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // --- LINHA 1: DADOS BÁSICOS ---
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_valor").setLabel("Valor").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("editar_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_quantidade").setLabel("Quantidade").setEmoji("👤").setStyle(ButtonStyle.Secondary)
        );

        // --- LINHA 2: EMOJIS (Apenas 3 botões, do jeito que você pediu) ---
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("escolher_emoji_gel_normal") // Muda GEL Normal e Infinito
                .setLabel("Emoji Gel")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("escolher_emoji_emul1") // Muda Emulador 1 e 2
                .setLabel("Emoji Emul")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("escolher_emoji_sair") // Muda o botão Sair
                .setLabel("Emoji Sair")
                .setStyle(ButtonStyle.Danger)
        );

        // --- LINHA 3: MISTO E SALVAR ---
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ativar_misto")
                .setLabel("Ativar Misto")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("salvar_config")
                .setLabel("Salvar")
                .setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3] 
        });
    }
};