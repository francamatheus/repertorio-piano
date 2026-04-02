// ── Helpers ──

function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text) e.textContent = text;
    return e;
}

function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(text) {
    return removerAcentos(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Navigation (SPA com telas) ──

let telaAtual = 'catalogo';

function navegarPara(tela, dados) {
    document.querySelectorAll('.tela').forEach(t => t.classList.add('hidden'));
    const secao = document.getElementById(`tela-${tela}`);
    if (secao) {
        secao.classList.remove('hidden');
        telaAtual = tela;
    }
    window.scrollTo(0, 0);

    if (tela === 'catalogo') {
        renderCards(filtrar(CATALOGO, getFiltrosAtuais()));
    }
}

// ── Filtering ──

function getFiltrosAtuais() {
    return {
        tipo: document.getElementById('filtro-tipo')?.value || '',
        genero: document.getElementById('filtro-genero')?.value || '',
        dificuldade: document.getElementById('filtro-dificuldade')?.value || '',
        busca: document.getElementById('filtro-busca')?.value || '',
    };
}

function filtrar(catalogo, filtros) {
    const busca = removerAcentos(filtros.busca.toLowerCase());
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

// ── Filter Rendering ──

function criarSelect(id, ariaLabel, filtro) {
    const select = el('select');
    select.id = id;
    select.setAttribute('aria-label', ariaLabel);

    // Opção "All" com label descritivo (ex: "Todos os Gêneros")
    const allOption = el('option', null, filtro.all.label);
    allOption.value = filtro.all.value;
    select.appendChild(allOption);

    // Opções individuais
    filtro.opcoes.forEach(op => {
        const option = el('option', null, op.label);
        option.value = op.value;
        select.appendChild(option);
    });

    return select;
}

let debounceTimer = null;

function renderFiltros() {
    const nav = document.getElementById('filters');
    nav.innerHTML = '';

    const selectTipo = criarSelect('filtro-tipo', 'Filtrar por tipo', FILTROS.tipo);
    const selectGenero = criarSelect('filtro-genero', 'Filtrar por gênero', FILTROS.genero);
    const selectDific = criarSelect('filtro-dificuldade', 'Filtrar por dificuldade', FILTROS.dificuldade);

    const inputBusca = el('input');
    inputBusca.type = 'search';
    inputBusca.id = 'filtro-busca';
    inputBusca.placeholder = 'Buscar por título ou artista...';
    inputBusca.setAttribute('aria-label', 'Buscar músicas');

    // Botão de importar
    const btnImportar = el('button', 'btn-importar', '+ Importar');
    btnImportar.addEventListener('click', () => navegarPara('importar'));

    const atualizar = () => renderCards(filtrar(CATALOGO, getFiltrosAtuais()));

    selectTipo.addEventListener('change', atualizar);
    selectGenero.addEventListener('change', atualizar);
    selectDific.addEventListener('change', atualizar);
    inputBusca.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(atualizar, 200);
    });

    nav.appendChild(selectTipo);
    nav.appendChild(selectGenero);
    nav.appendChild(selectDific);
    nav.appendChild(inputBusca);
    nav.appendChild(btnImportar);
}

// ── Card Rendering ──

function criarCard(item) {
    const card = el('div', 'card');

    const titulo = el('div', 'card-title', item.titulo);
    const subtitulo = el('div', 'card-subtitle', item.artista || item.compositor || '');

    const badges = el('div', 'card-badges');
    badges.appendChild(el('span', 'badge badge-tipo', item.tipo));
    if (item.dificuldade) badges.appendChild(el('span', 'badge badge-dificuldade', item.dificuldade));
    if (item.genero) badges.appendChild(el('span', 'badge badge-genero', item.genero));
    if (item.tags) {
        item.tags.forEach(tag => badges.appendChild(el('span', 'badge badge-tag', tag)));
    }

    card.appendChild(titulo);
    card.appendChild(subtitulo);
    card.appendChild(badges);

    card.addEventListener('click', () => {
        if (item.tipo === 'Partitura') {
            abrirViewer(item);
        } else if (item.tipo === 'Cifra') {
            abrirCifra(item);
        }
    });

    return card;
}

function renderCards(items) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (items.length === 0) {
        if (CATALOGO.length === 0) {
            const empty = el('div', 'empty-state');
            empty.innerHTML = 'Nenhuma música no catálogo.<br>Clique em <strong>+ Importar</strong> para começar.';
            app.appendChild(empty);
        } else {
            app.appendChild(el('p', 'empty-state', 'Nenhuma música encontrada com esses filtros.'));
        }
        return;
    }

    const stats = el('p', 'stats', `${items.length} de ${CATALOGO.length} música${CATALOGO.length !== 1 ? 's' : ''}`);
    app.appendChild(stats);

    const grid = el('div', 'card-grid');
    items.forEach(item => grid.appendChild(criarCard(item)));
    app.appendChild(grid);
}

