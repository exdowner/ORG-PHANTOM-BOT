const config = {


    nome:"ORG PHANTOM",


    logo:"https://cdn.discordapp.com/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png?ex=6a6b295a&is=6a69d7da&hm=0d1cb47f1b6244176a03755f5651e4ba746ba93429eaf0a847f8d08e2251e7a0",


    modo:"Emulador",


    formato:"1x1",


    valor:"R$1,00",



    emojiGelNormal:"",


    emojiGelInfinito:"",


    emojiSair:"",



    cor:"#080808"



};





function pegarConfig(){

    return config;

}





function mudarConfig(campo,valor){

    config[campo] = valor;

}





module.exports={

    pegarConfig,

    mudarConfig

};