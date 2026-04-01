# HandOff — 2026-04-01

## O que foi feito nesta sessão

- **Bug fix — músicas não apareciam localmente:** `servidor.py` passou a servir arquivos estáticos + API na mesma porta (8001). Antes só servia a API, então `fetch('catalogo.json')` falhava ao abrir como `file://`.
- **Bug fix — campo `genero` faltando:** primeira entrada do `catalogo.json` ("Coração Igual Ao Teu") não tinha o campo `genero` — corrigido para `"Gospel"`.
- **Bug fix — BananaCifras JS-rendered:** scraping com `requests` não funciona no site. Solução: campos de título/artista editáveis no formulário + mensagem de aviso quando scraping é incompleto.
- **Melhoria — formulário de cifra:** adicionados campos de título/artista editáveis manualmente; validação de URL flexível (aceita qualquer site); API aceita `titulo`/`artista` como override.
- **URLs da API corrigidas:** frontend apontava para `http://localhost:8001/api/` hardcoded — trocado para `/api/` relativo.
- **Auto-deploy do Netlify pausado** (`stop_builds: true`) para economizar créditos do plano free.
- **Asana:** task de React deletada; notas de prioridade e dependência adicionadas em Filtros e Testes Unitários; "Ajustes no formulário" atualizado com o que já foi feito.
- **Skills globais instaladas:** 28 do `ComposioHQ/awesome-claude-skills` + 14 do `obra/superpowers` em `~/.claude/skills/`.

## Decisões tomadas

- **Servidor unificado na porta 8001:** serve site + API juntos. Acesse http://localhost:8001 para usar localmente.
- **BananaCifras não tem solução de scraping** via requests (JS-rendered). Campos manuais no form resolvem sem Selenium/Playwright.
- **Deploy manual por enquanto:** auto-deploy pausado no Netlify. Quando quiser publicar: `netlify deploy --dir=. --prod`. Reativar quando migrar para branch `develop`.
- **React adiado indefinidamente:** não faz sentido agora com o projeto pequeno.
- **Testes unitários:** só depois que o formulário de importação estabilizar.

## Estado atual

- Site local: **http://localhost:8001** (rodar `python3 servidor.py` na pasta do projeto)
- Site público: **https://francaspianorepertory.netlify.app** (desatualizado — deploy pausado)
- Catálogo local tem 7 músicas; arquivos locais ainda não foram pushados ao GitHub

## Próximos passos (por prioridade)

1. **Bug — Filtros sem label** (ALTA, ~10min): prefixar opção padrão dos selects com o nome do filtro (ex: "Tipo: Todos", "Gênero: Todos")
2. **Ajustes no formulário** (pendente):
   - Remover botão "Analisar" — mesclar detecção no fluxo de "Importar Cifra"
   - Popup de confirmação ao detectar duplicata
   - Campo URL de referência no formulário de PDF
   - Exibir URL como link no viewer de partitura
3. **Fazer git push + deploy** das músicas importadas localmente
4. **Testes unitários** (baixa prioridade, depois do formulário estabilizar)

## Contexto técnico relevante

- Servidor roda na porta **8001** (não 8000) — serve site + API
- Netlify site ID: `161a1c5c-a82d-4130-8c1e-8c38e5221bad`
- Auto-deploy pausado: `stop_builds: true` via API do Netlify
- Para reativar auto-deploy: `netlify api updateSite --data '{"site_id": "161a1c5c-a82d-4130-8c1e-8c38e5221bad", "body": {"build_settings": {"stop_builds": false}}}'`
- Repos de skills: `~/awesome-claude-skills/` e `~/superpowers/`
- Asana project GID: `1213886842273101`
