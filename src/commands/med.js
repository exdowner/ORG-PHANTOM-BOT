const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { pegarPartida } = require("../systems/partidas");
const { pegarPartidaPorCanal } = require("../systems/canais");
const criarPainelMediador = require("../embeds/mediador");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("med")
        .setDescription("Abre o painel de mediação (apenas Mediadores)"),

    async execute(interaction) {
        const temCargo = interaction.member.roles.cache.some(r => r.name.toLowerCase() === "mediador");
        const ehAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!temCargo && !ehAdmin) {
            return interaction.reply({ content: "❌ Apenas **Mediadores** podem usar este comando.", flags: 64 });
        }

        const partidaId = pegarPartidaPorCanal(interaction.channel.id);
        const partida = partidaId ? pegarPartida(partidaId) : null;

        if (!partida) {
            return interaction.reply({ content: "❌ Nenhuma partida encontrada neste canal.", flags: 64 });
        }

        const p1 = await interaction.guild.members.fetch(partida.jogadores[0]).catch(() => null);
        const p2 = await interaction.guild.members.fetch(partida.jogadores[1]).catch(() => null);

        partida.nick1 = p1 ? p1.displayName : "Jogador 1";
        partida.nick2 = p2 ? p2.displayName : "Jogador 2";

        const painel = criarPainelMediador(partida);
        return interaction.reply({ ...painel, flags: 64 });
    }
};