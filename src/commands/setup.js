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

        // CORREÇÃO: Se a quantidade não existir no banco, define como 2
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        // CORREÇÃO DOS EMOJIS: Se estiver vazio, usa os da imagem
        config.emojiGelNormal = config.emojiGelNormal || "🧊";
        config.emojiGelInfinito = config.emojiGelInfinito || "♾️";
        config.emojiSair = config.emojiSair || "🚪";

        // --- CONSTRUÇÃO DO PAINEL IGUAL A IMAGEM ---
        const embed = new EmbedBuilder()
            .setColor("#2b2d31") // Fundo escuro igual da print
            .setTitle(`ORG PHANTOM | Editor (Preview ao Vivo)`) // Título igual da print
            .setDescription("As mudanças aparecem aqui em tempo real") // Descrição
            .addFields(
                { 
                    name: "**Modo:**", 
                    value: `${config.modo || "mobile"}`, 
                    inline: false 
                },
                { 
                    name: "**Valor:**", 
                    value: `${config.valor || "20,00"}`, 
                    inline: false 
                },
                { 
                    name: "**Quantidade:**", 
                    value: `${config.quantidade} jogadores`, 
                    inline: false 
                },
                { 
                    name: "**Misto:**", 
                    value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", 
                    inline: false 
                }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // Botões da primeira linha
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_valor").setLabel("Valor").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("editar_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_quantidade").setLabel("Quantidade").setEmoji("👤").setStyle(ButtonStyle.Secondary)
        );

        // Botões da segunda linha
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_gel_normal").setLabel("Emojis").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Ativar Misto").setEmoji("🔄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2] 
        });
    }
};