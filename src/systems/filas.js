const fs = require("fs");
const path = require("path");

// Caminho do arquivo onde as configurações dos painéis serão salvas
const caminhoArquivo = path.join(__dirname, "../../panelConfigs.json");

// Garante que o arquivo existe
if (!fs.existsSync(caminhoArquivo)) {
    fs.writeFileSync(caminhoArquivo, JSON.stringify({}));
}

// Funções para ler e salvar o arquivo
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

// Mapa em memória para acesso rápido (sincronizado com o arquivo)
let configsCache = carregarConfigs();

module.exports = {
    // Salva a configuração de um painel no arquivo e no cache
    setConfig(painelId, config) {
        // Inicializa a estrutura da fila se não existir
        if (!configsCache[painelId]) {
            configsCache[painelId] = {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': [],
                config: null
            };
        }
        // Salva a configuração (cópia profunda)
        configsCache[painelId].config = JSON.parse(JSON.stringify(config));
        salvarConfigs(configsCache);
    },

    // Recupera a configuração de um painel
    getConfig(painelId) {
        const data = configsCache[painelId];
        if (!data || !data.config) return null;
        return data.config;
    },

    // Adiciona um jogador à fila
    entrarFila(painelId, tipoFila, user) {
        if (!painelId || !tipoFila || !user) {
            return { ok: false, motivo: "❌ Dados inválidos para entrar na fila." };
        }
        if (!configsCache[painelId]) {
            // Se o painel não existir, cria uma estrutura vazia (não deveria acontecer se o painel foi enviado)
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
        // Verifica se o usuário já está em alguma fila deste painel
        for (const key in fila) {
            if (key === 'config') continue;
            if (fila[key].some(j => j.id === user.id)) {
                return { ok: false, motivo: `❌ <@${user.id}>, você já está em uma fila deste painel!` };
            }
        }
        if (fila[tipoFila]) {
            fila[tipoFila].push(user);
            // Atualiza o arquivo (opcional, mas bom para manter o estado das filas)
            salvarConfigs(configsCache);
            return { ok: true };
        }
        return { ok: false, motivo: "❌ Tipo de fila inválido." };
    },

    // Remove um jogador da fila
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
        if (removeu) {
            salvarConfigs(configsCache);
        }
    },

    // Retorna a lista de jogadores de uma fila específica
    jogadores(tipoFila, painelId) {
        if (!painelId || !tipoFila) return [];
        const fila = configsCache[painelId];
        if (!fila) return [];
        return fila[tipoFila] || [];
    }
};