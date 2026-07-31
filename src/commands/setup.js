const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require("discord.js");
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

        // --- MENUS DE EMOJIS (ORGANIZADOS EM 2 LINHAS PARA NÃO DAR ERRO) ---

        // 1. Gel Normal
        const selectGelNormal = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_gel_normal")
            .setPlaceholder("Emoji: Gel Normal")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Gelo 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Diamante 💎").setValue("💎"),
                new StringSelectMenuOptionBuilder().setLabel("Bola de Neve ⛄").setValue("⛄"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // 2. Gel Infinito (Junto com o Normal na mesma linha)
        const selectGelInf = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_gel_inf")
            .setPlaceholder("Emoji: Gel Infinito")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Infinito ♾️").setValue("♾️"),
                new StringSelectMenuOptionBuilder().setLabel("Gelo 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Diamante 💎").setValue("💎"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // Linha 1: Gel Normal + Gel Infinito
        const rowEmojis1 = new ActionRowBuilder().addComponents(selectGelNormal, selectGelInf);

        // 3. Emulador 1
        const selectEmul1 = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_emul1")
            .setPlaceholder("Emoji: Emulador 1")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Celular 📱").setValue("📱"),
                new StringSelectMenuOptionBuilder().setLabel("Controle 🎮").setValue("🎮"),
                new StringSelectMenuOptionBuilder().setLabel("Foguete 🚀").setValue("🚀"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // 4. Emulador 2 (Junto com o 1 na mesma linha)
        const selectEmul2 = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_emul2")
            .setPlaceholder("Emoji: Emulador 2")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Computador 💻").setValue("💻"),
                new StringSelectMenuOptionBuilder().setLabel("Celular 📱").setValue("📱"),
                new StringSelectMenuOptionBuilder().setLabel("Controle 🎮").setValue("🎮"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji").setValue("NONE")
            );

        // Linha 2: Emulador 1 + Emulador 2
        const rowEmojis2 = new ActionRowBuilder().addComponents(selectEmul1, selectEmul2);

        // --- BOTÕES DE CONTROLE (Misto e Salvar) ---
        const rowBotoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Ativar Misto").setEmoji("🔄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [rowEmojis1, rowEmojis2, rowBotoes] 
        });
    }
};