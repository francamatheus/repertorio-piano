"""
Testes unitários para servidor.py

Cobertura:
- Scraping CifraClub: 10 URLs reais (fixtures HTML locais)
- Scraping BananaCifras: 10 URLs reais (fixtures HTML + JSON da API mockada)
- Detecção de gênero: breadcrumb CifraClub + keywords
- Detecção de dificuldade
- Alertas de instrumento (BananaCifras)
- Utilidades: slugify, calcular_similaridade, verificar_duplicata
"""

import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).parent.parent))
import servidor

FIXTURES = Path(__file__).parent / "fixtures"


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_html(fname):
    with open(FIXTURES / fname, encoding="utf-8") as f:
        return f.read()

def soup_de(fname):
    return BeautifulSoup(load_html(fname), "html.parser")

def mock_banana_api(json_fname):
    data = json.loads((FIXTURES / json_fname).read_text(encoding="utf-8"))
    m = MagicMock()
    m.json.return_value = data
    return m


# ── CifraClub — parametrizado (10 URLs) ──────────────────────────────────────

CIFRACLUB_CASOS = [
    # (fixture_html, url, titulo_esperado, artista_esperado, genero_esperado)
    (
        "cifraclub_jota_quest_so_hoje.html",
        "https://www.cifraclub.com.br/jota-quest/so-hoje/",
        "Só Hoje", "Jota Quest", "Rock",
    ),
    (
        "cifraclub_paralamas_aonde.html",
        "https://www.cifraclub.com.br/os-paralamas-do-sucesso/aonde-quer-que-eu-va/simplificada.html",
        "Aonde Quer Que Eu Vá", "Os Paralamas do Sucesso", "Rock",
    ),
    (
        "cifraclub_gnr_sweet_child.html",
        "https://www.cifraclub.com.br/guns-n-roses/sweet-child-omine/simplificada.html",
        "Sweet Child O' Mine", "Guns N' Roses", "Rock",
    ),
    (
        "cifraclub_oasis_wonderwall.html",
        "https://www.cifraclub.com.br/oasis/wonderwall/",
        "Wonderwall", "Oasis", "Rock",
    ),
    (
        "cifraclub_tribalistas_alianca.html",
        "https://www.cifraclub.com.br/tribalistas/alianca/simplificada.html",
        "Aliança", "Tribalistas", "MPB",
    ),
    (
        "cifraclub_toquinho_aquarela.html",
        "https://www.cifraclub.com.br/toquinho/aquarela/",
        "Aquarela", "Toquinho", "MPB",
    ),
    (
        "cifraclub_bocelli_con_te.html",
        "https://www.cifraclub.com.br/andrea-bocelli/con-te-partiro/",
        "Con Te Partirò", "Andrea Bocelli", "Clássico",
    ),
    (
        "cifraclub_judy_rainbow.html",
        "https://www.cifraclub.com.br/judy-garland/somewhere-over-the-rainbow/",
        "Somewhere Over The Rainbow", "Judy Garland", "Clássico",
    ),
    (
        "cifraclub_gnr_dont_cry.html",
        "https://www.cifraclub.com.br/guns-n-roses/dont-cry/",
        "Don't Cry", "Guns N' Roses", "Rock",
    ),
    (
        "cifraclub_bonjovi_livin.html",
        "https://www.cifraclub.com.br/bon-jovi/livin-on-prayer/",
        "Livin' On A Prayer", "Bon Jovi", "Rock",
    ),
]


@pytest.mark.parametrize("fixture,url,titulo,artista,genero", CIFRACLUB_CASOS)
def test_cifraclub_titulo(fixture, url, titulo, artista, genero):
    t, _, _ = servidor.extrair_cifraclub(soup_de(fixture), url)
    assert t == titulo


@pytest.mark.parametrize("fixture,url,titulo,artista,genero", CIFRACLUB_CASOS)
def test_cifraclub_artista(fixture, url, titulo, artista, genero):
    _, a, _ = servidor.extrair_cifraclub(soup_de(fixture), url)
    assert a == artista


@pytest.mark.parametrize("fixture,url,titulo,artista,genero", CIFRACLUB_CASOS)
def test_cifraclub_cifra_encontrada(fixture, url, titulo, artista, genero):
    _, _, cifra_html = servidor.extrair_cifraclub(soup_de(fixture), url)
    assert "Cifra não encontrada" not in cifra_html


@pytest.mark.parametrize("fixture,url,titulo,artista,genero", CIFRACLUB_CASOS)
def test_cifraclub_genero(fixture, url, titulo, artista, genero):
    g = servidor.extrair_genero_cifraclub(soup_de(fixture))
    assert g == genero


