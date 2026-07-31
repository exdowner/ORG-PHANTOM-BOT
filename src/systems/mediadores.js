const mediadoresOcupados = new Set();

function assumirPartida(mediadorId) {
    mediadoresOcupados.add(mediadorId);
}

function liberarMediador(mediadorId) {
    mediadoresOcupados.delete(mediadorId);
}

function estaDisponivel(mediadorId) {
    return !mediadoresOcupados.has(mediadorId);
}

module.exports = { assumirPartida, liberarMediador, estaDisponivel };