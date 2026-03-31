// ── Data Layer ──

let CATALOGO = [];

const GENEROS = [
    'Todos', 'Gospel', 'Pop', 'Rock', 'MPB', 'Clássico', 'Jazz', 'Blues',
    'Bossa Nova', 'Samba', 'Eletrônica', 'Trilha Sonora', 'Anime/Game',
    'R&B/Soul', 'Country/Sertanejo', 'Funk', 'Reggae', 'Folk', 'Hip-Hop', 'Metal', 'Outro'
];
const DIFICULDADES = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];
const TIPOS = ['Todos', 'Partitura', 'Cifra'];

async function carregarCatalogo() {
    try {
        const resp = await fetch('catalogo.json');
        if (!resp.ok) throw new Error(resp.statusText);
        CATALOGO = await resp.json();
    } catch (e) {
        console.warn('Catálogo vazio ou não encontrado, usando array vazio.');
        CATALOGO = [];
    }
}
