const conviteMediador = require("../embeds/conviteMediador");

/**
 * Envia a notificação da partida no canal de mediadores
 * @param {import('discord.js').Guild} guild 
 * @param {Object} partida 
 * @returns {Promise<boolean>}
 */
async function enviarMediador(guild, partida) {
    const CANAL_MEDIADOR_ID = "1532001733750952135";

    try {
        // Tenta buscar no cache; se não achar, faz a busca na API
        let canalMediador = guild.channels.cache.get(CANAL_MEDIADOR_ID);
        if (!canalMediador) {
            canalMediador = await guild.channels.fetch(CANAL_MEDIADOR_ID).catch(() => null);
        }

        if (!canalMediador) {
            console.error(`❌ Canal de mediadores ID ${CANAL_MEDIADOR_ID} não encontrado ou sem permissão de acesso.`);
            return false;
        }

        if (canalMediador.isTextBased()) {
            const payload = conviteMediador(partida);
            await canalMediador.send(payload);
            return true;
        } else {
            console.warn(`⚠️ Canal (${CANAL_MEDIADOR_ID}) não é um canal de texto válido.`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao enviar convite no canal dos mediadores:`, error);
        return false;
    }
}

module.exports = enviarMediador;