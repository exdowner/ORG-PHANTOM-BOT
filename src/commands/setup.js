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

        if (config.quantidade === undefined || config.quantidade === null) {
            config.quantidade = 2;
        }

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

        // LINHA 1: Valor, Modo, Quantidade
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("editar_valor").setLabel("Valor").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("editar_modo").setLabel("Modo").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("editar_quantidade").setLabel("Quantidade").setEmoji("👤").setStyle(ButtonStyle.Secondary)
        );

        // LINHA 2: Emoji Gel Normal e Gel Infinito
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_gel_normal").setLabel("Emoji Gel Normal").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_gel_inf").setLabel("Emoji Gel Infinito").setStyle(ButtonStyle.Success)
        );

        // LINHA 3: Emoji Emulador 1 e Emulador 2
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_emul1").setLabel("Emoji Emulador 1").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("escolher_emoji_emul2").setLabel("Emoji Emulador 2").setStyle(ButtonStyle.Success)
        );

        // LINHA 4: Emoji Sair, Ativar Misto e Salvar
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("escolher_emoji_sair").setLabel("Emoji Sair").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Ativar Misto").setEmoji("🔄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4] 
        });
    }
};