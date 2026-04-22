# 📡 Veille Technologique — K-ElectroniK

Outil de veille technologique **push** avec interface web intégrée.
MSPR Bloc 1 RNCP35584 — *Analyser et définir la stratégie d'un système d'information.*

---

## 🚀 Lancement en 30 secondes

### Prérequis : Node.js ≥ 18  →  https://nodejs.org

### Option A — Script standalone (recommandé, zéro installation)

```bash
node test-local.js
```

Puis ouvrez **http://localhost:3000** dans votre navigateur.

### Option B — Application NestJS complète

```bash
npm install
npm start
```

Puis ouvrez **http://localhost:3000**.

---

## 🖥️ Interface web

| Fonctionnalité | Description |
|---|---|
| **Sidebar thématiques** | Filtrer par l'une des 8 thématiques MSPR |
| **Recherche full-text** | Recherche en temps réel dans titres et descriptions |
| **Cartes articles** | Score de pertinence + mots-clés + source + date |
| **Modal de lecture** | Détail complet de l'article + lien vers la source |
| **Bouton Actualiser** | Relance une collecte à la demande |
| **Statut sources** | Indicateur visuel de l'état de chaque source RSS |
| **Pagination** | Navigation par pages (18 articles/page) |

---

## 🎯 Thématiques surveillées

| Thématique | Mots-clés (extrait) |
|---|---|
| 🏛️ Gouvernance SI | COBIT, ITIL, CIO, DSI, alignement IT |
| 💼 ERP / CRM | SAP, Salesforce, marketing automation |
| 🔒 Cybersécurité | ISO 27001, RGPD, ransomware, zero trust |
| ☁️ Cloud & Infra | AWS, Azure, DevOps, Kubernetes |
| 🤖 IA & IoT | LLM, ChatGPT, blockchain, robotique |
| 📊 Lean IT | Agile, KPI, SLA, ITSM |
| 🌱 Green IT | ISO 26000, RSE, empreinte carbone |
| 🔄 BPM | BPMN, ISO 9001, workflow |

---

## 📡 API REST

| Endpoint | Description |
|---|---|
| `GET /api/articles?topic=&q=&page=&limit=` | Articles filtrés paginés |
| `GET /api/topics` | Thématiques avec compteurs |
| `GET /api/stats` | Statistiques et état des sources |
| `POST /api/refresh` | Déclenche une nouvelle collecte |

---

## 🏗️ Architecture

```
veille-tech/
├── test-local.js          # Serveur standalone (Node.js pur, 0 dépendance)
├── public/
│   └── index.html         # Interface web (SPA vanilla JS)
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/veille.config.ts      ← personnalisation
│   └── modules/
│       ├── feed/           # Collecte RSS + orchestration CRON
│       ├── filter/         # Scoring et filtrage
│       ├── report/         # Export HTML/JSON
│       └── api/            # Contrôleur REST NestJS
├── package.json
└── tsconfig.json
```