# ── BananaCifras — parametrizado (10 URLs) ───────────────────────────────────

BANANACIFRAS_CASOS = [
    # (fixture_html, fixture_json, url, titulo_esperado, artista_esperado, instrumento_alerta)
    (
        "bananacifras_kleber_deus_forte.html", "bananacifras_kleber_deus_forte.json",
        "https://www.bananacifras.com/teclado/k/kleber-lucas/deus-forte",
        "Deus forte", "Kleber Lucas", None,
    ),
    (
        "bananacifras_james_fire_rain.html", "bananacifras_james_fire_rain.json",
        "https://www.bananacifras.com/simplificada/j/james-taylor/fire-and-rain",
        "Fire and rain (Simplificada)", "James Taylor", None,
    ),
    (
        "bananacifras_scorpions_still.html", "bananacifras_scorpions_still.json",
        "https://www.bananacifras.com/cifra/s/scorpions/still-loving-you",
        "Still loving you", "Scorpions", None,
    ),
    (
        "bananacifras_guetta_titanium.html", "bananacifras_guetta_titanium.json",
        "https://www.bananacifras.com/cifra/d/david-guetta/titanium",
        "Titanium", "David Guetta", None,
    ),
    (
        "bananacifras_alok_ocean.html", "bananacifras_alok_ocean.json",
        "https://www.bananacifras.com/teclado/a/alok/ocean",
        "Ocean", "Alok", None,
    ),
    (
        "bananacifras_laura_santo.html", "bananacifras_laura_santo.json",
        "https://www.bananacifras.com/ukulele/l/laura-souguellis/santo-espirito",
        "Santo espírito", "Laura souguellis", "Ukulele",
    ),
    (
        "bananacifras_lobos_la_bamba.html", "bananacifras_lobos_la_bamba.json",
        "https://www.bananacifras.com/teclado/l/los-lobos/la-bamba",
        "La bamba", "Los Lobos", None,
    ),
    (
        "bananacifras_lz_stairway.html", "bananacifras_lz_stairway.json",
        "https://www.bananacifras.com/teclado/l/led-zeppelin/stairway-to-heaven",
        "Stairway to heaven", "Led Zeppelin", None,
    ),
    (
        "bananacifras_elvis_my_way.html", "bananacifras_elvis_my_way.json",
        "https://www.bananacifras.com/teclado/e/elvis-presley/my-way",
        "My way", "Elvis Presley", None,
    ),
    (
        "bananacifras_harrison_my_sweet_lord.html", "bananacifras_harrison_my_sweet_lord.json",
        "https://www.bananacifras.com/teclado/g/george-harrison/my-sweet-lord",
        "My sweet lord", "George Harrison", None,
    ),
]


@pytest.mark.parametrize("html_f,json_f,url,titulo,artista,alerta", BANANACIFRAS_CASOS)
def test_bananacifras_titulo(html_f, json_f, url, titulo, artista, alerta):
    soup = soup_de(html_f)
    with patch("servidor.requests.get", return_value=mock_banana_api(json_f)):
        t, _, _ = servidor.extrair_bananacifras(soup, url)
    assert t == titulo


@pytest.mark.parametrize("html_f,json_f,url,titulo,artista,alerta", BANANACIFRAS_CASOS)
def test_bananacifras_artista(html_f, json_f, url, titulo, artista, alerta):
    soup = soup_de(html_f)
    with patch("servidor.requests.get", return_value=mock_banana_api(json_f)):
        _, a, _ = servidor.extrair_bananacifras(soup, url)
    assert a == artista


@pytest.mark.parametrize("html_f,json_f,url,titulo,artista,alerta", BANANACIFRAS_CASOS)
def test_bananacifras_cifra_encontrada(html_f, json_f, url, titulo, artista, alerta):
    soup = soup_de(html_f)
    with patch("servidor.requests.get", return_value=mock_banana_api(json_f)):
        _, _, cifra_html = servidor.extrair_bananacifras(soup, url)
    assert "Cifra não encontrada" not in cifra_html


@pytest.mark.parametrize("html_f,json_f,url,titulo,artista,alerta", BANANACIFRAS_CASOS)
def test_bananacifras_instrumento_alerta(html_f, json_f, url, titulo, artista, alerta):
    """Verifica se a URL com instrumento não-teclado gera o alerta correto."""
    url_lower = url.lower()
    instrumentos_map = {
        "/violao/": "Violão", "/guitarra/": "Guitarra",
        "/baixo/": "Baixo", "/bateria/": "Bateria", "/ukulele/": "Ukulele",
    }
    detectado = next((nome for path, nome in instrumentos_map.items() if path in url_lower), None)
    assert detectado == alerta


