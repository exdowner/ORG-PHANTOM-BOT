const {

    EmbedBuilder,

    ActionRowBuilder,

    ButtonBuilder,

    ButtonStyle

} = require("discord.js");





function resultadoPartida(partida){



    const embed = new EmbedBuilder()



    .setColor("#00ff88")



    .setTitle("🔥 ORG PHANTOM | Partida Iniciada")



    .setDescription(

`

🎮 **A partida começou!**



👤 Jogador 1:

<@${partida.jogadores[0]}>



👤 Jogador 2:

<@${partida.jogadores[1]}>



━━━━━━━━━━━━━━



🏠 **Sala**

\`${partida.sala}\`



🔑 **Senha**

\`${partida.senha}\`



Boa partida! 🍀



`

    )



    .setFooter({

        text:"ORG PHANTOM | Sistema de Partidas"

    });






    const vitoria1 = new ButtonBuilder()

    .setCustomId(

        "vitoria_player1"

    )

    .setLabel(

        "Vitória Player 1"

    )

    .setEmoji("🏆")

    .setStyle(

        ButtonStyle.Success

    );







    const vitoria2 = new ButtonBuilder()

    .setCustomId(

        "vitoria_player2"

    )

    .setLabel(

        "Vitória Player 2"

    )

    .setEmoji("🏆")

    .setStyle(

        ButtonStyle.Success

    );







    const cancelar = new ButtonBuilder()

    .setCustomId(

        "cancelar_resultado"

    )

    .setLabel(

        "Cancelar"

    )

    .setEmoji("❌")

    .setStyle(

        ButtonStyle.Danger

    );







    const row = new ActionRowBuilder()

    .addComponents(

        vitoria1,

        vitoria2,

        cancelar

    );







    return {


        embeds:[embed],


        components:[row]


    };



}





module.exports = resultadoPartida;