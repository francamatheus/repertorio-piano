'use strict';

const { removerAcentos, slugify, filtrar } = require('../js/app.utils');

// ── Catálogo de exemplo ───────────────────────────────────────────────────────

const CATALOGO = [
    {
        id: '1',
        titulo: 'Coração Igual Ao Teu',
        artista: 'Diante do Trono',
        genero: 'Gospel',
        dificuldade: 'Iniciante',
        tipo: 'Cifra',
    },
    {
        id: '2',
        titulo: 'November Rain',
        artista: "Guns N' Roses",
        genero: 'Rock',
        dificuldade: 'Avançado',
        tipo: 'Cifra',
    },
    {
        id: '3',
        titulo: 'Take Me Home, Country Roads',
        artista: 'John Denver',
        genero: 'Country',
        dificuldade: 'Iniciante',
        tipo: 'Cifra',
    },
    {
        id: '4',
        titulo: 'Invenção em Dó Maior',
        compositor: 'Bach',
        genero: 'Clássico',
        dificuldade: 'Intermediário',
        tipo: 'Partitura',
    },
];

const filtrosVazios = { tipo: '', genero: '', dificuldade: '', busca: '' };


// ── removerAcentos ─────────────────────────────────────────────────────────────

describe('removerAcentos', () => {
    test('remove acentos básicos', () => {
        expect(removerAcentos('Coração')).toBe('Coracao');
    });

    test('remove cedilha', () => {
        expect(removerAcentos('Canção')).toBe('Cancao');
    });

    test('string sem acentos permanece igual', () => {
        expect(removerAcentos('hello world')).toBe('hello world');
    });

    test('string vazia retorna vazia', () => {
        expect(removerAcentos('')).toBe('');
    });

    test('mantém números e símbolos', () => {
        expect(removerAcentos('Música 123!')).toBe('Musica 123!');
    });
});


// ── slugify ────────────────────────────────────────────────────────────────────

describe('slugify', () => {
    test('converte para minúsculas', () => {
        expect(slugify('Free Bird')).toBe('free-bird');
    });

    test('remove acentos e usa hífen', () => {
        expect(slugify('Coração Igual Ao Teu')).toBe('coracao-igual-ao-teu');
    });

    test('remove caracteres especiais', () => {
        expect(slugify("Guns N' Roses")).toBe('guns-n-roses');
    });

    test('não começa nem termina com hífen', () => {
        expect(slugify('  hello world  ')).toBe('hello-world');
    });

    test('múltiplos separadores viram um só hífen', () => {
        expect(slugify('um---dois')).toBe('um-dois');
    });
});


// ── filtrar ────────────────────────────────────────────────────────────────────

describe('filtrar — sem filtros', () => {
    test('retorna todos os itens com filtros vazios', () => {
        expect(filtrar(CATALOGO, filtrosVazios)).toHaveLength(4);
    });

    test('catálogo vazio retorna array vazio', () => {
        expect(filtrar([], filtrosVazios)).toHaveLength(0);
    });
});

describe('filtrar — por tipo', () => {
    test('filtra só Cifras', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, tipo: 'Cifra' });
        expect(result).toHaveLength(3);
        result.forEach(item => expect(item.tipo).toBe('Cifra'));
    });

    test('filtra só Partituras', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, tipo: 'Partitura' });
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Invenção em Dó Maior');
    });

    test('tipo inexistente retorna array vazio', () => {
        expect(filtrar(CATALOGO, { ...filtrosVazios, tipo: 'Video' })).toHaveLength(0);
    });
});

describe('filtrar — por gênero', () => {
    test('filtra Gospel', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, genero: 'Gospel' });
        expect(result).toHaveLength(1);
        expect(result[0].artista).toBe('Diante do Trono');
    });

    test('filtra Rock', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, genero: 'Rock' });
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('November Rain');
    });

    test('gênero sem correspondência retorna vazio', () => {
        expect(filtrar(CATALOGO, { ...filtrosVazios, genero: 'Funk' })).toHaveLength(0);
    });
});

describe('filtrar — por dificuldade', () => {
    test('filtra Iniciante', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, dificuldade: 'Iniciante' });
        expect(result).toHaveLength(2);
    });

    test('filtra Avançado', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, dificuldade: 'Avançado' });
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('November Rain');
    });
});

describe('filtrar — por busca (accent-insensitive)', () => {
    test('busca por título com acento', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, busca: 'coracao' });
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('Coração Igual Ao Teu');
    });

    test('busca por título sem acento', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, busca: 'Coração' });
        expect(result).toHaveLength(1);
    });

    test('busca por artista', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, busca: 'diante' });
        expect(result).toHaveLength(1);
        expect(result[0].artista).toBe('Diante do Trono');
    });

    test('busca por compositor (campo alternativo)', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, busca: 'bach' });
        expect(result).toHaveLength(1);
        expect(result[0].compositor).toBe('Bach');
    });

    test('busca parcial funciona', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, busca: 'rain' });
        expect(result).toHaveLength(1);
        expect(result[0].titulo).toBe('November Rain');
    });

    test('busca sem resultado retorna vazio', () => {
        expect(filtrar(CATALOGO, { ...filtrosVazios, busca: 'xyz123' })).toHaveLength(0);
    });
});

describe('filtrar — combinação de filtros', () => {
    test('tipo + dificuldade', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, tipo: 'Cifra', dificuldade: 'Iniciante' });
        expect(result).toHaveLength(2);
    });

    test('gênero + busca', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, genero: 'Rock', busca: 'november' });
        expect(result).toHaveLength(1);
    });

    test('filtros conflitantes retornam vazio', () => {
        const result = filtrar(CATALOGO, { ...filtrosVazios, genero: 'Gospel', dificuldade: 'Avançado' });
        expect(result).toHaveLength(0);
    });
});
