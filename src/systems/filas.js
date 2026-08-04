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

let configsCache = carregarConfigs();

module.exports = {
    setConfig(painelId, config) {
        if (!configsCache[painelId]) {
            configsCache[painelId] = {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': [],
                config: null
            };
        }
        configsCache[painelId].config = JSON.parse(JSON.stringify(config));
        salvarConfigs(configsCache);
    },

    getConfig(painelId) {
        const data = configsCache[painelId];
        if (!data || !data.config) return null;
        return data.config;
    },

    entrarFila(painelId, tipoFila, user) {
        if (!painelId || !tipoFila || !user) {
            return { ok: false, motivo: "❌ Dados inválidos para entrar na fila." };
        }
        if (!configsCache[painelId]) {
            configsCache[painelId] = {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': [],
                config: null
            };
            salvarConfigs(configsCache);
        }
        const fila = configsCache[painelId];
        for (const key in fila) {
            if (key === 'config') continue;
            if (fila[key].some(j => j.id === user.id)) {
                return { ok: false, motivo: `❌ <@${user.id}>, você já está em uma fila deste painel!` };
            }
        }
        if (fila[tipoFila]) {
            fila[tipoFila].push(user);
            salvarConfigs(configsCache);
            return { ok: true };
        }
        return { ok: false, motivo: "❌ Tipo de fila inválido." };
    },

    sairFila(painelId, user) {
        if (!painelId || !user) return;
        const fila = configsCache[painelId];
        if (!fila) return;
        let removeu = false;
        for (const key in fila) {
            if (key === 'config') continue;
            const antes = fila[key].length;
            fila[key] = fila[key].filter(j => j.id !== user.id);
            if (fila[key].length < antes) removeu = true;
        }
        if (removeu) salvarConfigs(configsCache);
    },

    jogadores(tipoFila, painelId) {
        if (!painelId || !tipoFila) return [];
        const fila = configsCache[painelId];
        if (!fila) return [];
        return fila[tipoFila] || [];
    }
};