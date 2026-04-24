/**
 * Veille Technologique — K-ElectroniK
 * Script standalone Node.js pur — aucune dépendance npm
 * Collecte RSS + API REST + Serveur web → http://localhost:3000
 *
 * Usage :
 *   node test-local.js            → serveur web sur :3000
 *   node test-local.js --collect  → collecte seule (fichiers output/)
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

// ─── Config ───────────────────────────────────────────────────────────────────

const TOPICS = [
  { id:'gouvernance_si', label:' Gouvernance SI & Stratégie IT', keywords:['it governance','gouvernance it','it strategy','strategic alignment','cobit','itil','digital transformation','transformation digitale','enterprise architecture','it management','cio','dsi'] },
  { id:'erp_crm',        label:' ERP, CRM & Systèmes de gestion', keywords:['erp','crm','sap','salesforce','enterprise resource planning','customer relationship management','marketing automation','campaign management','prestashop','saas erp','cloud erp','warehouse management','wms'] },
  { id:'cybersecurite',  label:' Cybersécurité & PSSI', keywords:['cybersecurity','cybersécurité','pssi','security policy','iso 27001','iso 27002','rgpd','gdpr','ransomware','data breach','zero trust','risk management','disaster recovery','business continuity','siem','soc','pentest','vulnerability','anssi','nis2','incident response'] },
  { id:'cloud_infra',    label:' Cloud & Infrastructure', keywords:['cloud computing','aws','azure','gcp','hybrid cloud','multi-cloud','devops','ci/cd','docker','kubernetes','microservices','serverless','infrastructure as code','iac','cloud migration'] },
  { id:'ia_emergent',    label:' IA, IoT & Technologies émergentes', keywords:['artificial intelligence','intelligence artificielle','machine learning','deep learning','generative ai','chatgpt','llm','iot','internet of things','blockchain','robotics','robotique','automation','rpa','edge computing','5g'] },
  { id:'lean_performance',label:' Lean IT & Performance SI', keywords:['lean it','lean management','agile','scrum','kanban','continuous improvement','kpi','sla','trs','okr','performance monitoring','observability','value stream','itsm','service management','it cost'] },
  { id:'green_it',       label:' Green IT & RSE', keywords:['green it','sustainable it','informatique responsable','rse','csr','iso 26000','carbon footprint','empreinte carbone','numérique responsable','it sustainability','energy efficiency','pue','e-waste','digital sobriety'] },
  { id:'bpm_processus',  label:' BPM & Processus métier', keywords:['bpm','bpmn','business process','process management','workflow','process automation','process mining','iso 9001','process mapping'] },
];

const RSS_SOURCES = [
  { label:'dev.to',      url:'https://dev.to/feed' },
  { label:'infoq',       url:'https://feed.infoq.com/' },
  { label:'thenewstack', url:'https://thenewstack.io/feed/' },
  { label:'dzone',       url:'https://feeds.dzone.com/home' },
  { label:'hackernews',  url:'https://hnrss.org/best' },
];

const PORT = 3000;
const MAX_PER_SOURCE = 30;

// ─── In-memory store ──────────────────────────────────────────────────────────

const store = { articles:[], lastRun:null, isRunning:false, sourcesStatus:{} };

// ─── Fetch ────────────────────────────────────────────────────────────────────

function fetchUrl(rawUrl, hops = 0) {
  if (hops > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const mod = rawUrl.startsWith('https') ? https : http;
    const req = mod.get(rawUrl, { headers:{'User-Agent':'VeilleTech-Bot/1.0','Accept':'application/rss+xml,*/*'}, timeout:12000 }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location)
        return fetchUrl(res.headers.location, hops+1).then(resolve).catch(reject);
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function stripHtml(h) {
  return h.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]*>/g,' ')
    .replace(/&(nbsp|amp|lt|gt|quot);/g, m => ({nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"'})[m.slice(1,-1)])
    .replace(/&#?\w+;/g,' ').replace(/\s+/g,' ').trim();
}

function parseRSS(xml, label) {
  const out = [];
  const re = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const get = t => { const r = new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i'); const x = b.match(r); return x ? stripHtml(x[1]).slice(0,500) : ''; };
    const lm  = b.match(/<link[^>]*>([^<]+)<\/link>/i) || b.match(/<link[^>]+href="([^"]+)"/i);
    const title = get('title'), link = lm ? lm[1].trim() : '';
    if (title && link) out.push({ title, link, description: get('description')||get('summary')||'', pubDate: get('pubDate')||get('published')||'', source: label });
  }
  return out;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreArticle(a) {
  const text = (a.title+' '+a.description).toLowerCase();
  const topics=[], topicLabels=[], kws=[];
  for (const t of TOPICS) {
    const hits = t.keywords.filter(k => text.includes(k));
    if (hits.length) { topics.push(t.id); topicLabels.push(t.label); kws.push(...hits); }
  }
  return { ...a, topics, topicLabels, relevanceScore: kws.length, matchedKeywords:[...new Set(kws)] };
}

// ─── Collect ──────────────────────────────────────────────────────────────────

async function collect() {
  if (store.isRunning) return;
  store.isRunning = true;
  console.log('\n Collecte en cours...');
  try {
    const all = [];
    for (const src of RSS_SOURCES) {
      process.stdout.write(`   ${src.label.padEnd(14)}`);
      try {
        const xml = await fetchUrl(src.url);
        const arts = parseRSS(xml, src.label).slice(0, MAX_PER_SOURCE);
        all.push(...arts);
        store.sourcesStatus[src.label] = 'ok';
        console.log(`  ${arts.length}`);
      } catch(e) {
        store.sourcesStatus[src.label] = 'error';
        console.log(`  ${e.message}`);
      }
    }
    store.articles = all.map(scoreArticle).filter(a => a.relevanceScore >= 5)
      .sort((a,b) => b.relevanceScore - a.relevanceScore || new Date(b.pubDate)-new Date(a.pubDate));
    store.lastRun = new Date().toISOString();
    console.log(`\n ${store.articles.length} articles retenus`);

    // Sauvegarder JSON
    const outDir = path.join(__dirname,'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    fs.writeFileSync(path.join(outDir,'veille-report.json'), JSON.stringify({ generatedAt: store.lastRun, totalArticles: store.articles.length, articles: store.articles }, null, 2));
  } finally {
    store.isRunning = false;
  }
}

// ─── API ──────────────────────────────────────────────────────────────────────

function handleApi(req, res, parsed) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin','*');
  const p = parsed.pathname, q = parsed.query||{};

  if (p==='/api/stats' && req.method==='GET')
    return res.end(JSON.stringify({ totalArticles:store.articles.length, lastRun:store.lastRun, isRunning:store.isRunning, sources:RSS_SOURCES.map(s=>({label:s.label,status:store.sourcesStatus[s.label]||'unknown'})) }));

  if (p==='/api/topics' && req.method==='GET')
    return res.end(JSON.stringify(TOPICS.map(t=>({id:t.id,label:t.label,count:store.articles.filter(a=>a.topics.includes(t.id)).length}))));

  if (p==='/api/articles' && req.method==='GET') {
    let arts = [...store.articles];
    if (q.topic && q.topic!=='all') arts = arts.filter(a=>a.topics.includes(q.topic));
    if (q.q) { const s=q.q.toLowerCase(); arts=arts.filter(a=>a.title.toLowerCase().includes(s)||a.description.toLowerCase().includes(s)||a.matchedKeywords.some(k=>k.includes(s))); }
    const page=Math.max(1,parseInt(q.page)||1), limit=Math.min(50,Math.max(1,parseInt(q.limit)||18)), total=arts.length;
    return res.end(JSON.stringify({ total, page, limit, pages:Math.ceil(total/limit), items:arts.slice((page-1)*limit,page*limit) }));
  }

  if (p==='/api/refresh' && req.method==='POST') {
    collect().catch(console.error);
    return res.end(JSON.stringify({status:'started'}));
  }

  res.statusCode=404; res.end(JSON.stringify({error:'Not found'}));
}

// ─── Static server ────────────────────────────────────────────────────────────

const MIME = {'.html':'text/html;charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.ico':'image/x-icon'};

function serveStatic(req, res, pathname) {
  const safe = pathname==='/' ? '/index.html' : pathname;
  const fp   = path.join(__dirname,'public',safe);
  if (!fp.startsWith(path.join(__dirname,'public'))) { res.statusCode=403; return res.end('Forbidden'); }
  if (!fs.existsSync(fp)) { res.statusCode=404; return res.end('Not found'); }
  res.setHeader('Content-Type', MIME[path.extname(fp)]||'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--collect')) {
  collect().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
} else {
  http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    parsed.pathname.startsWith('/api/') ? handleApi(req,res,parsed) : serveStatic(req,res,parsed.pathname);
  }).listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   VEILLE TECHNOLOGIQUE — K-ElectroniK   ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n Ouvrez → http://localhost:${PORT}`);
    console.log('   Ctrl+C pour arrêter\n');
    collect().catch(console.error);
  });
}