// ── Tela: Viewer (Partitura) ──

let viewerState = { imagens: [], pagina: 0, zoom: 1 };

function abrirViewer(item) {
    viewerState = { imagens: item.imagens || [], pagina: 0, zoom: 1 };
    document.getElementById('viewer-titulo').textContent = item.titulo;
    atualizarViewer();
    navegarPara('viewer');
}

function atualizarViewer() {
    const img = document.getElementById('viewer-img');
    const pag = document.getElementById('viewer-pagina');
    const zoom = document.getElementById('zoom-level');

    if (viewerState.imagens.length > 0) {
        img.src = viewerState.imagens[viewerState.pagina];
        img.style.transform = `scale(${viewerState.zoom})`;
        img.style.transformOrigin = 'top center';
        pag.textContent = `${viewerState.pagina + 1} / ${viewerState.imagens.length}`;
    }
    zoom.textContent = `${Math.round(viewerState.zoom * 100)}%`;
}

function navegarPagina(delta) {
    const nova = viewerState.pagina + delta;
    if (nova >= 0 && nova < viewerState.imagens.length) {
        viewerState.pagina = nova;
        viewerState.zoom = 1;
        atualizarViewer();
    }
}

function aplicarZoom(delta) {
    const novo = viewerState.zoom + delta;
    if (novo >= 0.3 && novo <= 3) {
        viewerState.zoom = novo;
        atualizarViewer();
    }
}

// ── Tela: Cifra ──

async function abrirCifra(item) {
    document.getElementById('cifra-titulo').textContent = item.titulo;
    const body = document.getElementById('cifra-body');

    try {
        const resp = await fetch(item.arquivo);
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        body.innerHTML = doc.body.innerHTML;
    } catch (e) {
        body.innerHTML = `<p class="empty-state">Erro ao carregar cifra: ${e.message}</p>`;
    }

    navegarPara('cifra');
}

// ── Tela: Importar ──

function initImportTabs() {
    document.querySelectorAll('.import-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById('form-cifra').classList.toggle('hidden', target !== 'cifra');
            document.getElementById('form-pdf').classList.toggle('hidden', target !== 'pdf');
        });
    });
}

