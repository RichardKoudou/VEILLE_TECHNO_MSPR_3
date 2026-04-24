// Configuration des mots-clés de veille technologique
// Alignée avec les thématiques du MSPR K-ElectroniK (Bloc 1 RNCP35584)

export const VEILLE_CONFIG = {
  // Sources RSS daily.dev (flux publics accessibles)
  RSS_SOURCES: [
    {
      name: 'daily.dev - DEV Community',
      url: 'https://dev.to/feed',
      label: 'dev.to',
    },
    {
      name: 'InfoQ',
      url: 'https://feed.infoq.com/',
      label: 'infoq',
    },
    {
      name: 'The New Stack',
      url: 'https://thenewstack.io/feed/',
      label: 'thenewstack',
    },
    {
      name: 'DZone',
      url: 'https://feeds.dzone.com/home',
      label: 'dzone',
    },
    {
      name: 'Hacker News - Best',
      url: 'https://hnrss.org/best',
      label: 'hackernews',
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
  ],

  // Thématiques MSPR → mots-clés associés
  TOPICS: [
    {
      id: 'gouvernance_si',
      label: ' Gouvernance SI & Stratégie IT',
      keywords: [
        'IT governance', 'gouvernance IT', 'IT strategy', 'strategic alignment',
        'COBIT', 'ITIL', 'digital transformation', 'transformation digitale',
        'schéma directeur', 'roadmap SI', 'CIO', 'DSI', 'enterprise architecture',
        'architecture d\'entreprise', 'IT management',
      ],
    },
    {
      id: 'erp_crm',
      label: ' ERP, CRM & Systèmes de gestion',
      keywords: [
        'ERP', 'CRM', 'SAP', 'Salesforce', 'enterprise resource planning',
        'customer relationship management', 'marketing automation', 'campaign management',
        'Prestashop', 'e-commerce platform', 'SaaS ERP', 'cloud ERP',
        'gestion de production', 'WMS', 'warehouse management',
      ],
    },
    {
      id: 'cybersecurite',
      label: ' Cybersécurité & PSSI',
      keywords: [
        'cybersecurity', 'cybersécurité', 'PSSI', 'security policy', 'ISO 27001',
        'ISO 27002', 'RGPD', 'GDPR', 'ransomware', 'data breach', 'zero trust',
        'risk management', 'gestion des risques', 'PCA', 'PRA', 'disaster recovery',
        'business continuity', 'SIEM', 'SOC', 'pentest', 'vulnerability',
        'ANSSI', 'NIS2', 'incident response',
      ],
    },
    {
      id: 'cloud_infra',
      label: ' Cloud & Infrastructure',
      keywords: [
        'cloud computing', 'AWS', 'Azure', 'GCP', 'hybrid cloud', 'multi-cloud',
        'DevOps', 'CI/CD', 'containerization', 'Docker', 'Kubernetes',
        'microservices', 'serverless', 'infrastructure as code', 'IaC',
        'migration cloud', 'cloud migration', 'on-premise',
      ],
    },
    {
      id: 'ia_emergent',
      label: ' IA, IoT & Technologies émergentes',
      keywords: [
        'artificial intelligence', 'intelligence artificielle', 'machine learning',
        'deep learning', 'generative AI', 'ChatGPT', 'LLM', 'IoT',
        'Internet of Things', 'blockchain', 'robotics', 'robotique',
        'automation', 'RPA', 'process automation', 'edge computing',
        'digital twin', 'augmented reality', '5G',
      ],
    },
    {
      id: 'lean_performance',
      label: ' Lean IT & Performance SI',
      keywords: [
        'Lean IT', 'lean management', 'agile', 'scrum', 'kanban',
        'continuous improvement', 'amélioration continue', 'KPI', 'SLA',
        'TRS', 'OKR', 'performance monitoring', 'observability',
        'value stream mapping', 'waste reduction', 'IT cost optimization',
        'ITSM', 'service management',
      ],
    },
    {
      id: 'green_it',
      label: ' Green IT & RSE',
      keywords: [
        'Green IT', 'sustainable IT', 'informatique responsable', 'RSE',
        'CSR', 'ISO 26000', 'carbon footprint', 'empreinte carbone',
        'éco-conception', 'eco-design', 'numérique responsable',
        'IT sustainability', 'energy efficiency', 'datacenter energy',
        'PUE', 'e-waste', 'digital sobriety', 'low carbon',
      ],
    },
    {
      id: 'bpm_processus',
      label: ' BPM & Processus métier',
      keywords: [
        'BPM', 'BPMN', 'business process', 'process management',
        'workflow', 'process automation', 'process mining',
        'process optimization', 'ISO 9001', 'qualité IT',
        'modélisation processus', 'process mapping',
      ],
    },
  ],

  // Nombre max d'articles par source
  MAX_ARTICLES_PER_SOURCE: 30,

  // Score minimum pour inclure un article (nb de keywords matchés)
  MIN_RELEVANCE_SCORE: 10,

  // Langue prioritaire
  PREFERRED_LANG: ['fr', 'en'],
};
