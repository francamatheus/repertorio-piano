"""
Testes unitários para servidor.py
- Scraping: extrair_cifraclub, extrair_bananacifras
- Detecção: gênero (breadcrumb + keyword), dificuldade
- Utilidades: slugify, verificar_duplicata, calcular_similaridade
"""

import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
from bs4 import BeautifulSoup

# Adiciona a raiz do projeto ao path para importar servidor.py
sys.path.insert(0, str(Path(__file__).parent.parent))
import servidor

FIXTURES = Path(__file__).parent / "fixtures"


# ── Helpers ──────────────────────────────────────────────────────────────────

def carregar_fixture(nome):
    with open(FIXTURES / nome, encoding="utf-8") as f:
        return f.read()

def soup_de(nome):
    return BeautifulSoup(carregar_fixture(nome), "html.parser")


# ── extrair_cifraclub ─────────────────────────────────────────────────────────

class TestExtrairCifraClub:
    def test_titulo(self):
        soup = soup_de("cifraclub_coracao.html")
        titulo, _, _ = servidor.extrair_cifraclub(soup, "https://www.cifraclub.com.br/diante-do-trono/coracao-igual-ao-teu/")
        assert titulo == "Coração Igual Ao Teu"

    def test_artista(self):
        soup = soup_de("cifraclub_coracao.html")
        _, artista, _ = servidor.extrair_cifraclub(soup, "https://www.cifraclub.com.br/diante-do-trono/coracao-igual-ao-teu/")
        assert artista == "Diante do Trono"

    def test_cifra_encontrada(self):
        soup = soup_de("cifraclub_coracao.html")
        _, _, cifra_html = servidor.extrair_cifraclub(soup, "https://www.cifraclub.com.br/diante-do-trono/coracao-igual-ao-teu/")
        assert "Cifra não encontrada" not in cifra_html

    def test_tempo_perdido_titulo(self):
        soup = soup_de("cifraclub_tempo_perdido.html")
        titulo, _, _ = servidor.extrair_cifraclub(soup, "https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/")
        assert "Tempo Perdido" in titulo

    def test_tempo_perdido_artista(self):
        soup = soup_de("cifraclub_tempo_perdido.html")
        _, artista, _ = servidor.extrair_cifraclub(soup, "https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/")
        assert "Legião Urbana" in artista


# ── extrair_bananacifras ──────────────────────────────────────────────────────

class TestExtrairBananaCifras:
    def _mock_api(self, fixture_json):
        """Retorna um mock de requests.get que responde com o JSON da fixture."""
        api_data = json.loads(carregar_fixture(fixture_json))
        mock_resp = MagicMock()
        mock_resp.json.return_value = api_data
        return mock_resp

    def test_titulo_free_bird(self):
        soup = soup_de("bananacifras_free_bird.html")
        mock_resp = self._mock_api("bananacifras_api_free_bird.json")
        with patch("servidor.requests.get", return_value=mock_resp):
            titulo, _, _ = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/l/lynyrd-skynyrd/free-bird")
        assert titulo.lower() == "free bird"

    def test_artista_free_bird(self):
        soup = soup_de("bananacifras_free_bird.html")
        mock_resp = self._mock_api("bananacifras_api_free_bird.json")
        with patch("servidor.requests.get", return_value=mock_resp):
            _, artista, _ = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/l/lynyrd-skynyrd/free-bird")
        assert "Lynyrd Skynyrd" in artista

    def test_cifra_encontrada_free_bird(self):
        soup = soup_de("bananacifras_free_bird.html")
        mock_resp = self._mock_api("bananacifras_api_free_bird.json")
        with patch("servidor.requests.get", return_value=mock_resp):
            _, _, cifra_html = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/l/lynyrd-skynyrd/free-bird")
        assert "Cifra não encontrada" not in cifra_html

    def test_titulo_the_scientist(self):
        soup = soup_de("bananacifras_the_scientist.html")
        mock_resp = self._mock_api("bananacifras_api_the_scientist.json")
        with patch("servidor.requests.get", return_value=mock_resp):
            titulo, _, _ = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/c/coldplay/the-scientist")
        assert "scientist" in titulo.lower()

    def test_artista_the_scientist(self):
        soup = soup_de("bananacifras_the_scientist.html")
        mock_resp = self._mock_api("bananacifras_api_the_scientist.json")
        with patch("servidor.requests.get", return_value=mock_resp):
            _, artista, _ = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/c/coldplay/the-scientist")
        assert "Coldplay" in artista

    def test_tab_js_nao_encontrado(self):
        """Sem tag tab.js no HTML, retorna cifra não encontrada."""
        soup = BeautifulSoup("<html><head><title>Teste</title></head><body></body></html>", "html.parser")
        titulo, artista, cifra_html = servidor.extrair_bananacifras(soup, "https://www.bananacifras.com/teclado/x/artista/musica")
        assert "Cifra não encontrada" in cifra_html


# ── extrair_genero_cifraclub ──────────────────────────────────────────────────

