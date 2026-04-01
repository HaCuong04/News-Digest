import * as React from "react";
import { useParams } from "react-router-dom";
import { Article, ArticlesResponse } from "@/src/types";
import { ArticleCard } from "@/src/components/article/ArticleCard";
import { TrendingSidebar } from "@/src/components/article/TrendingSidebar";
import { NewsletterCTA } from "@/src/components/layout/NewsletterCTA";
import { Button } from "@/src/components/ui/Button";
import { Loader2 } from "lucide-react";

export function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);

  const fetchArticles = React.useCallback(async (currentOffset: number, currentCategory: string) => {
    try {
      const res = await fetch(`/api/articles?category=${currentCategory}&limit=10&offset=${currentOffset}`);
      const data: ArticlesResponse = await res.json();
      setArticles((prev) => {
        const newArticles = data?.articles || [];
        return currentOffset === 0 ? newArticles : [...prev, ...newArticles];
      });
      setHasMore(data?.hasMore || false);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchArticles(0, category || "Latest");
    window.scrollTo(0, 0);
  }, [category, fetchArticles]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextOffset = offset + 10;
    setOffset(nextOffset);
    fetchArticles(nextOffset, category || "Latest");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-40 flex justify-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  // Group articles by date
  const groupedArticles = articles
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .reduce((groups: { [key: string]: Article[] }, article) => {
      const date = new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(article);
      return groups;
    }, {});

  const sortedDates = Object.keys(groupedArticles).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12">
      <header className="mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-5xl font-black text-gray-900 capitalize tracking-tight mb-4">
          {category}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          The latest stories, expert analysis, and deep dives in {category}. 
          Stay informed with our curated selection of top headlines.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8">
          <div className="space-y-8 lg:space-y-10">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 whitespace-nowrap">
                    {date}
                  </h3>
                  <div className="h-px w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {groupedArticles[date].map((art) => (
                    <ArticleCard key={art.id} article={art} variant="medium" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasMore && articles.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More Articles
              </Button>
            </div>
          )}

          {articles.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No articles found in this category.
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-12">
            <TrendingSidebar />
            <NewsletterCTA />
          </div>
        </aside>
      </div>
    </main>
  );
}
