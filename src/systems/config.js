const fs = require("fs");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "../../botConfig.json");

// Carrega as configurações do arquivo, ou cria um padrão
function carregarConfig() {
    try {
        if (fs.existsSync(caminhoArquivo)) {
            const data = fs.readFileSync(caminhoArquivo, "utf8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Erro ao carregar config:", err);
    }
    // Configuração padrão
    return {
        nomePainel: "PHANTOM",
        valor: "20,00",
        quantidade: 1,
        emojiGelNormal: null,
        emojiGelInfinito: null,
        emojiEmul1: null,
        emojiEmul2: null,
        emojiSair: null,
        modo: "Mobile",
        modoMisto: false
    };
}

function salvarConfig(novaConfig) {
    try {
        fs.writeFileSync(caminhoArquivo, JSON.stringify(novaConfig, null, 2));
    } catch (err) {
        console.error("Erro ao salvar config:", err);
    }
}

// Exporta as funções
module.exports = {
    pegarConfig: carregarConfig,
    salvarConfig,
    mudarConfig: (campo, valor) => {
        const config = carregarConfig();
        config[campo] = valor;
        salvarConfig(config);
    }
};