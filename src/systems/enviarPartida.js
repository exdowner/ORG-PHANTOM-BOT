const {
    pegarPartida,
    iniciarPartida
} = require("./partidas");


const resultadoPartida =
require("../embeds/resultadoPartida");





async function enviarPartida(

    partidaId,

    sala,

    senha,

    guild

){



    const partida =
    pegarPartida(partidaId);



    if(!partida)

        return false;





    iniciarPartida(

        partidaId,

        sala,

        senha

    );






    const jogadores =
    partida.jogadores;





    for(const id of jogadores){



        const membro =
        await guild.members.fetch(id)
        .catch(()=>null);



        if(!membro)

            continue;





        try{


            await membro.send(

                resultadoPartida(partida)

            );


        }catch(e){


            console.log(
                "Não consegui enviar DM para:",
                id
            );


        }



    }






    return true;


}





module.exports = enviarPartida;