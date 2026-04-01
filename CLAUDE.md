# Repertório Piano — Matheus França

## O que é este projeto

Site pessoal de Matheus França para organizar e consultar seu repertório musical de piano. Centraliza **cifras** (HTML) e **partituras** (PDF) em um único lugar, com visualização diretamente no browser, filtros por tipo/gênero/dificuldade e busca por nome.

É um site estático (HTML + CSS + JS puro), sem framework, sem build step. O catálogo é mantido em `catalogo.json`.

## Infraestrutura

- **GitHub:** `https://github.com/francamatheus/repertorio-piano` (público)
- **Netlify:** `https://francaspianorepertory.netlify.app` — auto-deploy a cada push na `main`
- **Asana:** projeto "Organização de Partituras / Cifras de Piano"

Deploy é automático: basta fazer `git push origin main`.

## Estrutura do projeto

```
index.html          — SPA com três telas: catálogo, viewer de partitura, viewer de cifra
catalogo.json       — fonte de verdade de todas as músicas
css/style.css       — estilos
js/app.js           — lógica da SPA (navegação, filtros, renderização)
js/data.js          — carregamento do catálogo
cifras/             — páginas HTML de cifras (uma por música)
pdfs/               — partituras PDF (excluídas do git)
imagens/            — assets visuais
```

Scripts locais (`servidor.py`, `adicionar_pdf.py`, `adicionar_cifra.py`) são utilitários de desenvolvimento e estão no `.gitignore`.

## Planos futuros

- **Remover botão "Analisar" separado:** a detecção de duplicatas e auto-classificação de gênero/dificuldade deve rodar automaticamente ao clicar "Importar Cifra". Se duplicata detectada, exibir popup de confirmação antes de prosseguir.
- **Campo opcional de URL de referência no formulário de PDF:** salvar no `catalogo.json` e exibir como link clicável na tela do viewer da partitura.
- **Auto-deploy já está configurado** — não é necessário rodar `netlify deploy` manualmente.

## Diretrizes

- Este é um site estático simples — evitar introduzir dependências, frameworks ou build steps desnecessários.
- Antes de qualquer mudança de comportamento ou UI, **pergunte ao Matheus** se há dúvida sobre a intenção. É preferível confirmar do que assumir.
- O `catalogo.json` é a fonte de verdade — qualquer nova música deve ser adicionada lá.
- PDFs ficam fora do git (`.gitignore`). Não commitar PDFs.
- Antes de commitar: sempre rodar `git pull` para evitar conflitos. Fluxo: `git pull` → `git add` → `git commit` → `git push`.
