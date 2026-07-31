// --- SISTEMA DE FILAS (INTEGRADO COM SEU SYSTEMS/FILAS.JS) ---
        if (customId.startsWith("entrar_") || customId === "sair_fila") {
            const painelId = message.id;

            if (customId === "sair_fila") {
                filas.sairFila(painelId, user);
                return await interaction.reply({
                    content: `🚪 <@${user.id}>, você saiu de todas as filas deste painel com sucesso!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            const tipoFila = customId.replace("entrar_", "");
            const resultado = filas.entrarFila(painelId, tipoFila, user);

            if (!resultado.ok) {
                return await interaction.reply({
                    content: resultado.motivo,
                    flags: MessageFlags.Ephemeral
                });
            }

            return await interaction.reply({
                content: `✅ <@${user.id}>, você entrou na fila **${tipoFila.toUpperCase()}** com sucesso!`,
                flags: MessageFlags.Ephemeral
            });
        }