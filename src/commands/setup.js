const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
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
            .setTitle("⚙️ Painel de Configuração | ORG PHANTOM")
            .setDescription(
                "1️⃣ Escolha o **Modo** e o **Valor** nos menus abaixo.\n" +
                "2️⃣ Clique no botão do emoji que deseja configurar.\n" +
                "3️⃣ Selecione o emoji no menu e envie o painel."
            )
            .addFields(
                { name: "🎮 Modo", value: `\`${config.modo || "Mobile"}\``, inline: true },
                { name: "💰 Valor", value: `\`R$ ${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho", value: `\`${(config.quantidade || 1) * 2} Players\``, inline: true },
                { name: "🧊 Gel Normal", value: config.emojiGelNormal || "🧊", inline: true },
                { name: "♾️ Gel Infinito", value: config.emojiGelInfinito || "♾️", inline: true },
                { name: "📱 1 Emulador", value: config.emojiEmu1 || "📱", inline: true },
                { name: "💻 2 Emuladores", value: config.emojiEmu2 || "💻", inline: true }
            )
            .setFooter({ text: "ORG PHANTOM | Sistema de Filas" });

        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_modo")
                .setPlaceholder("📌 Selecionar Modo da Partida")
                .addOptions(
                    { label: "Mobile", value: "Mobile" },
                    { label: "Emulador", value: "Emulador" },
                    { label: "Misto", value: "Misto" }
                )
        );

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("💵 Selecionar Valor da Entrada")
                .addOptions(
                    ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"].map(v => ({
                        label: `R$ ${v}`,
                        value: v
                    }))
                )
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("edit_gel_normal").setLabel("Gel Normal").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("edit_gel_infinito").setLabel("Gel Infinito").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("edit_emu1").setLabel("1 Emu").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("edit_emu2").setLabel("2 Emus").setStyle(ButtonStyle.Secondary)
        );

        // Mapeia os emojis garantindo id único na escolha para permitir emojis repetidos sem conflito
        const emojisServidor = interaction.guild.emojis.cache.first(25).map((e, index) => 
            new StringSelectMenuOptionBuilder()
                .setLabel(e.name)
                .setValue(`${e.name}:${e.id}`)
                .setEmoji({ id: e.id, name: e.name })
        );

        const row4 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_universal")
                .setPlaceholder("✨ Selecionar Emoji")
                .addOptions(emojisServidor.length > 0 ? emojisServidor : [{ label: "Sem emojis no servidor", value: "none" }])
                .setDisabled(emojisServidor.length === 0)
        );

        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("enviar_unico").setLabel("🚀 Enviar Apenas Este Painel").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("enviar_todos_valores").setLabel("📦 Enviar Pack Completo (100 a 0,50)").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4, row5], 
            flags: MessageFlags.Ephemeral 
        });
    }
};