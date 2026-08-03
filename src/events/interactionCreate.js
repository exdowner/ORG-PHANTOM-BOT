const { 
    EmbedBuilder, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");
const ranking = require("../systems/ranking.js");
const filas = require("../systems/filas.js");
const painelBuilder = require("../systems/painelBuilder.js");

const configModule = require("../systems/config.js");
const pegarConfig = configModule.pegarConfig || (() => ({}));
const salvarConfig = configModule.salvarConfig || (() => ({}));

module.exports = async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro em /${interaction.commandName}:`, error);
                const msg = { content: "❌ Erro ao executar comando!", flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
                else await interaction.reply(msg);
            }
            return;
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            const config = pegarConfig();

            if (interaction.customId === "modal_editar_nome_painel") {
                config.nomePainel = interaction.fields.getTextInputValue("input_nome_painel");
            } else if (interaction.customId === "modal_editar_valor") {
                config.valor = interaction.fields.getTextInputValue("input_valor");
            } else if (interaction.customId === "modal_editar_modo") {
                config.modo = interaction.fields.getTextInputValue("input_modo");
            } else if (interaction.customId === "modal_editar_quantidade") {
                const qtd = parseInt(interaction.fields.getTextInputValue("input_quantidade"));
                if (!isNaN(qtd) && qtd > 0) config.quantidade = qtd;
            }

            salvarConfig(config);

            const msgOriginal = interaction.message;
            if (msgOriginal && msgOriginal.embeds.length > 0) {
                const novoPreview = painelBuilder(config, [], []);
                await msgOriginal.edit({ embeds: novoPreview.embeds }).catch(() => {});
            }

            return await interaction.editReply({ content: "✅ Configuração alterada!" });
        }

        if (interaction.isButton()) {
            const { customId, user, guild, channel, message } = interaction;

            // =========================================================
            // BOTÕES QUE ABREM MODAIS
            // =========================================================
            if (customId === "editar_nome_painel") {
                const modal = new ModalBuilder().setCustomId("modal_editar_nome_painel").setTitle("Editar Nome");
                const input = new TextInputBuilder().setCustomId("input_nome_painel").setLabel("Nome do Painel").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_valor") {
                const modal = new ModalBuilder().setCustomId("modal_editar_valor").setTitle("Editar Valor");
                const input = new TextInputBuilder().setCustomId("input_valor").setLabel("Novo Valor").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_modo") {
                const modal = new ModalBuilder().setCustomId("modal_editar_modo").setTitle("Editar Modo");
                const input = new TextInputBuilder().setCustomId("input_modo").setLabel("Novo Modo").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            if (customId === "editar_quantidade") {
                const modal = new ModalBuilder().setCustomId("modal_editar_quantidade").setTitle("Editar Quantidade");
                const input = new TextInputBuilder().setCustomId("input_quantidade").setLabel("Nova Quantidade").setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return await interaction.showModal(modal);
            }

            // =========================================================
            // BOTÕES COM RESPOSTA ADIADA (deferReply)
            // =========================================================
            await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});

            if (customId === "ativar_misto") {
                const config = pegarConfig();
                config.modoMisto = !config.modoMisto;
                salvarConfig(config);

                const msgOriginal = interaction.message;
                if (msgOriginal && msgOriginal.embeds.length > 0) {
                    const novoPreview = painelBuilder(config, [], []);
                    await msgOriginal.edit({ embeds: novoPreview.embeds }).catch(() => {});
                }
                return await interaction.editReply({ content: `🔄 Misto: ${config.modoMisto ? "Ativado" : "Desativado"}` });
            }

            if (customId === "salvar_config") {
                return await interaction.editReply({ content: "✅ Salvo!" });
            }

            // --- Lógica das Filas (Entrar/Sair) ---
            if (customId.startsWith("entrar_") || customId === "sair_fila") {
                const painelId = message.id;
                const configReal = pegarConfig();
                
                let tipoFila = customId.replace("entrar_", "");
                
                // Mapeamento correto do nome da fila
                let nomeFila = tipoFila;
                if (tipoFila === "gel_normal" || tipoFila === "normal") nomeFila = "normal";
                else if (tipoFila === "gel_inf" || tipoFila === "infinito") nomeFila = "infinito";
                else if (tipoFila.includes("1emul")) nomeFila = "1emulador";
                else if (tipoFila.includes("2emul")) nomeFila = "2emuladores";

                if (typeof filas.sairFila !== 'function' || typeof filas.entrarFila !== 'function') {
                    return await interaction.editReply({ content: "❌ Erro: Arquivo de filas não configurado corretamente." });
                }

                if (customId === "sair_fila") {
                    filas.sairFila(painelId, user);
                } else {
                    const resultado = filas.entrarFila(painelId, nomeFila, user);
                    if (!resultado.ok) return await interaction.editReply({ content: resultado.motivo || "Não foi possível entrar na fila." });
                }

                // Busca as listas correspondentes dependendo se o painel está no modo misto/emulador
                const isMisto = !!configReal.modoMisto;
                const lista1 = filas.jogadores(isMisto ? "1emulador" : "normal", painelId) || [];
                const lista2 = filas.jogadores(isMisto ? "2emuladores" : "infinito", painelId) || [];

                const configFinal = {
                    ...configReal,
                    modoMisto: isMisto,
                    modo: configReal.modo || "Mobile",
                    valor: configReal.valor || "20,00",
                    nomePainel: configReal.nomePainel || "PHANTOM",
                    quantidade: configReal.quantidade || 2
                };

                try {
                    if (typeof painelBuilder === "function") {
                        const novoPainel = painelBuilder(configFinal, lista1, lista2);
                        await message.edit(novoPainel).catch(() => {});
                    }
                } catch (err) {
                    console.error("Erro ao atualizar painel público:", err);
                }

                if (customId === "sair_fila") {
                    return await interaction.editReply({ content: `🚪 <@${user.id}>, você saiu da fila!` });
                }
                return await interaction.editReply({ content: `✅ <@${user.id}>, você entrou na fila!` });
            }
        }
    } catch (err) {
        console.error("Erro geral na interação:", err);
    }
};