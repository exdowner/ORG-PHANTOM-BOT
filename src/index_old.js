require("dotenv").config();


const {

    Client,

    GatewayIntentBits,

    Collection,

    ModalBuilder,

    TextInputBuilder,

    TextInputStyle,

    ActionRowBuilder,

    EmbedBuilder,

    ButtonBuilder,

    ButtonStyle,

    StringSelectMenuBuilder


} = require("discord.js");


const fs = require("fs");



const {

    mudarConfig,

    pegarConfig


} = require("./systems/config");





const client = new Client({

    intents:[

        GatewayIntentBits.Guilds

    ]

});





client.commands = new Collection();





const files = fs.readdirSync("./src/commands")

.filter(file => file.endsWith(".js"));





for(const file of files){


    const command = require(`./commands/${file}`);


    client.commands.set(

        command.data.name,

        command

    );


}








function criarEmbedEditor(){


    const config = pegarConfig();




    return new EmbedBuilder()


    .setColor(config.cor)


    .setTitle("ORG PHANTOM | Editor")


    .setThumbnail(config.logo)


    .setDescription(

`
**Preview**

${config.formato} ${config.modo} | ${config.valor}


**Gel Normal:**
${config.emojiGelNormal || "Nenhum"}


**Gel Inf:**
${config.emojiGelInfinito || "Nenhum"}


**Sair:**
${config.emojiSair || "Nenhum"}

`

    );



}









client.once("clientReady",()=>{


console.log("--------------------------------");

console.log("ORG PHANTOM ONLINE");

console.log(`Bot: ${client.user.tag}`);

console.log("--------------------------------");


});









client.on("interactionCreate", async interaction =>{






// =====================
// COMANDOS
// =====================


if(interaction.isChatInputCommand()){



    const command = client.commands.get(

        interaction.commandName

    );



    if(command){

        await command.execute(interaction);

    }


}









// =====================
// BOTÕES
// =====================


if(interaction.isButton()){





// EDITAR VALOR


if(interaction.customId === "editar_valor"){



    const modal = new ModalBuilder()


    .setCustomId("modal_valor")


    .setTitle("Editar Valor");





    const campo = new TextInputBuilder()


    .setCustomId("valor")


    .setLabel("Valor da partida")


    .setPlaceholder("Ex: R$1,00")


    .setStyle(TextInputStyle.Short);





    modal.addComponents(

        new ActionRowBuilder()

        .addComponents(campo)

    );





    return interaction.showModal(modal);



}









// EDITAR MODO


if(interaction.customId === "editar_modo"){



    const row = new ActionRowBuilder()

    .addComponents(



        new ButtonBuilder()

        .setCustomId("modo_mobile")

        .setLabel("Mobile")

        .setStyle(ButtonStyle.Primary),



        new ButtonBuilder()

        .setCustomId("modo_emulador")

        .setLabel("Emulador")

        .setStyle(ButtonStyle.Primary),



        new ButtonBuilder()

        .setCustomId("modo_misto")

        .setLabel("Misto")

        .setStyle(ButtonStyle.Primary)



    );




    return interaction.reply({

        content:"Escolha o modo:",

        components:[row],

        ephemeral:true

    });


}









// MODOS


if(

interaction.customId === "modo_mobile" ||

interaction.customId === "modo_emulador" ||

interaction.customId === "modo_misto"

){



    const modo = {

        modo_mobile:"Mobile",

        modo_emulador:"Emulador",

        modo_misto:"Misto"


    };



    mudarConfig(

        "modo",

        modo[interaction.customId]

    );




    return interaction.update({

        content:"Modo atualizado.",

        embeds:[criarEmbedEditor()],

        components:[]

    });


}









// EDITAR EMOJIS


if(interaction.customId === "editar_emojis"){



    const emojis = interaction.guild.emojis.cache;




    if(emojis.size === 0){


        return interaction.reply({

            content:"Servidor sem emojis.",

            ephemeral:true

        });


    }







    const lista = emojis.map(e=>({


        label:e.name,

        value:e.id


    })).slice(0,25);







    const normal = new StringSelectMenuBuilder()


    .setCustomId("emoji_normal")


    .setPlaceholder("Gel Normal")


    .addOptions(lista);







    const infinito = new StringSelectMenuBuilder()


    .setCustomId("emoji_infinito")


    .setPlaceholder("Gel Inf")


    .addOptions(lista);







    const sair = new StringSelectMenuBuilder()


    .setCustomId("emoji_sair")


    .setPlaceholder("Sair")


    .addOptions(lista);







    return interaction.reply({


        content:"Configurar Emojis ORG PHANTOM",


        ephemeral:true,


        components:[


            new ActionRowBuilder()

            .addComponents(normal),



            new ActionRowBuilder()

            .addComponents(infinito),



            new ActionRowBuilder()

            .addComponents(sair)



        ]

    });



}



}









// =====================
// MODAL
// =====================


if(interaction.isModalSubmit()){



if(interaction.customId === "modal_valor"){



    const valor = interaction.fields.getTextInputValue(

        "valor"

    );



    mudarConfig(

        "valor",

        valor

    );



    return interaction.update({

        embeds:[criarEmbedEditor()]

    });


}



}









// =====================
// SELECT EMOJIS
// =====================


if(interaction.isStringSelectMenu()){



    const emoji = interaction.guild.emojis.cache.get(

        interaction.values[0]

    );



    const formato = emoji.animated


    ? `<a:${emoji.name}:${emoji.id}>`


    : `<:${emoji.name}:${emoji.id}>`;








    if(interaction.customId === "emoji_normal"){


        mudarConfig(

            "emojiGelNormal",

            formato

        );


    }






    if(interaction.customId === "emoji_infinito"){


        mudarConfig(

            "emojiGelInfinito",

            formato

        );


    }






    if(interaction.customId === "emoji_sair"){


        mudarConfig(

            "emojiSair",

            formato

        );


    }






    return interaction.reply({

        content:"Emoji salvo.",

        ephemeral:true

    });



}



});







client.login(

    process.env.DISCORD_TOKEN

);