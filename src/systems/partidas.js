const partidas = new Map();

function criarPartida(partidaId, dados) {
    partidas.set(partidaId, {
        id: partidaId,
        jogadores: dados.jogadores || [],
        modo: dados.modo || "Misto",
        valor: dados.valor || "R$ 10",
        aceitou: [],
        status: "Aguardando Aceitação",
        mediadorId: null,
        sala: null,
        senha: null
    });
    return partidas.get(partidaId);
}

function aceitarPartida(partidaId, userId) {
    const partida = partidas.get(partidaId);
    if (!partida) return 0;
    if (!partida.aceitou.includes(userId)) {
        partida.aceitou.push(userId);
    }
    return partida.aceitou.length;
}

function todosAceitaram(partidaId) {
    const partida = partidas.get(partidaId);
    return partida ? partida.aceitou.length >= 2 : false;
}

function pegarPartida(partidaId) {
    return partidas.get(partidaId) || null;
}

function definirMediador(partidaId, mediadorId) {
    const partida = partidas.get(partidaId);
    if (partida) partida.mediadorId = mediadorId;
}

module.exports = {
    criarPartida,
    aceitarPartida,
    todosAceitaram,
    pegarPartida,
    definirMediador
};