class TestExtrairGeneroCifraclub:
    def test_gospel(self):
        soup = soup_de("cifraclub_coracao.html")
        genero = servidor.extrair_genero_cifraclub(soup)
        assert genero == "Gospel"

    def test_rock(self):
        soup = soup_de("cifraclub_tempo_perdido.html")
        genero = servidor.extrair_genero_cifraclub(soup)
        assert genero == "Rock"

    def test_sem_breadcrumb(self):
        soup = BeautifulSoup("<html><body><p>Sem breadcrumb</p></body></html>", "html.parser")
        genero = servidor.extrair_genero_cifraclub(soup)
        assert genero is None

    def test_breadcrumb_genero_desconhecido(self):
        html = "<html><body><ol><li>Página Inicial►Genero Desconhecido►Artista►Musica</li></ol></body></html>"
        soup = BeautifulSoup(html, "html.parser")
        genero = servidor.extrair_genero_cifraclub(soup)
        assert genero is None


# ── detectar_genero_cifra ─────────────────────────────────────────────────────

class TestDetectarGeneroCifra:
    def test_gospel_por_artista(self):
        assert servidor.detectar_genero_cifra("Oceans", "Hillsong") == "Gospel"

    def test_rock_por_artista(self):
        assert servidor.detectar_genero_cifra("Free Bird", "Lynyrd Skynyrd") == "Rock"

    def test_mpb_por_artista(self):
        assert servidor.detectar_genero_cifra("Construção", "Chico Buarque") == "MPB"

    def test_retorna_none_desconhecido(self):
        assert servidor.detectar_genero_cifra("Musica Aleatoria", "Artista Desconhecido") is None

    def test_gospel_por_tags(self):
        assert servidor.detectar_genero_cifra("Musica", "Artista", ["gospel", "adoração"]) == "Gospel"


# ── detectar_dificuldade_cifra ────────────────────────────────────────────────

class TestDetectarDificuldadeCifra:
    def test_iniciante_acordes_simples(self):
        cifra = "C G Am F\nC G Am F"
        dific, detalhes = servidor.detectar_dificuldade_cifra(cifra)
        assert dific == "Iniciante"
        assert detalhes["simples"] >= 3

    def test_intermediario(self):
        cifra = "Am7 Dm7 G7M Cmaj7 Em7 Fm Bb Eb Am"
        dific, _ = servidor.detectar_dificuldade_cifra(cifra)
        assert dific in ("Intermediário", "Avançado")

    def test_sem_acordes_retorna_iniciante(self):
        dific, detalhes = servidor.detectar_dificuldade_cifra("apenas texto sem acordes aqui mesmo")
        assert dific == "Iniciante"

    def test_capo_detectado(self):
        cifra = "Capo 3\nC G Am F"
        _, detalhes = servidor.detectar_dificuldade_cifra(cifra)
        assert detalhes["tem_capo"] is True

    def test_sem_capo(self):
        cifra = "C G Am F"
        _, detalhes = servidor.detectar_dificuldade_cifra(cifra)
        assert detalhes["tem_capo"] is False


# ── slugify ───────────────────────────────────────────────────────────────────

class TestSlugify:
    def test_basico(self):
        assert servidor.slugify("Free Bird") == "free-bird"

    def test_acentos(self):
        assert servidor.slugify("Coração Igual Ao Teu") == "coracao-igual-ao-teu"

    def test_caracteres_especiais(self):
        assert servidor.slugify("Rock & Roll!") == "rock-roll"

    def test_espacos_multiplos(self):
        assert servidor.slugify("  um   dois  ") == "um-dois"

    def test_ja_slug(self):
        assert servidor.slugify("already-a-slug") == "already-a-slug"


# ── calcular_similaridade ─────────────────────────────────────────────────────

class TestCalcularSimilaridade:
    def test_textos_identicos(self):
        assert servidor.calcular_similaridade("hello world", "hello world") == 1.0

    def test_textos_completamente_diferentes(self):
        sim = servidor.calcular_similaridade("abcdef", "ghijkl")
        assert sim == 0.0

    def test_textos_similares(self):
        sim = servidor.calcular_similaridade("coração igual ao teu", "coracao igual ao teu")
        assert sim > 0.7

    def test_texto_vazio(self):
        assert servidor.calcular_similaridade("", "hello") == 0.0


# ── verificar_duplicata ───────────────────────────────────────────────────────

class TestVerificarDuplicata:
    CATALOGO = [
        {
            "id": "abc123",
            "titulo": "Coração Igual Ao Teu",
            "artista": "Diante do Trono",
            "tipo": "Cifra",
            "dificuldade": "Iniciante",
            "arquivo": None,
        }
    ]

    def test_duplicata_exata(self):
        result = servidor.verificar_duplicata(
            self.CATALOGO, "Coração Igual Ao Teu", "Diante do Trono", "Cifra"
        )
        assert result["duplicata"] is True
        assert result["confianca"] == 1.0

    def test_sem_duplicata(self):
        result = servidor.verificar_duplicata(
            self.CATALOGO, "November Rain", "Guns N' Roses", "Cifra"
        )
        assert result["duplicata"] is False

    def test_titulo_similar(self):
        result = servidor.verificar_duplicata(
            self.CATALOGO, "Coracao Igual Ao Teu", "Diante do Trono", "Cifra"
        )
        assert result["duplicata"] is True

    def test_catalogo_vazio(self):
        result = servidor.verificar_duplicata([], "Qualquer Titulo", "Artista", "Cifra")
        assert result["duplicata"] is False
