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

// Config 
const TOPICS = [
  {
    id: 'gouvernance_si',
    label: ' Gouvernance SI & Stratégie IT',
    keywords: [
      // FR
      'gouvernance IT', 'gouvernance informatique', 'schéma directeur',
      'roadmap SI', 'DSI', 'directeur des systèmes d\'information',
      'transformation digitale', 'transformation numérique',
      'architecture d\'entreprise', 'alignement stratégique',
      'pilotage SI', 'comité de direction IT', 'plan directeur informatique',
      'urbanisation SI', 'cartographie SI', 'maturité IT',
      'audit informatique', 'management des SI', 'gouvernance des données',
      'politique informatique', 'stratégie numérique', 'feuille de route IT',
      'modèle opérationnel', 'organisation IT', 'tableau de bord SI',
      // EN
      'IT governance', 'IT strategy', 'strategic alignment',
      'COBIT', 'ITIL', 'digital transformation', 'CIO',
      'enterprise architecture', 'IT management', 'IT roadmap',
      'IT maturity', 'IT audit', 'data governance',
      'operating model', 'IT operating model', 'IT steering committee',
      'IT portfolio management', 'enterprise IT', 'IT leadership',
      'digital strategy', 'IT planning', 'IT organization',
      'IT value', 'business IT alignment', 'IT decision making',
    ],
  },
  {
    id: 'erp_crm',
    label: ' ERP, CRM & Systèmes de gestion',
    keywords: [
      // FR
      'ERP', 'CRM', 'SAP', 'Salesforce', 'gestion de production',
      'gestion des stocks', 'gestion commerciale', 'gestion de la relation client',
      'logiciel de gestion', 'système de gestion', 'outil CRM',
      'outil ERP', 'PGI', 'progiciel de gestion intégré',
      'gestion des commandes', 'gestion des achats', 'gestion des fournisseurs',
      'planification des ressources', 'gestion financière', 'comptabilité logiciel',
      'marketing automation', 'automatisation marketing', 'gestion de campagnes',
      'segmentation client', 'fidélisation client', 'base de données clients',
      'e-commerce', 'boutique en ligne', 'vente en ligne',
      // EN
      'enterprise resource planning', 'customer relationship management',
      'campaign management', 'Prestashop', 'e-commerce platform',
      'SaaS ERP', 'cloud ERP', 'WMS', 'warehouse management',
      'order management', 'supply chain management', 'procurement software',
      'inventory management', 'demand planning', 'MRP', 'manufacturing software',
      'HubSpot', 'Zoho', 'Microsoft Dynamics', 'Oracle ERP',
      'Odoo', 'NetSuite', 'Sage', 'Cegid',
      'customer data platform', 'CDP', 'lead management',
      'sales automation', 'customer engagement', 'omnichannel',
    ],
  },
  {
    id: 'cybersecurite',
    label: ' Cybersécurité & PSSI',
    keywords: [
      // FR
      'cybersécurité', 'sécurité informatique', 'sécurité des systèmes d\'information',
      'politique de sécurité', 'PSSI', 'RSSI', 'responsable sécurité',
      'RGPD', 'protection des données', 'conformité RGPD',
      'gestion des risques', 'analyse de risques', 'risque informatique',
      'plan de continuité', 'plan de reprise', 'PCA', 'PRA',
      'sauvegarde des données', 'reprise après sinistre',
      'attaque informatique', 'cyberattaque', 'ransomware', 'rançongiciel',
      'phishing', 'hameçonnage', 'violation de données', 'fuite de données',
      'audit de sécurité', 'test d\'intrusion', 'vulnérabilité',
      'pare-feu', 'antivirus', 'détection des menaces',
      'authentification', 'contrôle d\'accès', 'gestion des identités',
      'chiffrement', 'cryptographie', 'certificat numérique',
      // EN
      'cybersecurity', 'information security', 'security policy',
      'ISO 27001', 'ISO 27002', 'GDPR', 'data protection',
      'ransomware', 'data breach', 'zero trust', 'zero-trust',
      'risk management', 'disaster recovery', 'business continuity',
      'SIEM', 'SOC', 'pentest', 'vulnerability', 'CVE',
      'ANSSI', 'NIS2', 'incident response', 'threat detection',
      'endpoint security', 'network security', 'cloud security',
      'identity management', 'IAM', 'MFA', 'multi-factor authentication',
      'encryption', 'firewall', 'intrusion detection', 'IDS', 'IPS',
      'security audit', 'compliance', 'cyber threat', 'malware',
      'patch management', 'security awareness', 'cyber resilience',
    ],
  },
  {
    id: 'cloud_infra',
    label: ' Cloud & Infrastructure',
    keywords: [
      // FR
      'cloud computing', 'informatique en nuage', 'hébergement cloud',
      'migration cloud', 'infrastructure cloud', 'cloud hybride',
      'multi-cloud', 'cloud privé', 'cloud public', 'cloud souverain',
      'virtualisation', 'conteneurisation', 'infrastructure informatique',
      'réseau informatique', 'centre de données', 'datacenter',
      'serveur', 'stockage en ligne', 'sauvegarde cloud',
      'DevOps', 'intégration continue', 'déploiement continu',
      'automatisation infrastructure', 'supervision informatique',
      'haute disponibilité', 'scalabilité', 'performance infrastructure',
      // EN
      'cloud computing', 'AWS', 'Azure', 'GCP', 'Google Cloud',
      'hybrid cloud', 'multi-cloud', 'private cloud', 'public cloud',
      'DevOps', 'CI/CD', 'containerization', 'Docker', 'Kubernetes',
      'microservices', 'serverless', 'infrastructure as code', 'IaC',
      'cloud migration', 'on-premise', 'data center', 'colocation',
      'network infrastructure', 'load balancing', 'CDN', 'edge network',
      'Terraform', 'Ansible', 'Helm', 'GitOps',
      'site reliability engineering', 'SRE', 'platform engineering',
      'FinOps', 'cloud cost optimization', 'cloud native',
      'service mesh', 'API gateway', 'Kafka', 'message queue',
    ],
  },
  {
    id: 'ia_emergent',
    label: ' IA, IoT & Technologies émergentes',
    keywords: [
      // FR
      'intelligence artificielle', 'apprentissage automatique',
      'apprentissage profond', 'IA générative', 'modèle de langage',
      'traitement du langage naturel', 'vision par ordinateur',
      'automatisation intelligente', 'robot logiciel', 'jumeau numérique',
      'réalité augmentée', 'réalité virtuelle', 'métavers',
      'objets connectés', 'internet des objets', 'capteurs IoT',
      'industrie 4.0', 'usine intelligente', 'robotique industrielle',
      'blockchain', 'cryptomonnaie', 'contrat intelligent',
      'données massives', 'big data', 'analyse de données',
      'intelligence décisionnelle', 'aide à la décision',
      '5G', 'connectivité', 'réseau de nouvelle génération',
      // EN
      'artificial intelligence', 'machine learning', 'deep learning',
      'generative AI', 'ChatGPT', 'LLM', 'large language model',
      'GPT', 'Claude', 'Gemini', 'Copilot', 'natural language processing',
      'NLP', 'computer vision', 'neural network',
      'IoT', 'Internet of Things', 'connected devices', 'smart sensors',
      'blockchain', 'smart contract', 'Web3', 'DeFi',
      'robotics', 'RPA', 'robotic process automation',
      'process automation', 'intelligent automation', 'hyperautomation',
      'edge computing', 'digital twin', 'augmented reality', 'AR', 'VR',
      '5G', 'Industry 4.0', 'smart factory', 'big data',
      'data science', 'predictive analytics', 'AI ethics',
      'foundation model', 'multimodal AI', 'AI agent',
    ],
  },
  {
    id: 'lean_performance',
    label: ' Lean IT & Performance SI',
    keywords: [
      // FR
      'Lean IT', 'lean management', 'amélioration continue',
      'gestion de la performance', 'performance informatique',
      'indicateurs de performance', 'tableau de bord',
      'pilotage de la performance', 'mesure de la performance',
      'accord de niveau de service', 'gestion des services IT',
      'agilité', 'méthode agile', 'gestion de projet agile',
      'réduction des coûts IT', 'optimisation des coûts',
      'retour sur investissement', 'ROI informatique',
      'time to market', 'délai de livraison', 'vélocité',
      'dette technique', 'qualité logicielle', 'refactoring',
      'observabilité', 'supervision applicative', 'monitoring',
      'cartographie de la chaîne de valeur', 'flux de valeur',
      // EN
      'Lean IT', 'lean management', 'agile', 'scrum', 'kanban',
      'continuous improvement', 'KPI', 'SLA', 'OKR', 'TRS',
      'performance monitoring', 'observability', 'APM',
      'value stream mapping', 'waste reduction', 'IT cost optimization',
      'ITSM', 'service management', 'IT service', 'help desk',
      'incident management', 'change management', 'CMDB',
      'sprint', 'backlog', 'velocity', 'burndown',
      'technical debt', 'code quality', 'software quality',
      'DevSecOps', 'shift left', 'test automation',
      'chaos engineering', 'resilience engineering',
      'IT benchmarking', 'IT efficiency', 'IT ROI',
    ],
  },
  {
    id: 'green_it',
    label: ' Green IT & RSE',
    keywords: [
      // FR
      'Green IT', 'informatique responsable', 'numérique responsable',
      'sobriété numérique', 'écoconception numérique', 'éco-conception',
      'empreinte carbone numérique', 'empreinte environnementale',
      'responsabilité sociétale', 'RSE', 'développement durable',
      'transition écologique', 'bilan carbone', 'neutralité carbone',
      'datacenter vert', 'efficacité énergétique', 'consommation énergétique',
      'déchets électroniques', 'recyclage informatique',
      'longévité des équipements', 'reconditionnement',
      'label numérique responsable', 'référentiel GreenIT',
      'impact environnemental du numérique', 'pollution numérique',
      // EN
      'Green IT', 'sustainable IT', 'IT sustainability',
      'digital sobriety', 'eco-design', 'eco-friendly software',
      'carbon footprint', 'carbon neutral', 'net zero IT',
      'CSR', 'ISO 26000', 'ESG', 'sustainability report',
      'energy efficiency', 'datacenter energy', 'PUE',
      'renewable energy', 'green cloud', 'carbon-aware computing',
      'e-waste', 'electronic waste', 'circular economy IT',
      'low carbon', 'scope 3 emissions', 'carbon accounting',
      'sustainable software', 'green software engineering',
      'responsible AI', 'AI energy consumption',
      'server consolidation', 'virtualization efficiency',
    ],
  },
  {
    id: 'bpm_processus',
    label: ' BPM & Processus métier',
    keywords: [
      // FR
      'BPM', 'BPMN', 'processus métier', 'gestion des processus',
      'modélisation des processus', 'cartographie des processus',
      'optimisation des processus', 'automatisation des processus',
      'flux de travail', 'workflow', 'orchestration',
      'amélioration des processus', 'refonte des processus',
      'réingénierie des processus', 'processus opérationnels',
      'gestion de la qualité', 'management de la qualité',
      'certification qualité', 'démarche qualité', 'norme qualité',
      'conformité', 'audit processus', 'contrôle interne',
      'pilotage des flux', 'logiciel BPM', 'outil workflow',
      'digitalisation des processus', 'dématérialisation',
      // EN
      'BPM', 'BPMN', 'business process', 'process management',
      'workflow', 'process automation', 'process mining',
      'process optimization', 'ISO 9001', 'process mapping',
      'process reengineering', 'process improvement', 'process design',
      'business process management', 'workflow automation',
      'task automation', 'orchestration', 'choreography',
      'low-code', 'no-code', 'citizen developer',
      'digital process automation', 'DPA', 'intelligent BPM',
      'case management', 'decision management', 'DMN',
      'process intelligence', 'process discovery',
      'robotic process', 'straight-through processing',
      'quality management', 'quality assurance', 'compliance',
    ],
  },
];

