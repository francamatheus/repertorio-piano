# HandOff — 2026-04-04

## O que foi feito (histórico relevante)

### Sessão 2026-04-03
- Migração Asana MCP v1 → v2: app OAuth criado manualmente no Developer Console, configurado com `claude mcp add --transport http -s user`
- Skill `/asana` criada em `~/.claude/skills/asana.md` e validada (leitura, criação de subtask, marcação como concluído)
- Testes criados: 110 pytest (`tests/test_servidor.py`) + 29 Jest (`tests/app.test.js`) usando 20 URLs reais como fixtures
- `js/app.utils.js` extraído de `app.js` com funções DOM-free (`removerAcentos`, `slugify`, `filtrar`) para permitir testes Jest
- Bug fix: ID duplicado `cifra-titulo` — `<h2>` renomeado para `cifra-viewer-titulo`
- UI: Country/Sertanejo separados em dois gêneros distintos (catálogo, filtros, servidor.py)
- UI: botão "+ Importar" visível apenas em localhost
- Catálogo: removido "Tempo Perdido" (Legião Urbana); corrigido gênero "Take Me Home, Country Roads" para Country
- Asana: todas as tasks do projeto receberam prioridades; "Testes Unitários" e "Criação de Skill do Asana" marcadas como concluídas
- CLAUDE.md: instrução adicionada para sugerir `/handoff` ao encerrar sessão

### Sessão 2026-04-02
- Removida entrada errada do Free Bird (artista "Coldplay") do `catalogo.json`
- Corrigido regex do BananaCifras para tratar `SIMPLIFICADA` como separador, adicionando `(Simplificada)` ao título quando URL contém `/simplificada/`
- Adicionado `cifra_encontrada` no retorno de `analisar_cifra()` no `servidor.py`
- Adicionado Lynyrd Skynyrd e outros artistas rock clássicos ao mapeamento de gênero Rock
- Reformulação completa do formulário de importação de cifra (duas fases, validação inline)
- Skill `handoff.md` atualizada para acumular contexto entre sessões em vez de sobrescrever
- Commits: `af258e9` (fixes BananaCifras + Free Bird) e `97c3385` (reformulação do form)

### Sessão 2026-04-01
- Bug fix: músicas não apareciam localmente — `servidor.py` passou a servir estáticos + API na porta 8001
- Bug fix: BananaCifras é JS-rendered — solução via API interna `/json/tab.js?id=...&v=...`
- Bug fix: campo `genero` faltando na primeira entrada do catálogo
- Adicionados campos de título/artista editáveis no formulário de cifra
- URLs da API corrigidas para relativas (`/api/` em vez de `http://localhost:8001/api/`)
- Auto-deploy do Netlify pausado para economizar créditos (`stop_builds: true`)
- FILTROS refatorado para objeto com `{ value, label }` — labels descritivos nos selects
- Logging de importações em `logs/importacoes.jsonl`
- Skills globais instaladas: 28 do `ComposioHQ/awesome-claude-skills` + 14 do `obra/superpowers`
- Skill `handoff.md` criada como global em `~/.claude/skills/`

### Sessão 2026-03-30~31
- Projeto criado do zero: estrutura de pastas, `catalogo.json`, `index.html`, `css/style.css`, `js/app.js`, `js/data.js`
- Scripts `adicionar_pdf.py`, `adicionar_cifra.py`, `servidor.py` criados
- Repo GitHub criado (`francamatheus/repertorio-piano`, público) e Netlify configurado
- Primeiras cifras importadas (Diante do Trono, Aline Barros, Fernandinho, etc.)

---

## Decisões tomadas

- **Asana MCP v2 via OAuth manual**: Dynamic Client Registration não é suportado pelo Claude Code. Solução: registrar app manualmente no Developer Console do Asana e configurar com `claude mcp add --transport http -s user`.
- **`app.utils.js` separado**: funções sem DOM (`removerAcentos`, `slugify`, `filtrar`) extraídas para permitir testes Jest com `module.exports` condicional.
- **Formulário em duas fases**: campos ficam ocultos até análise retornar cifra encontrada. Sem cifra = não expande.
- **Botão "+ Importar" só local**: em produção (Netlify) o botão fica oculto — importação é só fluxo local.
- **Country e Sertanejo separados**: eram um único gênero `Country/Sertanejo` — separados para melhor categorização.
- **BananaCifras via API interna**: título/artista vêm do `<title>` HTML; cifra vem da API `/json/tab.js`.
- **`servidor.py` fora do git**: fica só local (`.gitignore`). Sempre restartar após mudanças.
- **Auto-deploy Netlify pausado**: deploy manual quando quiser publicar. Reativar quando usar branch `develop`.
- **Site estático simples**: sem framework, sem build step. Evitar introduzir dependências.

---

## Estado atual

- Servidor local: `http://localhost:8001/` (rodar `python3 servidor.py`)
- Site público: `https://francaspianorepertory.netlify.app` (pode estar desatualizado — deploy manual)
- Asana MCP v2: funcionando, tools disponíveis em qualquer sessão Claude Code
- Testes: 110 pytest + 29 Jest passando
- Catálogo: ~10 músicas (cifras). PDFs: nenhum ainda.

---

## Próximos passos

Por prioridade no Asana:

**HIGH:**
1. **BUG — Detecção e bloqueio de instrumento não-teclado** — detectar instrumento da URL (CifraClub `#instrument=`, BananaCifras path) e bloquear import se não for teclado/piano
2. **FEATURE — Ordenação na Home** — picker nos filtros (Popularidade default, data, nome, gênero, dificuldade); campo `acessos` incrementado ao clicar no card e persistido no `catalogo.json`

**MEDIUM:**
3. **BUG — Sufixo "(Simplificada)" via URL CifraClub** — detectar `/simplificada.html` na URL e adicionar sufixo ao título (BananaCifras já feito)
4. **FEATURE — Inferência de gênero via iTunes Search API** — fallback quando scraping não detecta gênero
5. **INFRA — Revisão CLAUDE.md** — atualizar seções desatualizadas

**Fora do Asana:**
- Remover botão "Analisar" separado (detecção automática ao clicar "Importar Cifra")
- Campo opcional de URL de referência no formulário de PDF

---

## Contexto técnico relevante

- **Reiniciar servidor**: `lsof -ti:8001 | xargs kill -9 && python3 servidor.py`
- **Rodar testes**: `cd repertorio-piano && pytest tests/` e `npm test`
- **Asana MCP**: `claude mcp get asana` — escopo User, OAuth em `~/.mcp-auth/`
- **Asana Priority GIDs**: HIGH=`1213922600755857`, MEDIUM=`1213922600755858`, LOW=`1213922600755859`, field=`1213922600755856`
- **Asana Project GID**: `1213886842273101`
- **BananaCifras**: `tab.js` ref pode estar depois de 5000 chars no HTML — usar `str(soup)` completo
- **`cifraAnaliseOk`**: variável JS que controla se análise foi bem-sucedida — resetada a cada nova análise e no reset do form
- **Netlify site ID**: `161a1c5c-a82d-4130-8c1e-8c38e5221bad`
- **Reativar auto-deploy**: `netlify api updateSite --data '{"site_id": "161a1c5c-...", "body": {"build_settings": {"stop_builds": false}}}'`
