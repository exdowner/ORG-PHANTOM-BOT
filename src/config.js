const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config.json");

const padrao = {
    valor: "R$ 10,00",
    modo: "X1",
    quantidade: 2,
    modoMisto: false,
    emojiGelNormal: "🧊",
    emojiGelInfinito: "♾️",
    emojiEmulador: "🟢",
    emojiSair: "🚪"
};

function carregar() {
    try {
        if (fs.existsSync(configPath)) {
            return { ...padrao, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
        }
    } catch (e) {}
    return { ...padrao };
}

function salvar(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function pegarConfig() {
    return carregar();
}

function mudarConfig(chave, valor) {
    const config = carregar();
    config[chave] = valor;
    salvar(config);
    return config;
}

module.exports = { pegarConfig, mudarConfig };