function initAnalisarCifra() {
    const btn = document.getElementById('btn-analisar');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const url = document.getElementById('cifra-url').value.trim();
        const resultado = document.getElementById('analise-resultado');

        if (!url) {
            resultado.innerHTML = '<p class="analise-erro">Informe a URL da cifra.</p>';
            resultado.classList.remove('hidden');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Analisando...';
        resultado.innerHTML = '<p class="analise-loading">Analisando cifra...</p>';
        resultado.classList.remove('hidden');

        try {
            const resp = await fetch('/api/analisar-cifra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await resp.json();

            if (data.ok) {
                let html = `<div class="analise-info">`;
                if (data.scraping_incompleto) {
                    html += `<p class="analise-aviso">Scraping incompleto — preencha título e artista manualmente nos campos abaixo.</p>`;
                }
                if (data.titulo || data.artista) {
                    html += `<p><strong>${data.titulo || '(sem título)'}</strong> — ${data.artista || '(sem artista)'}</p>`;
                }
                html += `<p>Dificuldade sugerida: <span class="badge badge-dificuldade">${data.dificuldade_sugerida}</span>`;
                if (data.detalhes_dificuldade) {
                    const d = data.detalhes_dificuldade;
                    html += ` <small>(${d.acordes_total} acordes: ${d.simples} simples, ${d.intermediarios} interm., ${d.avancados} avanç.)</small>`;
                }
                html += `</p>`;
                if (data.genero_sugerido) {
                    html += `<p>Gênero sugerido: <span class="badge badge-genero">${data.genero_sugerido}</span></p>`;
                }

                if (data.duplicata && data.duplicata.duplicata) {
                    const dup = data.duplicata;
                    html += `<div class="analise-aviso">`;
                    html += `<strong>Possível duplicata!</strong> ${dup.motivo}<br>`;
                    html += `Existente: "${dup.item_existente.titulo}" (${dup.item_existente.tipo}, ${dup.item_existente.dificuldade})`;
                    html += `</div>`;
                }

                html += `</div>`;
                resultado.innerHTML = html;

                // Preencher campos com sugestões
                if (data.titulo) {
                    document.getElementById('cifra-titulo').value = data.titulo;
                }
                if (data.artista) {
                    document.getElementById('cifra-artista').value = data.artista;
                }
                if (data.dificuldade_sugerida) {
                    document.getElementById('cifra-dificuldade').value = data.dificuldade_sugerida;
                }
                if (data.genero_sugerido) {
                    document.getElementById('cifra-genero').value = data.genero_sugerido;
                }
            } else {
                resultado.innerHTML = `<p class="analise-erro">Erro: ${data.erro}</p>`;
            }
        } catch (err) {
            resultado.innerHTML = `<p class="analise-erro">Servidor não encontrado. Execute: <code>python3 servidor.py</code></p>`;
        }

        btn.disabled = false;
        btn.textContent = 'Analisar';
    });
}

function initFormCifra() {
    initAnalisarCifra();

    document.getElementById('form-cifra').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('cifra-status');
        const url = document.getElementById('cifra-url').value.trim();
        const titulo = document.getElementById('cifra-titulo').value.trim();
        const artista = document.getElementById('cifra-artista').value.trim();
        const dificuldade = document.getElementById('cifra-dificuldade').value;
        const genero = document.getElementById('cifra-genero').value;
        const tagsStr = document.getElementById('cifra-tags').value.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        if (!url) {
            status.textContent = 'Informe a URL da cifra.';
            status.className = 'import-status error';
            return;
        }

        status.textContent = 'Importando cifra...';
        status.className = 'import-status loading';

        try {
            const resp = await fetch('/api/cifra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, titulo, artista, dificuldade, genero, tags }),
            });
            const data = await resp.json();
            if (data.ok) {
                let msg = `Cifra "${data.titulo}" importada com sucesso!`;
                if (data.dificuldade) msg += ` (${data.dificuldade})`;
                if (data.genero) msg += ` [${data.genero}]`;
                status.textContent = msg;
                status.className = 'import-status success';
                document.getElementById('form-cifra').reset();
                document.getElementById('analise-resultado').classList.add('hidden');
                await carregarCatalogo();
            } else if (data.erro === 'duplicata') {
                const dup = data.duplicata;
                status.innerHTML = `<strong>Duplicata detectada!</strong> ${dup.motivo}<br>` +
                    `"${dup.item_existente.titulo}" já existe como ${dup.item_existente.tipo}.<br>` +
                    `<button type="button" class="btn-forcar" onclick="forcarImportCifra()">Importar mesmo assim</button>`;
                status.className = 'import-status error';
            } else {
                status.textContent = `Erro: ${data.erro}`;
                status.className = 'import-status error';
            }
        } catch (err) {
            status.innerHTML = `Servidor de importação não encontrado.<br>Execute: <code>python3 servidor.py</code>`;
            status.className = 'import-status error';
        }
    });
}

