const filasAtivas = new Map();

module.exports = {
    setConfig(painelId, config) {
        if (!filasAtivas.has(painelId)) {
            filasAtivas.set(painelId, {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': [],
                config: null
            });
        }
        filasAtivas.get(painelId).config = { ...config };
    },

    getConfig(painelId) {
        const data = filasAtivas.get(painelId);
        return data?.config || null;
    },

    entrarFila(painelId, tipoFila, user) {
        if (!painelId || !tipoFila || !user) {
            return { ok: false, motivo: "❌ Dados inválidos para entrar na fila." };
        }
        if (!filasAtivas.has(painelId)) {
            filasAtivas.set(painelId, {
                normal: [],
                infinito: [],
                '1emulador': [],
                '2emuladores': [],
                config: null
            });
        }
        const fila = filasAtivas.get(painelId);
        for (const key in fila) {
            if (key === 'config') continue;
            if (fila[key].some(j => j.id === user.id)) {
                return { ok: false, motivo: `❌ <@${user.id}>, você já está em uma fila deste painel!` };
            }
        }
        if (fila[tipoFila]) {
            fila[tipoFila].push(user);
            console.log(`✅ [FILA] ${user.username} entrou em ${tipoFila} (Agora tem ${fila[tipoFila].length})`);
            return { ok: true };
        }
        return { ok: false, motivo: "❌ Tipo de fila inválido." };
    },

    sairFila(painelId, user) {
        if (!painelId || !user) return;
        const fila = filasAtivas.get(painelId);
        if (!fila) return;
        let removeu = false;
        for (const key in fila) {
            if (key === 'config') continue;
            const antes = fila[key].length;
            fila[key] = fila[key].filter(j => j.id !== user.id);
            if (fila[key].length < antes) removeu = true;
        }
        if (removeu) console.log(`✅ [FILA] ${user.username} saiu do painel ${painelId}`);
    },

    jogadores(tipoFila, painelId) {
        if (!painelId || !tipoFila) return [];
        const fila = filasAtivas.get(painelId);
        if (!fila) return [];
        return fila[tipoFila] || [];
    }
};