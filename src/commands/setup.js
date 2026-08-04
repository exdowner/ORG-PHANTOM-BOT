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
                "📌 **Instruções de uso:**\n" +
                "1️⃣ Escolha o **Modo** e o **Valor** nos menus abaixo.\n" +
                "2️⃣ Clique no **botão do emoji** que deseja alterar.\n" +
                "3️⃣ Selecione o emoji no menu **\"Definir Emoji\"**.\n" +
                "4️⃣ Escolha a forma de envio do painel no canal."
            )
            .addFields(
                { name: "🎮 Modo", value: `\`${config.modo || "Mobile"}\``, inline: true },
                { name: "💰 Valor", value: `\`R$ ${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho", value: `\`${(config.quantidade || 1) * 2} Players (${config.quantidade || 1}x${config.quantidade || 1})\``, inline: true },
                { name: "🧊 Gel Normal", value: config.emojiGelNormal || "🧊", inline: true },
                { name: "♾️ Gel Infinito", value: config.emojiGelInfinito || "♾️", inline: true },
                { name: "📱 1 Emulador", value: config.emojiEmu1 || "📱", inline: true },
                { name: "💻 2 Emuladores", value: config.emojiEmu2 || "💻", inline: true }
            )
            .setFooter({ text: "ORG PHANTOM | Sistema de Filas" });

        // LINHA 1: Menu de Seleção de Modo
        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_modo")
                .setPlaceholder("📌 Selecionar Modo da Partida")
                .addOptions(
                    { label: "Mobile", value: "Mobile", emoji: "📱" },
                    { label: "Emulador", value: "Emulador", emoji: "💻" },
                    { label: "Misto", value: "Misto", emoji: "⚔️" }
                )
        );

        // LINHA 2: Menu de Seleção de Valor
        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("💵 Selecionar Valor da Entrada")
                .addOptions(
                    ["100,00", "50,00", "20,00", "10,00", "5,00", "3,00", "2,00", "1,00", "0,50"].map(v => ({
                        label: `R$ ${v}`,
                        value: v,
                        emoji: "💰"
                    }))
                )
        );

        // LINHA 3: Botões para escolher qual emoji editar
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("edit_gel_normal").setLabel("Gel Normal").setStyle(ButtonStyle.Secondary).setEmoji("🧊"),
            new ButtonBuilder().setCustomId("edit_gel_infinito").setLabel("Gel Infinito").setStyle(ButtonStyle.Secondary).setEmoji("♾️"),
            new ButtonBuilder().setCustomId("edit_emu1").setLabel("1 Emu").setStyle(ButtonStyle.Secondary).setEmoji("📱"),
            new ButtonBuilder().setCustomId("edit_emu2").setLabel("2 Emus").setStyle(ButtonStyle.Secondary).setEmoji("💻")
        );

        // LINHA 4: Seletor Universal de Emojis do Servidor
        const emojisServidor = interaction.guild.emojis.cache.first(25).map(e => 
            new StringSelectMenuOptionBuilder()
                .setLabel(e.name)
                .setValue(`<:${e.name}:${e.id}>`)
                .setEmoji({ id: e.id, name: e.name })
        );

        const optionsEmojis = emojisServidor.length > 0 ? emojisServidor : [
            new StringSelectMenuOptionBuilder().setLabel("Sem emojis customizados no servidor").setValue("none")
        ];

        const row4 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_universal")
                .setPlaceholder("✨ Clique em um botão acima e escolha o emoji aqui")
                .addOptions(optionsEmojis)
                .setDisabled(emojisServidor.length === 0)
        );

        // LINHA 5: Botões para enviar o(s) painel(éis)
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