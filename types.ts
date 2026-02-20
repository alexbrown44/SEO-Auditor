
export interface Competitor {
  url: string;
  name: string;
  isCustom?: boolean;
}

export interface SiteMetrics {
  url: string;
  name: string;
  marketAlignment: number; // 0-100
  seoAuthority: number; // 0-100
  strengths: string[];
  weaknesses: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  difficulty: number;
  volume: string;
  likelihoodToRank: number; // 0-100
  relevance: string;
}

export interface ContentBrief {
  keyword: string;
  h1: string;
  h2s: string[];
}

export interface SeoAnalysisResults {
  metrics: SiteMetrics[];
  contentGaps: string[];
  keywordSuggestions: KeywordSuggestion[];
  technicalWins: string[];
  contentBriefs: ContentBrief[];
}

export type AppPhase = 'INPUT' | 'COMPETITOR_SELECTION' | 'ANALYSIS_LOADING' | 'DASHBOARD';
