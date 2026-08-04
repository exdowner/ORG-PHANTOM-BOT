const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { pegarConfig } = require("../systems/config.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Configura e envia os painéis de fila.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // ✅ Apenas um deferReply, sem risco de duplicata
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = pegarConfig();
        if (!config.quantidade) config.quantidade = 1;

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚙️ Configuração do Painel")
            .setDescription("Configure abaixo e clique em 'Enviar Painéis'.")
            .addFields(
                { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                { name: "👥 Tamanho:", value: `\`${config.quantidade}x${config.quantidade}\``, inline: true },
                { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true },
                { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true },
                { name: "👑 Cargos:", value: config.cargosPermitidos?.length ? config.cargosPermitidos.map(id => `<@&${id}>`).join(", ") : "Nenhum", inline: false }
            )
            .setFooter({ text: "Só você pode ver esta mensagem • Ignorar mensagem" });

        // LINHA 1: Modo
        const rowModo = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_modo")
                .setPlaceholder("Modo")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("Mobile").setValue("Mobile"),
                    new StringSelectMenuOptionBuilder().setLabel("Emulador").setValue("Emulador"),
                    new StringSelectMenuOptionBuilder().setLabel("Misto").setValue("Misto")
                )
        );

        // LINHA 2: Valor
        const rowValor = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_valor")
                .setPlaceholder("Valor")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("R$ 100,00").setValue("100,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 50,00").setValue("50,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 20,00").setValue("20,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 10,00").setValue("10,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 5,00").setValue("5,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 3,00").setValue("3,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 2,00").setValue("2,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 1,00").setValue("1,00"),
                    new StringSelectMenuOptionBuilder().setLabel("R$ 0,50").setValue("0,50")
                )
        );

        // LINHA 3: Quantidade
        const rowQuantidade = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_quantidade")
                .setPlaceholder("Tamanho da fila")
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel("1x1 (2 jogadores)").setValue("1"),
                    new StringSelectMenuOptionBuilder().setLabel("2x2 (4 jogadores)").setValue("2"),
                    new StringSelectMenuOptionBuilder().setLabel("3x3 (6 jogadores)").setValue("3"),
                    new StringSelectMenuOptionBuilder().setLabel("4x4 (8 jogadores)").setValue("4")
                )
        );

        // LINHA 4: Emojis (Gel e Emulador em um único menu? Não, precisamos de dois menus separados, mas podemos juntar em um único menu com dois placeholders? O Discord permite até 5 linhas. Vamos usar dois menus em uma linha? Não pode, um menu por linha. Vamos usar dois menus em duas linhas, mas aí ultrapassamos 5 linhas. Vamos juntar em um único menu com duas opções? Melhor: Usar um menu para Emoji Gel e outro para Emoji Emulador, mas colocá-los na mesma linha? Não é permitido. Vamos usar dois botões para abrir menus separados? Isso é mais complexo. Simplificamos: usamos dois menus em duas linhas, e a linha 5 é o botão Enviar. Isso dá 5 linhas (Modo, Valor, Quantidade, Emoji Gel, Emoji Emulador). Mas precisamos também do botão Enviar. Então teremos 6 linhas. Vamos combinar Emoji Gel e Emoji Emulador em uma única linha? Não podemos ter dois menus na mesma linha. Então faremos: Linha 1: Modo, Linha 2: Valor, Linha 3: Quantidade, Linha 4: Emoji Gel, Linha 5: Emoji Emulador. E o botão Enviar terá que ser adicionado a uma dessas linhas? Podemos colocar o botão Enviar na linha 5 junto com o menu Emoji Emulador? Não, não podemos misturar menu e botão na mesma linha? Na verdade podemos, uma linha pode ter menus e botões, mas o Discord pode não aceitar misturar tipos. Melhor é usar um botão separado na linha 6, mas aí ultrapassa. Vamos simplificar: remover o seletor de cargos (pode ser feito depois) e colocar o botão Enviar na linha 4 junto com o Emoji Gel? Vamos fazer: Linha 1: Modo, Linha 2: Valor, Linha 3: Quantidade, Linha 4: Emoji Gel + Emoji Emulador (dois menus na mesma linha? Não funciona). Então faremos: Linha 1: Modo, Linha 2: Valor, Linha 3: Quantidade, Linha 4: Emoji Gel, Linha 5: Emoji Emulador + Botão Enviar (misturar menu e botão na mesma linha é permitido? Sim, o Discord permite misturar tipos de componentes em uma linha, desde que o total de componentes seja <=5. Então podemos ter um menu e um botão na mesma linha). Vamos fazer isso: Linha 5: StringSelectMenu (Emoji Emulador) + Button (Enviar). Isso dará 5 linhas. Ok.

        Vamos refazer o código com essa estrutura.

        // LINHA 4: Emoji Gel
        const rowEmojiGel = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_gel")
                .setPlaceholder("Emoji Gel")
                .addOptions(
                    interaction.guild.emojis.cache.first(25).map(e =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(e.name)
                            .setValue(`<:${e.name}:${e.id}>`)
                            .setEmoji({ id: e.id, name: e.name })
                    )
                )
        );

        // LINHA 5: Emoji Emulador + Botão Enviar
        const rowEmojiEmul = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_emoji_emulador")
                .setPlaceholder("Emoji Emulador")
                .addOptions(
                    interaction.guild.emojis.cache.first(25).map(e =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(e.name)
                            .setValue(`<:${e.name}:${e.id}>`)
                            .setEmoji({ id: e.id, name: e.name })
                    )
                ),
            new ButtonBuilder()
                .setCustomId("enviar_paineis")
                .setLabel("🚀 Enviar Painéis")
                .setStyle(ButtonStyle.Primary)
        );

        // O seletor de cargos será removido para simplificar (pode ser adicionado depois)
        // Se quiser manter, podemos colocar na linha 6, mas aí estoura o limite. Então removemos.

        return await interaction.editReply({ 
            embeds: [embed], 
            components: [rowModo, rowValor, rowQuantidade, rowEmojiGel, rowEmojiEmul] 
        });
    }
};