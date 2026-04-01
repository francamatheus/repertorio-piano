# HandOff — 2026-03-31

## O que foi feito nesta sessão

- Criado `.gitignore` excluindo `pdfs/`, `__pycache__/`, `*.pyc`, `servidor.py`, `adicionar_pdf.py`, `adicionar_cifra.py`
- `git init` + commit inicial com 7 arquivos
- Criado repositório **público** no GitHub: `github.com/francamatheus/repertorio-piano`
- Deploy no Netlify via CLI: site criado como `francaspianorepertory`
- Conectado GitHub → Netlify para auto-deploy a cada push na `main` (testado e validado: deploy em ~4s)
- Criado `CLAUDE.md` com contexto completo do projeto, infraestrutura e diretrizes
- Instaladas 42 skills globais de dois repos: `ComposioHQ/awesome-claude-skills` e `obra/superpowers`
- Criada skill global `/handoff` em `~/.claude/skills/handoff.md`
- Marcadas como concluídas no Asana: tasks "Publicar no GitHub" e "Hospedar no Netlify" + todas as 8 subtasks

## Decisões tomadas

- **Repo público** (era privado inicialmente): necessário para auto-deploy funcionar no plano gratuito do Netlify. Repo de repertório pessoal sem dados sensíveis — decisão ok.
- **Deploy manual via CLI** foi substituído por **auto-deploy via GitHub** — não é mais necessário rodar `netlify deploy` manualmente.
- **Skills instaladas globalmente** em `~/.claude/skills/` para evitar duplicação entre projetos.

## Estado atual

- Site no ar: **https://francaspianorepertory.netlify.app**
- Repo: **https://github.com/francamatheus/repertorio-piano** (público)
- Auto-deploy funcionando: push na `main` → Netlify publica automaticamente
- Asana: 2 tasks concluídas, 2 pendentes

## Próximos passos (Asana pendente)

1. **Ajustes no formulário de importação:**
   - Remover botão "Analisar" separado — detecção de duplicatas/classificação deve rodar automaticamente ao clicar "Importar Cifra"
   - Se duplicata detectada: exibir popup de confirmação antes de prosseguir
   - Adicionar campo opcional "URL de referência" no formulário de PDF
   - Exibir URL como link clicável na tela do viewer da partitura

2. **Transformar em React** (task futura, sem subtasks ainda)

## Contexto técnico relevante

- Netlify site ID: `161a1c5c-a82d-4130-8c1e-8c38e5221bad`
- Asana project GID: `1213886842273101` (projeto "Organização de Partituras / Cifras de Piano")
- Scripts locais (`servidor.py`, `adicionar_pdf.py`, `adicionar_cifra.py`) estão no `.gitignore` — rodam apenas localmente para adicionar conteúdo ao `catalogo.json`
- PDFs estão no `.gitignore` — não vão para o GitHub/Netlify
- Repos de skills clonados em `~/awesome-claude-skills/` e `~/superpowers/` caso precise atualizar
