const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Painel de configuração das filas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = pegarConfig();

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚙️ Configuração ORG PHANTOM")
            .setDescription("1. Use os menus para Modo/Valor.\n2. Clique nos botões de emoji para ativar o seletor.\n3. Escolha como deseja enviar.")
            .addFields(
                { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                { name: "💰 Valor:", value: `\`R$ ${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho:", value: `\`${config.quantidade || 1}x${config.quantidade || 1}\``, inline: true },
                { name: "🧊 Gel Normal:", value: config.emojiGelNormal || "🧊", inline: true },
                { name: "♾️ Gel Infinito:", value: config.emojiGelInfinito || "♾️", inline: true },
                { name: "📱 1 Emu:", value: config.emojiEmu1 || "📱", inline: true },
                { name: "💻 2 Emus:", value: config.emojiEmu2 || "💻", inline: true }
            );

        // LINHA 1: Modo e Valor
        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_modo")
                .setPlaceholder("Selecionar Modo")
                .addOptions(
                    { label: "Mobile", value: "Mobile" },
                    { label: "Emulador", value: "Emulador" },
                    { label: "Misto", value: "Misto" }
                ),
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("Selecionar Valor")
                .addOptions(
                    ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"].map(v => ({ label: `R$ ${v}`, value: v }))
                )
        );

        // LINHA 2: Botões de Ativação de Emoji
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("edit_gel_normal").setLabel("Gel Normal").setStyle(ButtonStyle.Secondary).setEmoji("🧊"),
            new ButtonBuilder().setCustomId("edit_gel_infinito").setLabel("Gel Infinito").setStyle(ButtonStyle.Secondary).setEmoji("♾️"),
            new ButtonBuilder().setCustomId("edit_emu1").setLabel("1 Emu").setStyle(ButtonStyle.Secondary).setEmoji("📱"),
            new ButtonBuilder().setCustomId("edit_emu2").setLabel("2 Emus").setStyle(ButtonStyle.Secondary).setEmoji("💻")
        );

        // LINHA 3: O Seletor de Emojis (Começa desativado ou genérico)
        const emojis = interaction.guild.emojis.cache.first(25).map(e => 
            new StringSelectMenuOptionBuilder().setLabel(e.name).setValue(`<:${e.name}:${e.id}>`).setEmoji({id: e.id})
        );
        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_universal")
                .setPlaceholder("Clique em um botão acima para escolher o emoji")
                .addOptions(emojis.length > 0 ? emojis : [{ label: "Sem emojis no server", value: "none" }])
                .setDisabled(emojis.length === 0)
        );

        // LINHA 4: Botões de Envio
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("enviar_unico").setLabel("🚀 Enviar Este (Snap)").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("enviar_todos_valores").setLabel("📦 Enviar Pack (100-0.50)").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row1, row2, row3, row4], ephemeral: true });
    }
};