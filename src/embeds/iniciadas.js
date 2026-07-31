const {
    EmbedBuilder
} = require("discord.js");


function partidaIniciada(partida){


    return new EmbedBuilder()

    .setColor("#00ff00")

    .setTitle("🔥 ORG PHANTOM | Partida Iniciada")

    .setDescription(`

🎮 **Partida liberada!**


👤 Jogador 1:
<@${partida.jogadores[0]}>



👤 Jogador 2:
<@${partida.jogadores[1]}>



━━━━━━━━━━━━━━


🏠 Sala:

\`${partida.sala}\`


🔑 Senha:

\`${partida.senha}\`


Boa partida! 🔥


`)

    .setFooter({

        text:"ORG PHANTOM"

    });


}


module.exports = partidaIniciada;