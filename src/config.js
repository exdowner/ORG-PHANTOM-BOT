const fs = require('fs');
const path = require('path');

const caminhoConfig = path.join(__dirname, '../../config.json');

// Configuração padrão caso o arquivo não exista
const defaultConfig = {
    modo: "Mobile",
    valor: "R$ 5,00",
    quantidade: 2,
    modoMisto: false,
    emojiGelNormal: "🧊",
    emojiGelInfinito: "♾️",
    emojiSair: "🚪"
};

function pegarConfig() {
    try {
        if (!fs.existsSync(caminhoConfig)) {
            fs.writeFileSync(caminhoConfig, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        const dados = fs.readFileSync(caminhoConfig, 'utf8');
        return { ...defaultConfig, ...JSON.parse(dados) };
    } catch (err) {
        console.error("Erro ao ler config:", err);
        return defaultConfig;
    }
}

function salvarConfig(novaConfig) {
    try {
        const atual = pegarConfig();
        const atualizado = { ...atual, ...novaConfig };
        fs.writeFileSync(caminhoConfig, JSON.stringify(atualizado, null, 2));
        return true;
    } catch (err) {
        console.error("Erro ao salvar config:", err);
        return false;
    }
}

module.exports = {
    pegarConfig,
    salvarConfig
};