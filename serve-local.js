#!/usr/bin/env node
/**
 * 🖥️ Serve Local — fabrica-renda-ia (LOCAL-FIRST, sem Vercel)
 *
 * Serve TUDO que a fábrica gera, numa página-índice só:
 *   produtos/            → packs de prompts, e-books
 *   overnight/output/    → landings 3D, briefs, anúncios
 *   ../data-sales-agent/output/ → datasets + landings (se existir)
 *
 * Uso:
 *   node serve-local.js              → http://127.0.0.1:5173
 *   PORT=8080 node serve-local.js
 *
 * Zero dependências (http nativo).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '127.0.0.1';

const RAIZES = [
  ['produtos', path.join(__dirname, 'produtos')],
  ['sites-3d', path.join(__dirname, 'overnight', 'output')],
  ['datasets', path.join(__dirname, '..', 'data-sales-agent', 'output')],
];

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function listarArquivos(dir, base = '', nivel = 0) {
  if (nivel > 3 || !fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir)) {
    if (e.startsWith('.') || e === 'node_modules') continue;
    const abs = path.join(dir, e);
    const rel = base ? `${base}/${e}` : e;
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      const idx = path.join(abs, 'index.html');
      out.push({ rel, abs, dir: true, index: fs.existsSync(idx) });
      out.push(...listarArquivos(abs, rel, nivel + 1));
    } else if (/\.(html|md|json|csv)$/i.test(e)) {
      out.push({ rel, abs, dir: false });
    }
  }
  return out.slice(0, 200);
}

function paginaIndice() {
  const stats = { paginas: 0, docs: 0, pastas: 0 };
  const blocos = RAIZES.map(([nome, dir]) => {
    if (!fs.existsSync(dir)) return `<section class="root"><h2>📦 ${nome}</h2><p class="dim">pasta ausente: ${dir}</p></section>`;
    const itens = listarArquivos(dir);
    if (!itens.length) return `<section class="root"><h2>📦 ${nome}</h2><p class="dim">vazio — gere com <code>node main.js --agente ...</code></p></section>`;
    const cards = itens.map((it) => {
      const url = `/${nome}/${it.rel}`;
      const link = it.dir && it.index ? `/${nome}/${it.rel}/index.html` : url;
      const ext = it.rel.split('.').pop().toLowerCase();
      const icone = it.dir ? '📁' : ext === 'html' ? '🌐' : ext === 'md' ? '📝' : ext === 'csv' ? '📊' : '🧾';
      if (it.dir) stats.pastas++; else if (ext === 'html') stats.paginas++; else stats.docs++;
      return `<a class="item" href="${link}" data-nome="${it.rel.toLowerCase()}"><span class="ic">${icone}</span><span class="nm">${it.rel}</span><span class="go">→</span></a>`;
    }).join('\n');
    return `<section class="root"><h2>📦 ${nome} <span class="dim">(${dir})</span></h2><div class="grid">${cards}</div></section>`;
  }).join('\n');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fábrica de Renda IA — Hub de Produtos</title>
<style>
*{margin:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#070b14;color:#e2e8f0;min-height:100vh;padding:2.5rem 1.25rem 4rem;line-height:1.55;overflow-x:hidden}
body::before,body::after{content:'';position:fixed;width:55vw;height:55vw;border-radius:50%;filter:blur(130px);opacity:.22;z-index:-1;animation:drift 22s ease-in-out infinite alternate}
body::before{background:#4f46e5;top:-18%;left:-12%}
body::after{background:#0891b2;bottom:-25%;right:-12%;animation-delay:-11s}
@keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(6vw,4vh) scale(1.12)}100%{transform:translate(-4vw,-6vh) scale(.94)}}
.wrap{max-width:980px;margin:0 auto}
.badge{display:inline-block;background:rgba(99,102,241,.14);border:1px solid rgba(139,148,255,.35);color:#a5b4fc;padding:6px 16px;border-radius:999px;font-size:.78em;font-weight:600;letter-spacing:.6px;margin-bottom:14px}
h1{font-size:clamp(1.7rem,4vw,2.6rem);letter-spacing:-1px}
h1 span{background:linear-gradient(90deg,#818cf8,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:#94a3b8;margin:10px 0 22px;max-width:640px}
.stats{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 22px}
.stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 18px;font-size:.85em}
.stat b{display:block;font-size:1.35em;background:linear-gradient(90deg,#818cf8,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
#q{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#e2e8f0;padding:12px 16px;font-size:1em;outline:none;margin:6px 0 8px}
#q:focus{border-color:rgba(139,148,255,.5);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.term{background:#0d1117;border:1px solid #1e293b;border-radius:12px;padding:12px 16px;margin:14px 0 34px;font-size:.8rem;color:#64748b;overflow-x:auto}
.term code{background:#161b27;padding:.1rem .45rem;border-radius:6px;color:#7dd3fc}
.root{margin:2.2rem 0}
.root h2{font-size:1.05rem;margin-bottom:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.item{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px 14px;color:#e2e8f0;text-decoration:none;font-size:.88em;transition:transform .25s,border-color .25s,box-shadow .25s}
.item:hover{transform:translateY(-3px);border-color:rgba(139,148,255,.45);box-shadow:0 14px 34px -14px rgba(99,102,241,.45)}
.item .ic{font-size:1.05em}
.item .nm{flex:1;word-break:break-all}
.item .go{color:#64748b;transition:transform .25s,color .25s}
.item:hover .go{transform:translateX(3px);color:#a5b4fc}
.dim{color:#64748b;font-size:.78em;font-weight:400}
.empty{color:#64748b;font-size:.85em;padding:18px;text-align:center;border:1px dashed rgba(255,255,255,.12);border-radius:12px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body><div class="wrap">
<span class="badge">🖥️ LOCAL · SEM VERCEL · GERE → REVISE → VENDA</span>
<h1>🏭 Fábrica de Renda IA — <span>Hub de Produtos</span></h1>
<p class="sub">Tudo servido desta máquina: landings, packs, e-books e datasets prontos para venda via Hotmart, Kiwify, Gumroad, Pix ou WhatsApp.</p>
<div class="stats">
  <div class="stat"><b>${stats.paginas}</b>páginas de venda</div>
  <div class="stat"><b>${stats.docs}</b>docs &amp; dados</div>
  <div class="stat"><b>${stats.pastas}</b>produtos</div>
</div>
<input id="q" type="search" placeholder="🔎 filtrar por nome… (ex.: advocacia, dataset, ebook)" aria-label="Filtrar itens">
<div class="term">Comandos: <code>node main.js --agente prompts --nicho ia-advocacia</code> · <code>node main.js --agente ebooks --nicho ia-contabilidade</code> · <code>node main.js --agente datasets</code></div>
${blocos}
<p class="empty" id="vazio" hidden>Nenhum item bate com o filtro.</p>
</div>
<script>
var q=document.getElementById('q'),itens=document.querySelectorAll('.item'),vazio=document.getElementById('vazio');
q.addEventListener('input',function(){var t=q.value.toLowerCase(),n=0;itens.forEach(function(el){var m=el.getAttribute('data-nome').indexOf(t)>-1;el.style.display=m?'':'none';if(m)n++});vazio.hidden=n>0;});
</script>
</body></html>`;
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(paginaIndice());
    return;
  }
  const [_, raiz, ...resto] = urlPath.split('/');
  const root = RAIZES.find(([n]) => n === raiz);
  if (!root) { res.writeHead(404); res.end('404'); return; }
  let abs = path.normalize(path.join(root[1], resto.join('/')));
  if (!abs.startsWith(root[1])) { res.writeHead(403); res.end('403'); return; }
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) abs = path.join(abs, 'index.html');
  if (!fs.existsSync(abs)) { res.writeHead(404); res.end('404 — gere o produto primeiro'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(abs).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`\n🏭 Fábrica servindo LOCAL (sem Vercel)`);
  console.log(`   URL: http://${HOST}:${PORT}/`);
  console.log(`   Raízes: ${RAIZES.map(([, d]) => d).join(' | ')}\n`);
});
