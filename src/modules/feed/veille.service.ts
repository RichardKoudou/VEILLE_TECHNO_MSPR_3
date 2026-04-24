import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeedService, RawArticle } from '../feed/feed.service';
import { FilterService, FilteredArticle } from '../filter/filter.service';
import { ReportService } from '../report/report.service';
import { VEILLE_CONFIG } from '../../config/veille.config';

@Injectable()
export class VeilleService {
  private readonly logger = new Logger(VeilleService.name);

  // Stockage en mémoire des articles pour l'API
  private articles: FilteredArticle[] = [];
  private lastRun: Date | null = null;
  private isRunning = false;
  private sourcesStatus: Record<string, 'ok' | 'error'> = {};

  constructor(
    private readonly feedService: FeedService,
    private readonly filterService: FilterService,
    private readonly reportService: ReportService,
  ) {}

  /** Accès aux articles stockés en mémoire */
  getArticles(): FilteredArticle[] {
    return this.articles;
  }

  /** Stats globales pour le dashboard */
  getStats() {
    return {
      totalArticles: this.articles.length,
      lastRun: this.lastRun?.toISOString() ?? null,
      isRunning: this.isRunning,
      sources: VEILLE_CONFIG.RSS_SOURCES.map(s => ({
        label: s.label,
        status: this.sourcesStatus[s.label] ?? 'unknown',
      })),
      topTopics: VEILLE_CONFIG.TOPICS.map(t => ({
        id: t.id,
        label: t.label,
        count: this.articles.filter(a => a.topics.includes(t.id)).length,
      })).sort((a, b) => b.count - a.count).slice(0, 5),
    };
  }

  /** Lancement automatique toutes les 6 heures (méthode push) */
  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledRun() {
    this.logger.log(' Scheduled veille run triggered...');
    await this.run();
  }

  /** Collecte, filtre, stocke en mémoire et génère les rapports */
  async run(): Promise<{ count: number }> {
    if (this.isRunning) {
      this.logger.warn('Collecte déjà en cours, ignorée.');
      return { count: this.articles.length };
    }

    this.isRunning = true;
    this.logger.log(' Démarrage de la veille technologique...');

    try {
      // 1. Collecte parallèle
      const fetchPromises = VEILLE_CONFIG.RSS_SOURCES.map(source =>
        this.feedService.fetchRSS(source.url, source.label),
      );
      const results = await Promise.allSettled(fetchPromises);
      const allArticles: RawArticle[] = [];

      results.forEach((result, i) => {
        const label = VEILLE_CONFIG.RSS_SOURCES[i].label;
        if (result.status === 'fulfilled') {
          this.sourcesStatus[label] = 'ok';
          allArticles.push(...result.value.slice(0, VEILLE_CONFIG.MAX_ARTICLES_PER_SOURCE));
        } else {
          this.sourcesStatus[label] = 'error';
          this.logger.warn(`Source ${label} failed: ${result.reason}`);
        }
      });

      this.logger.log(` Total brut: ${allArticles.length} articles`);

      // 2. Filtrage et stockage mémoire
      this.articles = this.filterService.filterAndScore(allArticles);
      this.lastRun = new Date();
      this.logger.log(` ${this.articles.length} articles pertinents retenus`);

      // 3. Génération des fichiers de sortie (HTML + JSON)
      const grouped = this.filterService.groupByTopic(this.articles);
      this.reportService.generateHTML(this.articles, grouped);
      this.reportService.generateJSON(this.articles);

      this.logger.log('═══════════════════════════════════════════════');
      this.logger.log(`   Veille terminée — ${this.articles.length} articles`);
      this.logger.log('   Interface : http://localhost:3000');
      this.logger.log('═══════════════════════════════════════════════');

      return { count: this.articles.length };
    } finally {
      this.isRunning = false;
    }
  }
}
