const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Painel de configuração do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
        
        // Pega as configurações salvas
        const config = pegarConfig();

        // CORREÇÃO: Se a quantidade estiver vazia (undefined), define como 2 para não quebrar o visual
        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

        // --- CONSTRUÇÃO DO SEU PAINEL ORIGINAL (Visual Correto) ---
        const embed = new EmbedBuilder()
            .setColor("#2b2d31") // Cor de fundo escura do seu painel
            .setTitle(`⚙️ Painel de Configuração - Preview`)
            .setDescription("Abaixo está a pré-visualização das configurações atuais do bot.")
            .addFields(
                { 
                    name: "🎮 Modo", 
                    value: `\`${config.modo || "Mobile"}\``, 
                    inline: true 
                },
                { 
                    name: "💰 Valor", 
                    value: `\`${config.valor || "R$ 1,00"}\``, 
                    inline: true 
                },
                { 
                    name: "👥 Qtd por time", 
                    value: `\`${config.quantidade}\``, // Aqui o undefined não aparece mais!
                    inline: true 
                },
                { 
                    name: "🔀 Modo Misto", 
                    value: config.modoMisto ? "✅ **ATIVADO**" : "❌ **DESATIVADO**", 
                    inline: false 
                }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // Botões do seu painel original
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