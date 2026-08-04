// --- MENUS DE CONFIGURAÇÃO DO SETUP ---
        if (interaction.isStringSelectMenu() && !interaction.customId.startsWith('select_vencedor_')) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            }

            const config = pegarConfig();
            const valor = interaction.values[0];

            if (interaction.customId === "select_modo") {
                config.modo = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_valor") {
                config.valor = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_quantidade") {
                const qtd = parseInt(valor);
                if (!isNaN(qtd) && qtd > 0) {
                    config.quantidade = qtd;
                    salvarConfig(config);
                }
            } else if (interaction.customId === "select_emoji_gel") {
                config.emojiGel = valor;
                salvarConfig(config);
            } else if (interaction.customId === "select_emoji_emulador") {
                config.emojiEmulador = valor;
                salvarConfig(config);
            }

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const embedOriginal = msgOriginal.embeds[0];
                const newEmbed = EmbedBuilder.from(embedOriginal).setFields(
                    { name: "🎮 Modo:", value: config.modo || "Mobile", inline: true },
                    { name: "💰 Valor:", value: `\`${config.valor || "5,00"}\``, inline: true },
                    { name: "👥 Tamanho:", value: `\`${config.quantidade || 1}x${config.quantidade || 1}\``, inline: true },
                    { name: "😊 Emoji Gel:", value: config.emojiGel || "Nenhum", inline: true },
                    { name: "😊 Emoji Emulador:", value: config.emojiEmulador || "Nenhum", inline: true }
                );
                try {
                    await msgOriginal.edit({ embeds: [newEmbed] });
                } catch (err) {
                    console.error("Erro ao atualizar preview:", err);
                }
            }

            await interaction.editReply({ content: "✅ Configuração atualizada!" });
            return;
        }