export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  popularity_score: number;
  reading_time: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  hasMore: boolean;
}
