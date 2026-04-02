// ── Data Layer ──

let CATALOGO = [];

// ── Filtros (objetos com value/label para clareza no select) ──

const FILTROS = {
    tipo: {
        all: { value: '', label: '- Tipos -' },
        opcoes: [
            { value: 'Partitura', label: 'Partitura' },
            { value: 'Cifra', label: 'Cifra' },
        ],
    },
    genero: {
        all: { value: '', label: '- Gêneros -' },
        opcoes: [
            { value: 'Gospel', label: 'Gospel' },
            { value: 'Pop', label: 'Pop' },
            { value: 'Rock', label: 'Rock' },
            { value: 'MPB', label: 'MPB' },
            { value: 'Clássico', label: 'Clássico' },
            { value: 'Jazz', label: 'Jazz' },
            { value: 'Blues', label: 'Blues' },
            { value: 'Bossa Nova', label: 'Bossa Nova' },
            { value: 'Samba', label: 'Samba' },
            { value: 'Eletrônica', label: 'Eletrônica' },
            { value: 'Trilha Sonora', label: 'Trilha Sonora' },
            { value: 'Anime/Game', label: 'Anime/Game' },
            { value: 'R&B/Soul', label: 'R&B/Soul' },
            { value: 'Country/Sertanejo', label: 'Country/Sertanejo' },
            { value: 'Funk', label: 'Funk' },
            { value: 'Reggae', label: 'Reggae' },
            { value: 'Folk', label: 'Folk' },
            { value: 'Hip-Hop', label: 'Hip-Hop' },
            { value: 'Metal', label: 'Metal' },
            { value: 'Outro', label: 'Outro' },
        ],
    },
    dificuldade: {
        all: { value: '', label: '- Dificuldades -' },
        opcoes: [
            { value: 'Iniciante', label: 'Iniciante' },
            { value: 'Intermediário', label: 'Intermediário' },
            { value: 'Avançado', label: 'Avançado' },
        ],
    },
};

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
