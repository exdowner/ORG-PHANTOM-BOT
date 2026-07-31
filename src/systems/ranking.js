const fs = require("fs");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "../../rankingData.json");

// Garante que o arquivo de dados existe
if (!fs.existsSync(caminhoArquivo)) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify({}));
}

function carregarRanking() {
    try {
        const data = fs.readFileSync(caminhoArquivo, "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

function salvarRanking(dados) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2));
}

function registrarVitoria(userId) {
    const dados = carregarRanking();

    if (!dados[userId]) {
        dados[userId] = { vitorias: 0, derrotas: 0, winstreak: 0, maxWinstreak: 0 };
    }

    dados[userId].vitorias += 1;
    dados[userId].winstreak += 1;

    if (dados[userId].winstreak > dados[userId].maxWinstreak) {
        dados[userId].maxWinstreak = dados[userId].winstreak;
    }

    salvarRanking(dados);
}

function registrarDerrota(userId) {
    const dados = carregarRanking();

    if (!dados[userId]) {
        dados[userId] = { vitorias: 0, derrotas: 0, winstreak: 0, maxWinstreak: 0 };
    }

    dados[userId].derrotas += 1;
    dados[userId].winstreak = 0;

    salvarRanking(dados);
}

function pegarPerfil(userId) {
    const dados = carregarRanking();
    return dados[userId] || { vitorias: 0, derrotas: 0, winstreak: 0, maxWinstreak: 0 };
}

function pegarTop20() {
    const dados = carregarRanking();
    return Object.entries(dados)
        .map(([id, info]) => ({ id, ...info }))
        .sort((a, b) => b.vitorias - a.vitorias)
        .slice(0, 20);
}

module.exports = { registrarVitoria, registrarDerrota, pegarPerfil, pegarTop20 };