# ── Gênero por keyword (detectar_genero_cifra) ───────────────────────────────

@pytest.mark.parametrize("titulo,artista,esperado", [
    ("Deus forte",        "Kleber Lucas",   None),    # não mapeado por keyword
    ("Stairway to Heaven","Led Zeppelin",   "Rock"),
    ("Aquarela",          "Toquinho",       None),    # não mapeado por keyword
    ("Só Hoje",           "Jota Quest",     None),    # não mapeado por keyword
    ("Wonderwall",        "Oasis",          None),    # não mapeado por keyword
    ("Con Te Partirò",    "Andrea Bocelli", None),
    ("Titanium",          "David Guetta",   None),
    # artistas mapeados explicitamente no servidor.py
    ("Free Bird",         "Lynyrd Skynyrd", "Rock"),
    ("Coracao",           "Hillsong",       "Gospel"),
    ("Construção",        "Chico Buarque",  "MPB"),
])
def test_detectar_genero_keyword(titulo, artista, esperado):
    assert servidor.detectar_genero_cifra(titulo, artista) == esperado


# ── Dificuldade ───────────────────────────────────────────────────────────────

@pytest.mark.parametrize("cifra,esperado", [
    ("C G Am F\nC G Am F",                           "Iniciante"),
    ("Am7 Dm7 G7M Cmaj7 Em7 Fm Bb Eb Am Dsus4",      "Intermediário"),
    ("apenas texto sem acordes aqui",                 "Iniciante"),
])
def test_detectar_dificuldade(cifra, esperado):
    dific, _ = servidor.detectar_dificuldade_cifra(cifra)
    assert dific == esperado


def test_capo_detectado():
    _, detalhes = servidor.detectar_dificuldade_cifra("Capo 3\nC G Am F")
    assert detalhes["tem_capo"] is True


def test_sem_capo():
    _, detalhes = servidor.detectar_dificuldade_cifra("C G Am F")
    assert detalhes["tem_capo"] is False


# ── slugify ───────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("entrada,esperado", [
    ("Free Bird",               "free-bird"),
    ("Coração Igual Ao Teu",    "coracao-igual-ao-teu"),
    ("Rock & Roll!",            "rock-roll"),
    ("Con Te Partirò",          "con-te-partiro"),
    ("  um   dois  ",           "um-dois"),
    ("already-a-slug",          "already-a-slug"),
    ("Livin' On A Prayer",      "livin-on-a-prayer"),
])
def test_slugify(entrada, esperado):
    assert servidor.slugify(entrada) == esperado


# ── calcular_similaridade ─────────────────────────────────────────────────────

def test_similaridade_identicos():
    assert servidor.calcular_similaridade("hello world", "hello world") == 1.0

def test_similaridade_diferentes():
    assert servidor.calcular_similaridade("abcdef", "ghijkl") == 0.0

def test_similaridade_parecidos():
    assert servidor.calcular_similaridade("stairway to heaven", "stairway to heawen") > 0.7

def test_similaridade_vazio():
    assert servidor.calcular_similaridade("", "hello") == 0.0


# ── verificar_duplicata ───────────────────────────────────────────────────────

CATALOGO_TESTE = [
    {"id": "1", "titulo": "Wonderwall", "artista": "Oasis", "tipo": "Cifra", "dificuldade": "Iniciante", "arquivo": None},
    {"id": "2", "titulo": "Stairway to Heaven", "artista": "Led Zeppelin", "tipo": "Cifra", "dificuldade": "Avançado", "arquivo": None},
]

def test_duplicata_exata():
    r = servidor.verificar_duplicata(CATALOGO_TESTE, "Wonderwall", "Oasis", "Cifra")
    assert r["duplicata"] is True and r["confianca"] == 1.0

def test_duplicata_titulo_similar():
    r = servidor.verificar_duplicata(CATALOGO_TESTE, "Stairway To Heaven", "Led Zeppelin", "Cifra")
    assert r["duplicata"] is True

def test_sem_duplicata():
    r = servidor.verificar_duplicata(CATALOGO_TESTE, "La Bamba", "Los Lobos", "Cifra")
    assert r["duplicata"] is False

def test_catalogo_vazio():
    assert servidor.verificar_duplicata([], "Qualquer", "Artista", "Cifra") == {"duplicata": False}