async function forcarImportCifra() {
    const status = document.getElementById('cifra-status');
    const url = document.getElementById('cifra-url').value.trim();
    const titulo = document.getElementById('cifra-titulo').value.trim();
    const artista = document.getElementById('cifra-artista').value.trim();
    const dificuldade = document.getElementById('cifra-dificuldade').value;
    const genero = document.getElementById('cifra-genero').value;
    const tagsStr = document.getElementById('cifra-tags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    status.textContent = 'Importando cifra (forçado)...';
    status.className = 'import-status loading';

    try {
        const resp = await fetch('/api/cifra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, titulo, artista, dificuldade, genero, tags, forcar: true }),
        });
        const data = await resp.json();
        if (data.ok) {
            status.textContent = `Cifra "${data.titulo}" importada com sucesso!`;
            status.className = 'import-status success';
            document.getElementById('form-cifra').reset();
            document.getElementById('analise-resultado').classList.add('hidden');
            await carregarCatalogo();
        } else {
            status.textContent = `Erro: ${data.erro}`;
            status.className = 'import-status error';
        }
    } catch (err) {
        status.innerHTML = `Erro de conexão com o servidor.`;
        status.className = 'import-status error';
    }
}

function initFormPdf() {
    document.getElementById('form-pdf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('pdf-status');
        const fileInput = document.getElementById('pdf-file');
        const file = fileInput.files[0];
        if (!file) return;

        const titulo = document.getElementById('pdf-titulo').value.trim();
        const compositor = document.getElementById('pdf-compositor').value.trim();
        const genero = document.getElementById('pdf-genero').value;
        const dificuldade = document.getElementById('pdf-dificuldade').value;
        const tagsStr = document.getElementById('pdf-tags').value.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        status.textContent = 'Enviando PDF e convertendo páginas...';
        status.className = 'import-status loading';

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('titulo', titulo);
        formData.append('compositor', compositor);
        formData.append('genero', genero);
        formData.append('dificuldade', dificuldade);
        formData.append('tags', JSON.stringify(tags));

        try {
            const resp = await fetch('/api/pdf', {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (data.ok) {
                status.textContent = `Partitura "${data.titulo}" importada (${data.paginas} páginas)!`;
                status.className = 'import-status success';
                document.getElementById('form-pdf').reset();
                await carregarCatalogo();
            } else {
                status.textContent = `Erro: ${data.erro}`;
                status.className = 'import-status error';
            }
        } catch (err) {
            status.innerHTML = `Servidor de importação não encontrado.<br>Execute: <code>python3 servidor.py</code>`;
            status.className = 'import-status error';
        }
    });
}

// ── Event Listeners ──

function initEventos() {
    // Viewer controls
    document.querySelector('.viewer-prev').addEventListener('click', () => navegarPagina(-1));
    document.querySelector('.viewer-next').addEventListener('click', () => navegarPagina(1));
    document.getElementById('zoom-in').addEventListener('click', () => aplicarZoom(0.2));
    document.getElementById('zoom-out').addEventListener('click', () => aplicarZoom(-0.2));

    // Header link: voltar ao catálogo
    document.querySelector('.header-link').addEventListener('click', (e) => {
        e.preventDefault();
        navegarPara('catalogo');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (telaAtual === 'viewer') {
            if (e.key === 'ArrowLeft') navegarPagina(-1);
            if (e.key === 'ArrowRight') navegarPagina(1);
            if (e.key === '+' || e.key === '=') aplicarZoom(0.2);
            if (e.key === '-') aplicarZoom(-0.2);
            if (e.key === 'Escape') navegarPara('catalogo');
        }
        if (telaAtual === 'cifra' && e.key === 'Escape') {
            navegarPara('catalogo');
        }
    });

    // Import tabs and forms
    initImportTabs();
    initFormCifra();
    initFormPdf();
}

// ── Init ──

document.addEventListener('DOMContentLoaded', async () => {
    await carregarCatalogo();
    renderFiltros();
    renderCards(CATALOGO);
    initEventos();
});
