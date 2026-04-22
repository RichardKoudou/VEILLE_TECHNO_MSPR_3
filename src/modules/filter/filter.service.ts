import { Injectable } from '@nestjs/common';
import { RawArticle } from '../feed/feed.service';
import { VEILLE_CONFIG } from '../../config/veille.config';

export interface FilteredArticle extends RawArticle {
  topics: string[];
  topicLabels: string[];
  relevanceScore: number;
  matchedKeywords: string[];
}

@Injectable()
export class FilterService {
  /**
   * Filtre et score les articles selon leur pertinence
   * par rapport aux thématiques MSPR K-ElectroniK
   */
  filterAndScore(articles: RawArticle[]): FilteredArticle[] {
    const filtered: FilteredArticle[] = [];

    for (const article of articles) {
      const searchText = [
        article.title,
        article.description,
      ].join(' ').toLowerCase();

      const matchedTopics: string[] = [];
      const matchedTopicLabels: string[] = [];
      const matchedKeywords: string[] = [];

      for (const topic of VEILLE_CONFIG.TOPICS) {
        const topicMatches: string[] = [];

        for (const keyword of topic.keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            topicMatches.push(keyword);
          }
        }

        if (topicMatches.length > 0) {
          matchedTopics.push(topic.id);
          matchedTopicLabels.push(topic.label);
          matchedKeywords.push(...topicMatches);
        }
      }

      const relevanceScore = matchedKeywords.length;

      if (relevanceScore >= VEILLE_CONFIG.MIN_RELEVANCE_SCORE) {
        filtered.push({
          ...article,
          topics: matchedTopics,
          topicLabels: matchedTopicLabels,
          relevanceScore,
          matchedKeywords: [...new Set(matchedKeywords)],
        });
      }
    }

    // Tri par score décroissant puis par date
    return filtered.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
  }

  /**
   * Groupe les articles par thématique
   */
  groupByTopic(articles: FilteredArticle[]): Record<string, FilteredArticle[]> {
    const grouped: Record<string, FilteredArticle[]> = {};

    for (const topic of VEILLE_CONFIG.TOPICS) {
      const topicArticles = articles.filter(a => a.topics.includes(topic.id));
      if (topicArticles.length > 0) {
        grouped[topic.label] = topicArticles;
      }
    }

    return grouped;
  }
}
