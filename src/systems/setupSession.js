const setups = new Map();

function criarSetup(userId) {
    const config = {
        modo: "Mobile",
        valor: "R$10",
        emojiGelNormal: "◻️",
        emojiGelInfinito: "◻️",
        emojiSair: "❌"
    };

    setups.set(userId, config);
    return config;
}

function pegarSetup(userId) {
    return setups.get(userId);
}

function atualizarSetup(userId, campo, valor) {
    const config = setups.get(userId);
    if (!config) return;

    config[campo] = valor;
    return config;
}

module.exports = {
    criarSetup,
    pegarSetup,
    atualizarSetup
};