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
    
    // Puxa o ID do membro com segurança extrema (seja GuildMember, User ou Object)
    const userId = membro.id || membro.user?.id || membro;
    const nick = membro.displayName || membro.user?.username || membro.username || "Jogador";
    
    const jogador = { id: userId, nick: nick };

    // Garante que o array do tipo informado exista
    if (!filaPainel[tipo]) {
        filaPainel[tipo] = [];
    }

    // Evita entrar se o jogador já estiver em QUALQUER fila deste painel
    const jaEmAlgumaFila = Object.values(filaPainel).some(lista => 
        Array.isArray(lista) && lista.some(j => (j.id || j) === jogador.id)
    );

    if (jaEmAlgumaFila) {
        return { ok: false, motivo: "⚠️ Você já está em uma das filas deste painel! Saia primeiro para trocar." };
    }

    // Adiciona o jogador APENAS no tipo de fila correto que ele clicou
    filaPainel[tipo].push(jogador);

    return { ok: true };
}

function sairFila(painelId, membro) {
    const filaPainel = obterFila(painelId);
    const userId = membro.id || membro.user?.id || membro;

    // Remove o jogador de todas as filas registradas nesse painel
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