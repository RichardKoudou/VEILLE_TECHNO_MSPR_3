import { Controller, Get, Query, Post, Param } from '@nestjs/common';
import { VeilleService } from '../feed/veille.service';
import { FilterService } from '../filter/filter.service';
import { VEILLE_CONFIG } from '../../config/veille.config';

@Controller('api')
export class ApiController {
  constructor(
    private readonly veilleService: VeilleService,
    private readonly filterService: FilterService,
  ) {}

  /** GET /api/articles — liste filtrée avec pagination et search */
  @Get('articles')
  getArticles(
    @Query('topic') topic?: string,
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    let articles = this.veilleService.getArticles();

    if (topic && topic !== 'all') {
      articles = articles.filter(a => a.topics.includes(topic));
    }

    if (q && q.trim()) {
      const search = q.toLowerCase().trim();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search) ||
        a.matchedKeywords.some(k => k.toLowerCase().includes(search)),
      );
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const total = articles.length;
    const start = (pageNum - 1) * limitNum;
    const items = articles.slice(start, start + limitNum);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      items,
    };
  }

  /** GET /api/topics — liste des thématiques avec compteurs */
  @Get('topics')
  getTopics() {
    const articles = this.veilleService.getArticles();
    return VEILLE_CONFIG.TOPICS.map(t => ({
      id: t.id,
      label: t.label,
      count: articles.filter(a => a.topics.includes(t.id)).length,
    }));
  }

  /** GET /api/stats — stats globales */
  @Get('stats')
  getStats() {
    return this.veilleService.getStats();
  }

  /** POST /api/refresh — relance la collecte */
  @Post('refresh')
  async refresh() {
    // Lance la collecte en arrière-plan sans bloquer la réponse
    this.veilleService.run().catch(() => {});
    return { status: 'started', message: 'Collecte lancée en arrière-plan' };
  }
}
