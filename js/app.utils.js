/**
 * Funções puras extraídas de app.js — sem dependência de DOM.
 * Importadas tanto pelo app.js (browser) quanto pelos testes Jest (Node).
 */

function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(text) {
    return removerAcentos(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function filtrar(catalogo, filtros) {
    const busca = removerAcentos((filtros.busca || '').toLowerCase());
    return catalogo.filter(item => {
        if (filtros.tipo && item.tipo !== filtros.tipo) return false;
        if (filtros.genero && item.genero !== filtros.genero) return false;
        if (filtros.dificuldade && item.dificuldade !== filtros.dificuldade) return false;
        if (busca) {
            const titulo = removerAcentos((item.titulo || '').toLowerCase());
            const artista = removerAcentos((item.artista || item.compositor || '').toLowerCase());
            if (!titulo.includes(busca) && !artista.includes(busca)) return false;
        }
        return true;
    });
}

if (typeof module !== 'undefined') {
    module.exports = { removerAcentos, slugify, filtrar };
}
