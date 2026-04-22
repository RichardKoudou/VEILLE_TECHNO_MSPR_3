import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface RawArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceLabel: string;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  async fetchRSS(url: string, sourceLabel: string): Promise<RawArticle[]> {
    try {
      this.logger.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'VeilleTech-Bot/1.0 (NestJS RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const articles: RawArticle[] = [];

      $('item').each((_, el) => {
        const title = $(el).find('title').first().text().trim();
        const link = $(el).find('link').first().text().trim() ||
                     $(el).find('link').first().attr('href') || '';
        const description = $(el).find('description').first().text().trim() ||
                            $(el).find('summary').first().text().trim() || '';
        const pubDate = $(el).find('pubDate').first().text().trim() ||
                        $(el).find('published').first().text().trim() ||
                        $(el).find('dc\\:date').first().text().trim() || '';

        if (title && link) {
          articles.push({
            title,
            link,
            description: this.stripHtml(description).substring(0, 400),
            pubDate,
            source: url,
            sourceLabel,
          });
        }
      });

      this.logger.log(`  → ${articles.length} articles fetched from ${sourceLabel}`);
      return articles;
    } catch (error) {
      this.logger.warn(`Failed to fetch ${sourceLabel}: ${error.message}`);
      return [];
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
