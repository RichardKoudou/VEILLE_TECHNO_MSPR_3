import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FilteredArticle } from '../filter/filter.service';
import { VEILLE_CONFIG } from '../../config/veille.config';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly outputDir = path.join(process.cwd(), 'output');

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateHTML(articles: FilteredArticle[], grouped: Record<string, FilteredArticle[]>): string {
    const now = new Date().toLocaleString('fr-FR');
    const totalCount = articles.length;

    const topicSections = Object.entries(grouped)
      .map(([topic, arts]) => {
        const cards = arts
          .slice(0, 10)
          .map(a => this.articleCard(a))
          .join('\n');
        return `
        <section class="topic-section">
          <h2>${topic} <span class="count">${arts.length} article${arts.length > 1 ? 's' : ''}</span></h2>
          <div class="cards-grid">${cards}</div>
        </section>`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veille Technologique — K-ElectroniK MSPR</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      line-height: 1.6;
    }
    header {
      background: linear-gradient(135deg, #1a1f2e 0%, #2d1b69 100%);
      padding: 2rem;
      border-bottom: 1px solid #2d3748;
    }
    header h1 { font-size: 1.8rem; font-weight: 700; color: #a78bfa; }
    header p { color: #94a3b8; margin-top: 0.25rem; font-size: 0.9rem; }
    .stats {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .stat {
      background: rgba(167,139,250,0.1);
      border: 1px solid rgba(167,139,250,0.2);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .stat strong { color: #a78bfa; }
    main { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .topic-section { margin-bottom: 3rem; }
    .topic-section h2 {
      font-size: 1.1rem;
      color: #c4b5fd;
      border-left: 3px solid #7c3aed;
      padding-left: 0.75rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .count {
      font-size: 0.75rem;
      background: rgba(124,58,237,0.2);
      color: #a78bfa;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 400;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    .card {
      background: #1e2433;
      border: 1px solid #2d3748;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover {
      border-color: #7c3aed;
      transform: translateY(-2px);
    }
    .card-title a {
      color: #e2e8f0;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.92rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .card-title a:hover { color: #a78bfa; }
    .card-desc {
      color: #94a3b8;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .source-badge {
      background: #2d3748;
      color: #94a3b8;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .score-badge {
      background: rgba(124,58,237,0.15);
      color: #a78bfa;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid rgba(124,58,237,0.3);
    }
    .keywords {
      margin-top: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .keyword {
      background: rgba(16,185,129,0.1);
      color: #6ee7b7;
      font-size: 0.68rem;
      padding: 0.15rem 0.45rem;
      border-radius: 3px;
      border: 1px solid rgba(16,185,129,0.2);
    }
    .date { color: #64748b; font-size: 0.72rem; }
    footer {
      text-align: center;
      padding: 2rem;
      color: #475569;
      font-size: 0.8rem;
      border-top: 1px solid #1e2433;
    }
  </style>
</head>
<body>
  <header>
    <h1>📡 Veille Technologique — K-ElectroniK</h1>
    <p>MSPR Bloc 1 RNCP35584 — Rapport généré le ${now}</p>
    <div class="stats">
      <div class="stat"><strong>${totalCount}</strong> articles pertinents</div>
      <div class="stat"><strong>${Object.keys(grouped).length}</strong> thématiques couvertes</div>
      <div class="stat"><strong>${VEILLE_CONFIG.RSS_SOURCES.length}</strong> sources analysées</div>
    </div>
  </header>
  <main>
    ${topicSections || '<p style="color:#94a3b8;text-align:center;padding:3rem">Aucun article trouvé. Vérifiez votre connexion et relancez.</p>'}
  </main>
  <footer>
    Veille technologique automatisée — NestJS — Sources : ${VEILLE_CONFIG.RSS_SOURCES.map(s => s.label).join(', ')}
  </footer>
</body>
</html>`;

    const filePath = path.join(this.outputDir, 'veille-report.html');
    fs.writeFileSync(filePath, html, 'utf-8');
    this.logger.log(`HTML report saved: ${filePath}`);
    return filePath;
  }

  generateJSON(articles: FilteredArticle[]): string {
    const report = {
      generatedAt: new Date().toISOString(),
      totalArticles: articles.length,
      topics: VEILLE_CONFIG.TOPICS.map(t => ({
        id: t.id,
        label: t.label,
        count: articles.filter(a => a.topics.includes(t.id)).length,
      })),
      articles: articles.map(a => ({
        title: a.title,
        link: a.link,
        description: a.description,
        pubDate: a.pubDate,
        source: a.sourceLabel,
        topics: a.topicLabels,
        relevanceScore: a.relevanceScore,
        matchedKeywords: a.matchedKeywords,
      })),
    };

    const filePath = path.join(this.outputDir, 'veille-report.json');
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
    this.logger.log(`JSON report saved: ${filePath}`);
    return filePath;
  }

  private articleCard(article: FilteredArticle): string {
    const date = article.pubDate
      ? new Date(article.pubDate).toLocaleDateString('fr-FR')
      : '';
    const keywords = article.matchedKeywords
      .slice(0, 4)
      .map(k => `<span class="keyword">${k}</span>`)
      .join('');

    return `
    <div class="card">
      <div class="card-title">
        <a href="${article.link}" target="_blank" rel="noopener">${this.escapeHtml(article.title)}</a>
      </div>
      ${article.description ? `<div class="card-desc">${this.escapeHtml(article.description)}</div>` : ''}
      <div class="card-meta">
        <span class="source-badge">${article.sourceLabel}</span>
        <span class="score-badge">score: ${article.relevanceScore}</span>
        ${date ? `<span class="date">${date}</span>` : ''}
      </div>
      <div class="keywords">${keywords}</div>
    </div>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
