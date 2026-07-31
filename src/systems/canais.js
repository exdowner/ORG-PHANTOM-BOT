const mapCanais = new Map();

function salvarCanal(partidaId, canalId) {
    mapCanais.set(partidaId, canalId);
}

function pegarCanal(partidaId) {
    return mapCanais.get(partidaId);
}

function pegarPartidaPorCanal(canalId) {
    for (const [partidaId, id] of mapCanais.entries()) {
        if (id === canalId) return partidaId;
    }
    return null;
}

module.exports = { salvarCanal, pegarCanal, pegarPartidaPorCanal };