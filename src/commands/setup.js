const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
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

        // --- 4 MENUS DE EMOJIS (SEPARADOS) ---
        
        // 1. Gel Normal
        const selectGelNormal = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_gel_normal")
            .setPlaceholder("Emoji do Gel Normal")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Gelo 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Diamante 💎").setValue("💎"),
                new StringSelectMenuOptionBuilder().setLabel("Bola de Neve ⛄").setValue("⛄"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // 2. Gel Infinito (NOVO E SEPARADO!)
        const selectGelInf = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_gel_inf")
            .setPlaceholder("Emoji do Gel Infinito")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Infinito ♾️").setValue("♾️"),
                new StringSelectMenuOptionBuilder().setLabel("Gelo 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Diamante 💎").setValue("💎"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // 3. Emulador 1
        const selectEmul1 = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_emul1")
            .setPlaceholder("Emoji do Emulador 1")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Celular 📱").setValue("📱"),
                new StringSelectMenuOptionBuilder().setLabel("Controle 🎮").setValue("🎮"),
                new StringSelectMenuOptionBuilder().setLabel("Foguete 🚀").setValue("🚀"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // 4. Emulador 2 (NOVO E SEPARADO!)
        const selectEmul2 = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_emul2")
            .setPlaceholder("Emoji do Emulador 2")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Computador 💻").setValue("💻"),
                new StringSelectMenuOptionBuilder().setLabel("Celular 📱").setValue("📱"),
                new StringSelectMenuOptionBuilder().setLabel("Controle 🎮").setValue("🎮"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // Criação das linhas com os menus
        const row1 = new ActionRowBuilder().addComponents(selectGelNormal);
        const row2 = new ActionRowBuilder().addComponents(selectGelInf);
        const row3 = new ActionRowBuilder().addComponents(selectEmul1);
        const row4 = new ActionRowBuilder().addComponents(selectEmul2);

        // Botão de Salvar e Ativar Misto
        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Ativar Misto").setEmoji("🔄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4, row5] 
        });
    }
};