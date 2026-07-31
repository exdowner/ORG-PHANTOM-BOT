const {

EmbedBuilder,

ActionRowBuilder,

ButtonBuilder,

ButtonStyle

} = require("discord.js");





module.exports = function(partida, mediadorId){



const embed = new EmbedBuilder()

.setColor("#00ffff")

.setTitle("🔥 ORG PHANTOM | Partida")

.setDescription(`


👤 Player 1:

<@${partida.jogadores[0]}>



⚔️ VS



👤 Player 2:

<@${partida.jogadores[1]}>



━━━━━━━━━━━━━━


🎮 Mediador:

<@${mediadorId}>


Aguardando início da partida.


`);






const iniciar = new ButtonBuilder()

.setCustomId(

`iniciar_partida_${partida.id}`

)

.setLabel(

"Iniciar Partida"

)

.setEmoji("🎮")

.setStyle(

ButtonStyle.Primary

);






return {


embeds:[embed],


components:[

new ActionRowBuilder()

.addComponents(iniciar)

]


};



}