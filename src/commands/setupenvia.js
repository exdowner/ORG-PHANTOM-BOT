const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupenvia")
        .setDescription("Envia o painel de filas configurado no canal atual."),
    
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
        
        try {
            const config = pegarConfig();

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle(`${config.modo || "X1"} | ${config.valor || "R$ 5,00"} | Qtd: ${config.quantidade || 2}`)
                .setDescription("Selecione uma opção abaixo para entrar na fila:")
                .addFields(
                    { name: "Modo Misto", value: config.modoMisto ? "🟢 Ativado" : "🔴 Desativado", inline: false }
                )
                .setFooter({ text: "ORG PHANTOM • Sistema de Filas" });

            const row = new ActionRowBuilder();

            // Função auxiliar segura para pegar apenas o ID ou nome válido do emoji sem quebrar o Discord
            const formatarEmoji = (emojiStr, fallback) => {
                if (!emojiStr) return fallback;
                // Se for um emoji customizado do discord tipo <:nome:id> ou ID puro
                const matchCustom = emojiStr.match(/<a?:.+?:(\d+)>|[0-9]{17,19}/);
                if (matchCustom) {
                    return matchCustom[1] || emojiStr.replace(/[<>]/g, '').split(':')[2];
                }
                return emojiStr; // Emoji unicode normal (ex: 🧊)
            };

            if (config.modoMisto) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId("entrar_1emulador")
                        .setLabel("1 Emulador")
                        .setEmoji(formatarEmoji(config.emojiEmul1, "📱"))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("entrar_2emuladores")
                        .setLabel("2 Emuladores")
                        .setEmoji(formatarEmoji(config.emojiEmul2, "💻"))
                        .setStyle(ButtonStyle.Primary)
                );
            } else {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId("entrar_gel_normal")
                        .setLabel("Gel Normal")
                        .setEmoji(formatarEmoji(config.emojiGelNormal, "🧊"))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("entrar_gel_inf")
                        .setLabel("Gel Infinito")
                        .setEmoji(formatarEmoji(config.emojiGelInfinito, "♾️"))
                        .setStyle(ButtonStyle.Success)
                );
            }

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId("sair_fila")
                    .setLabel("Sair da Fila")
                    .setEmoji(formatarEmoji(config.emojiSair, "🚪"))
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return await interaction.editReply({ content: "✅ Painel de filas enviado com sucesso neste canal!" });
        } catch (err) {
            console.error("Erro em /setupenvia:", err);
            return await interaction.editReply({ content: "❌ Ocorreu um erro ao enviar o painel. Verifique se os emojis configurados são válidos." });
        }
    }
};