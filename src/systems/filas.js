// Arquivo: src/systems/filas.js

// Simula um banco de dados em memória (se você não tiver um banco real)
const filasAtivas = new Map();

module.exports = {
    /**
     * Adiciona um jogador a uma fila específica
     * @param {string} painelId - ID da mensagem do painel
     * @param {string} tipoFila - 'normal', 'infinito', '1emulador', '2emuladores'
     * @param {Object} user - Objeto do usuário do Discord
     * @returns {Object} { ok: boolean, motivo?: string }
     */
    entrarFila(painelId, tipoFila, user) {
        if (!painelId || !tipoFila || !user) {
            return { ok: false, motivo: "❌ Dados inválidos para entrar na fila." };
        }

        // Inicializa a fila se ela não existir
        if (!filasAtivas.has(painelId)) {
            filasAtivas.set(painelId, {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': []
            });
        }

        const fila = filasAtivas.get(painelId);

        // Verifica se o jogador já está na fila
        for (const key in fila) {
            if (fila[key].some(j => j.id === user.id)) {
                return { ok: false, motivo: `❌ <@${user.id}>, você já está em uma fila deste painel!` };
            }
        }

        // Adiciona o jogador à fila específica
        if (fila[tipoFila]) {
            fila[tipoFila].push(user);
            console.log(`✅ [FILA] ${user.username} entrou em ${tipoFila} (Agora tem ${fila[tipoFila].length})`);
            return { ok: true };
        } else {
            return { ok: false, motivo: "❌ Tipo de fila inválido." };
        }
    },

    /**
     * Remove um jogador de todas as filas de um painel
     * @param {string} painelId - ID da mensagem do painel
     * @param {Object} user - Objeto do usuário do Discord
     */
    sairFila(painelId, user) {
        if (!painelId || !user) return;

        const fila = filasAtivas.get(painelId);
        if (!fila) {
            console.log(`⚠️ [FILA] Tentativa de sair de um painel que não existe: ${painelId}`);
            return;
        }

        // Remove o jogador de qualquer fila que ele estiver
        let removeu = false;
        for (const key in fila) {
            const antes = fila[key].length;
            fila[key] = fila[key].filter(j => j.id !== user.id);
            if (fila[key].length < antes) removeu = true;
        }

        if (removeu) {
            console.log(`✅ [FILA] ${user.username} saiu do painel ${painelId}`);
        } else {
            console.log(`⚠️ [FILA] ${user.username} não estava em nenhuma fila do painel ${painelId}`);
        }

        // Se a fila estiver vazia, pode remover do mapa (opcional)
        // if (fila.normal.length === 0 && fila.infinito.length === 0 && fila['1emulador'].length === 0 && fila['2emuladores'].length === 0) {
        //     filasAtivas.delete(painelId);
        // }
    },

    /**
     * Retorna a lista de jogadores de uma fila específica
     * @param {string} tipoFila - 'normal', 'infinito', '1emulador', '2emuladores'
     * @param {string} painelId - ID da mensagem do painel
     * @returns {Array} Lista de objetos de usuários
     */
    jogadores(tipoFila, painelId) {
        if (!painelId || !tipoFila) return [];

        const fila = filasAtivas.get(painelId);
        if (!fila) return [];

        return fila[tipoFila] || [];
    }
};