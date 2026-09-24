# CLAUDE.md — fabrica-renda-ia

Hub dos5 pilares de produtos digitais: datasets, e-books, prompts, API, micro-SaaS.

## Comandos
```bash
node main.js                       # status dos5 pilares + ordem de ataque
node main.js --agente <pilar>      # datasets|ebooks|prompts|api|saas
node main.js --agente ebooks --nicho ia-contabilidade
node serve-local.js                # vitrine de tudo em :5173
node overnight/overnight.js --status   # workflow noturno (done/pending)
node overnight/overnight.js --once --mock
node overnight/dashboard-server.js     # mapa do workflow em :3500
```

## Estrutura
- `produtos/` — **versionado** (produtos gerados): prompts-ia-advocacia/, ebook-ia-contabilidade/
- `overnight/` — runner + workflow.json + dashboard-server + `output/` (landings 3D, briefs, anúncios, pesquisas)
- `agentes/`, `lib/llm.js` — orquestração de agentes (Ollama local quando possível)

## Artefatos de vendas (overnight/output/)
- `anuncios-venda.md` — copies prontas Hotmart/PromptBase/Etsy/LinkedIn
- `calendario-7dias.md` — calendário FB + LinkedIn + roteiros30s (gerado do anuncios-venda.md)
- `site-advocacia/`, `site-contabilidade/` — landings 3D estáticas (publicadas em `/sites/*` do Pages)

## Regras
- Links de pagamento começam como `CONFIGURE-SEU-LINK` — **nunca inventar link real**.
- Integra com `../data-sales-agent` (caminho relativo — não mover a pasta).
- Resultados de LLM: não fabricar métricas/depoimentos; copy usa apenas dados de `pesquisa-sixth-advocacia.md`.

## Repo
GitHub: `Victor-Enginner/fabrica-renda-ia` · branch `main`.
