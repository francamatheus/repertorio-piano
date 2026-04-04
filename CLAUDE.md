# Repertório Piano — Matheus França

## O que é este projeto

Projeto pessoal de Matheus França para organizar e consultar seu repertório musical de **teclado**. Centraliza cifras (HTML, importadas do BananaCifras ou CifrasClub) e partituras (PDF) em um único lugar, com visualização no browser, filtros por tipo/gênero/dificuldade e busca por nome.

Stack: HTML + CSS + JS puro, sem framework, sem build step. Se o projeto crescer, a stack pode ser revisada. O catálogo é mantido em `catalogo.json`.

## Infraestrutura

- **GitHub:** `https://github.com/francamatheus/repertorio-piano` (público)
- **Netlify:** `https://francaspianorepertory.netlify.app` (deploy manual — usar `/deploy-prod`)
- **Asana:** projeto "Organização de Partituras / Cifras de Piano" — GID `1213886842273101`. Sempre usar este projeto para gerenciar tarefas. Usar a skill `/asana`.

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
tests/              — testes Jest (npm test)
```

## Regras de negócio

**Campos obrigatórios de uma música:**
- `titulo` — nome da música
- `artista` — nome do artista/banda
- `dificuldade` — aceita apenas: `Iniciante`, `Intermediário`, `Avançado`
- `genero` — gênero musical (ex: Gospel, Rock, MPB)
- `tipo` — `Cifra`, `Partitura` ou `Ambos`
- `arquivo` — caminho para o arquivo (HTML ou PDF)

**Regras:**
- Instrumento exclusivo: **teclado**. Não aceitar cifras/partituras de outros instrumentos.
- Fontes aceitas para cifras: BananaCifras e CifrasClub
- Fontes aceitas para partituras: PDF
- A adição de músicas só pode ser feita com o servidor local rodando
- `catalogo.json` é a única fonte de verdade — qualquer nova música deve ser adicionada lá

## Localização de textos

Todos os textos exibidos na UI (labels, mensagens de erro, placeholders, confirmações) devem estar em um arquivo centralizado de localização — padrão similar ao `Localizable.strings` do iOS. Atualmente o arquivo ainda não existe, mas esta é uma diretriz obrigatória para novos textos. O idioma padrão é **português**; o arquivo deve ser estruturado para facilitar a futura adição de inglês.

## Comandos úteis

- Rodar localmente: `python servidor.py`
- Rodar testes: `npm test`
- Deploy em produção: `/deploy-prod`

## Skills disponíveis

- `/adicionar-cifra` — importar cifra do BananaCifras ou CifrasClub
- `/adicionar-pdf` — adicionar partitura em PDF
- `/deploy-prod` — fazer deploy no Netlify
- `/handoff` — capturar contexto da sessão atual
- `/asana` — gerenciar tarefas no Asana

## Testes

Framework: **Jest** (`npm test`). Os testes ficam em `tests/`.

Regra: testes devem ser escritos a partir das **regras de negócio**, não do código. Antes de escrever um teste, identificar qual regra ele valida.

## Encerramento de sessão

Quando perceber que a sessão está sendo finalizada (ex: "boa noite", "por hoje é só", "até amanhã", "obrigado, tchau"), sugerir proativamente o `/handoff` caso ainda não tenha sido feito:

> "Quer que eu faça o handoff antes de encerrar?"

## Diretrizes

- **Sempre perguntar antes de executar.** Não tomar ações sem confirmação explícita do Matheus. Em caso de dúvida, perguntar.
- Evitar introduzir dependências, frameworks ou build steps desnecessários.
- PDFs ficam fora do git (`.gitignore`). Não commitar PDFs.
- Arquivos Python devem seguir SOLID e clean code.
- Antes de commitar: fluxo obrigatório: `git pull` → `git add` → `git commit` → `git push`.
