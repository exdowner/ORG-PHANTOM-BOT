const fs = require("fs");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "../../panelConfigs.json");

if (!fs.existsSync(caminhoArquivo)) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify({}));
}

function carregarConfigs() {
    try {
        const data = fs.readFileSync(caminhoArquivo, "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

function salvarConfigs(dados) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2));
}

let paineisCache = carregarConfigs();

module.exports = {
    setConfig(painelId, config) {
        if (!paineisCache[painelId]) {
            paineisCache[painelId] = {
                normal: [],
                infinito: [],
                config: null,
                matchChannelId: null,
                matchStatus: "pendente",
                confirmados: []
            };
        }
        paineisCache[painelId].config = JSON.parse(JSON.stringify(config));
        salvarConfigs(paineisCache);
    },

    getConfig(painelId) {
        const data = paineisCache[painelId];
        if (!data || !data.config) return null;
        return data.config;
    },

    getMatchData(painelId) {
        return paineisCache[painelId] || null;
    },

    setMatchChannel(painelId, channelId) {
        if (!paineisCache[painelId]) return;
        paineisCache[painelId].matchChannelId = channelId;
        salvarConfigs(paineisCache);
    },

    setMatchStatus(painelId, status) {
        if (!paineisCache[painelId]) return;
        paineisCache[painelId].matchStatus = status;
        salvarConfigs(paineisCache);
    },

    adicionarConfirmado(painelId, userId) {
        if (!paineisCache[painelId]) return;
        if (!paineisCache[painelId].confirmados.includes(userId)) {
            paineisCache[painelId].confirmados.push(userId);
            salvarConfigs(paineisCache);
        }
    },

    getConfirmados(painelId) {
        if (!paineisCache[painelId]) return [];
        return paineisCache[painelId].confirmados || [];
    },

    entrarFila(painelId, tipoFila, user) {
        if (!painelId || !tipoFila || !user) {
            return { ok: false, motivo: "❌ Dados inválidos." };
        }
        if (!paineisCache[painelId]) {
            paineisCache[painelId] = {
                normal: [],
                infinito: [],
                config: null,
                matchChannelId: null,
                matchStatus: "pendente",
                confirmados: []
            };
            salvarConfigs(paineisCache);
        }
        const fila = paineisCache[painelId];

        for (const key of ['normal', 'infinito']) {
            if (fila[key].some(j => j.id === user.id)) {
                return { ok: false, motivo: `❌ <@${user.id}>, você já está em uma fila deste painel!` };
            }
        }

        if (tipoFila === 'normal') {
            fila.normal.push(user);
        } else if (tipoFila === 'infinito') {
            fila.infinito.push(user);
        } else {
            return { ok: false, motivo: "❌ Tipo de fila inválido." };
        }
        salvarConfigs(paineisCache);
        return { ok: true };
    },

    sairFila(painelId, user) {
        if (!painelId || !user) return;
        const fila = paineisCache[painelId];
        if (!fila) return;
        let removeu = false;
        for (const key of ['normal', 'infinito']) {
            const antes = fila[key].length;
            fila[key] = fila[key].filter(j => j.id !== user.id);
            if (fila[key].length < antes) removeu = true;
        }
        if (fila.confirmados.includes(user.id)) {
            fila.confirmados = fila.confirmados.filter(id => id !== user.id);
            removeu = true;
        }
        if (removeu) salvarConfigs(paineisCache);
    },

    jogadores(tipoFila, painelId) {
        if (!painelId || !tipoFila) return [];
        const fila = paineisCache[painelId];
        if (!fila) return [];
        return fila[tipoFila] || [];
    },

    limparFilas(painelId) {
        if (!paineisCache[painelId]) return;
        paineisCache[painelId].normal = [];
        paineisCache[painelId].infinito = [];
        paineisCache[painelId].confirmados = [];
        salvarConfigs(paineisCache);
    }
};