const { ChannelType, PermissionFlagsBits } = require("discord.js");

/**
 * Cria o canal privado para a partida de X1.
 * @param {import('discord.js').Guild} guild 
 * @param {Object} partida 
 * @returns {Promise<import('discord.js').TextChannel|null>}
 */
async function criarCanalPartida(guild, partida) {
    try {
        const canal = await guild.channels.create({
            name: `⚡・x1-${partida.id.slice(-4)}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    // Oculta o canal para todo mundo (@everyone)
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    // Permissão Jogador 1
                    id: partida.jogadores[0],
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    // Permissão Jogador 2
                    id: partida.jogadores[1],
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        return canal;
    } catch (error) {
        console.error("❌ Erro ao executar criarCanalPartida:", error);
        return null;
    }
}

module.exports = criarCanalPartida;