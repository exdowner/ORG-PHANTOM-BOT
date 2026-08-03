const config = {
    nome: "ORG PHANTOM",
    nomePainel: "ORG PHANTOM",
    logo: "https://cdn.discordapp.com/attachments/1523200272158036008/1531973873116123276/Design_sem_nome.png",
    modo: "Mobile",
    modoMisto: false,
    formato: "1x1",
    valor: "R$1,00",
    quantidade: 2,
    emojiGelNormal: "",
    emojiGelInfinito: "",
    emojiEmul1: "",
    emojiEmul2: "",
    emojiSair: "",
    cor: "#080808"
};

function pegarConfig() {
    return config;
}

function salvarConfig(nova) {
    Object.assign(config, nova);
}

function mudarConfig(campo, valor) {
    config[campo] = valor;
}

module.exports = {
    pegarConfig,
    salvarConfig,
    mudarConfig
};