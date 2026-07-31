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

        // --- LISTAS DE EMOJIS (MENUS SUSPENSOS) ---
        
        // 1. Lista para escolher Emoji do GEL (Normal e Infinito)
        const selectGel = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_gel_normal")
            .setPlaceholder("Selecione o Emoji do Gel")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Gelo 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Gelo Azul 🧊").setValue("🧊"),
                new StringSelectMenuOptionBuilder().setLabel("Diamante 💎").setValue("💎"),
                new StringSelectMenuOptionBuilder().setLabel("Bola de Neve ⛄").setValue("⛄"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji (Limpar)").setValue("NONE")
            );

        // 2. Lista para escolher Emoji do EMULADOR (1 e 2)
        const selectEmul = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_emul1")
            .setPlaceholder("Selecione o Emoji do Emulador")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Celular 📱").setValue("📱"),
                new StringSelectMenuOptionBuilder().setLabel("Computador 💻").setValue("💻"),
                new StringSelectMenuOptionBuilder().setLabel("Controle 🎮").setValue("🎮"),
                new StringSelectMenuOptionBuilder().setLabel("Foguete 🚀").setValue("🚀"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji (Limpar)").setValue("NONE")
            );

        // 3. Lista para escolher Emoji do SAIR (Leave)
        const selectSair = new StringSelectMenuBuilder()
            .setCustomId("select_emoji_sair")
            .setPlaceholder("Selecione o Emoji de Sair")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("Porta 🚪").setValue("🚪"),
                new StringSelectMenuOptionBuilder().setLabel("Seta Sair ➡️").setValue("➡️"),
                new StringSelectMenuOptionBuilder().setLabel("Mão 👋").setValue("👋"),
                new StringSelectMenuOptionBuilder().setLabel("X Vermelho ❌").setValue("❌"),
                new StringSelectMenuOptionBuilder().setLabel("Sem Emoji (Limpar)").setValue("NONE")
            );

        // Criação das linhas com os menus
        const row1 = new ActionRowBuilder().addComponents(selectGel);
        const row2 = new ActionRowBuilder().addComponents(selectEmul);
        const row3 = new ActionRowBuilder().addComponents(selectSair);

        // Botão de Salvar e Ativar Misto
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ativar_misto").setLabel("Ativar Misto").setEmoji("🔄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("salvar_config").setLabel("Salvar").setStyle(ButtonStyle.Success)
        );

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2, row3, row4] 
        });
    }
};