const RSS_SOURCES = [
  { 
    label:'dev.to',      
    url:'https://dev.to/feed' 
  },
  { 
    label:'infoq',       
    url:'https://feed.infoq.com/' 
  },
  { 
    label:'thenewstack', 
    url:'https://thenewstack.io/feed/' 
  },
  { 
    label:'dzone',       
    url:'https://feeds.dzone.com/home' 
  },
  { 
    label:'hackernews',  
    url:'https://hnrss.org/best' 
  },
  {
      name: 'Le Monde Informatique',
      url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/1.xml',
      label: 'lemondeinformatique',
    },
    {
      name: 'Journal du Net',
      url: 'https://www.journaldunet.com/solutions/rss/',
      label: 'journaldunet',
    },
    {
      name: 'ZDNet France',
      url: 'https://www.zdnet.fr/feeds/rss/actualites/',
      label: 'zdnet-fr',
    },
    {
      name: 'Silicon.fr',
      url: 'https://www.silicon.fr/feed',
      label: 'silicon',
    },
    {
      name: "Usine Digitale",
      url: 'https://www.usine-digitale.fr/rss/all/',
      label: 'usine-digitale',
    },
    {
      name: 'ANSSI CERT-FR',
      url: 'https://www.cert.ssi.gouv.fr/feed/',
      label: 'anssi-cert',
    },
    {
      name: 'CSO Online',
      url: 'https://www.csoonline.com/feed/',
      label: 'csoonline',
    },
    {
      name: 'ITPro',
      url: 'https://www.itpro.com/feed',
      label: 'itpro',
    },
    {
      name: 'Computer Weekly',
      url: 'https://www.computerweekly.com/rss/IT-news.xml',
      label: 'computerweekly',
    },
    {
      name: 'MIT Technology Review',
      url: 'https://www.technologyreview.com/feed/',
      label: 'mit-techreview',
    },
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
    store.articles = all.map(scoreArticle).filter(a => a.relevanceScore >= 2)
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
