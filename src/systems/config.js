const fs = require("fs");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "../../botConfig.json");

function carregarConfig() {
    try {
        if (fs.existsSync(caminhoArquivo)) {
            const data = fs.readFileSync(caminhoArquivo, "utf8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Erro ao carregar config:", err);
    }
    return {
        nomePainel: "PHANTOM",
        valor: "5,00",
        quantidade: 1, // 1 = 1x1
        modoMisto: false,
        emojiGel: null,
        emojiEmulador: null
    };
}

function salvarConfig(novaConfig) {
    try {
        fs.writeFileSync(caminhoArquivo, JSON.stringify(novaConfig, null, 2));
    } catch (err) {
        console.error("Erro ao salvar config:", err);
    }
}

module.exports = {
    pegarConfig: carregarConfig,
    salvarConfig
};