const filas = new Map();

function obterFila(painelId) {
    if (!filas.has(painelId)) {
        filas.set(painelId, { 
            normal: [], 
            infinito: [], 
            "1emulador": [], 
            "2emuladores": [],
            "3emuladores": [] 
        });
    }
    return filas.get(painelId);
}

function entrarFila(painelId, tipo, membro) {
    const filaPainel = obterFila(painelId);
    
    const userId = membro.id || membro.user?.id || membro;
    const nick = membro.displayName || membro.user?.username || membro.username || "Jogador";
    
    const jogador = { id: userId, nick: nick };

    if (!filaPainel[tipo]) {
        filaPainel[tipo] = [];
    }

    const jaEmAlgumaFila = Object.values(filaPainel).some(lista => 
        Array.isArray(lista) && lista.some(j => (j.id || j) === jogador.id)
    );

    if (jaEmAlgumaFila) {
        return { ok: false, motivo: "⚠️ Você já está em uma das filas deste painel! Saia primeiro para trocar." };
    }

    filaPainel[tipo].push(jogador);
    return { ok: true };
}

function sairFila(painelId, membro) {
    const filaPainel = obterFila(painelId);
    const userId = membro.id || membro.user?.id || membro;

    for (const chave in filaPainel) {
        if (Array.isArray(filaPainel[chave])) {
            filaPainel[chave] = filaPainel[chave].filter(j => (j.id || j) !== userId);
        }
    }

    return true;
}

function jogadores(tipo, painelId) {
    const filaPainel = obterFila(painelId);
    return filaPainel[tipo] || [];
}

module.exports = {
    entrarFila,
    sairFila,
    jogadores
};