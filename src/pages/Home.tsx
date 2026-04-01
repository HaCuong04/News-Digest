import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Article, ArticlesResponse } from "@/src/types";
import { ArticleCard } from "@/src/components/article/ArticleCard";
import { TrendingSidebar } from "@/src/components/article/TrendingSidebar";
import { NewsletterCTA } from "@/src/components/layout/NewsletterCTA";
import { CategoryNav } from "@/src/components/layout/CategoryNav";
import { Button } from "@/src/components/ui/Button";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HUB_CATEGORIES = [
  "Technology",
  "Health",
  "Construction",
  "Consumer",
  "Manufacturing",
  "Retail",
  "Science",
  "Professional Services",
  "Travel"
];

export function Home() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "Latest";

  const [categoryArticles, setCategoryArticles] = React.useState<{[key: string]: Article[]}>({});
  const [loadingCategories, setLoadingCategories] = React.useState(false);

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

  const fetchCategoryHub = React.useCallback(async () => {
    setLoadingCategories(true);
    try {
      const newCatArticles: {[key: string]: Article[]} = {};
      
      // Fetch categories sequentially with a small delay to avoid overwhelming the API
      for (const cat of HUB_CATEGORIES) {
        try {
          const res = await fetch(`/api/articles?category=${cat}&limit=4`);
          const data = await res.json();
          newCatArticles[cat] = data.articles || [];
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error fetching category ${cat}:`, err);
          newCatArticles[cat] = [];
        }
      }
      
      setCategoryArticles(newCatArticles);
    } catch (error) {
      console.error("Error fetching category hub:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchArticles(0, category);
    if (category === "Latest") {
      fetchCategoryHub();
    }
  }, [fetchArticles, fetchCategoryHub, category]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextOffset = offset + 10;
    setOffset(nextOffset);
    fetchArticles(nextOffset, category);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
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
    <main className="container mx-auto px-4 lg:px-8 pt-[15px] pb-8">
      <CategoryNav />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Hub or Feed */}
        <div className="lg:col-span-8">
          {/* Category Hub (Only on Latest) */}
          {category === "Latest" && Object.keys(categoryArticles).length > 0 && (
            <div className="space-y-16 mb-16">
              {HUB_CATEGORIES.map((catName) => {
                const catArticles = categoryArticles[catName];
                if (!catArticles || catArticles.length === 0) return null;
                
                return (
                  <section key={catName}>
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                      <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-violet-600 rounded-full" />
                        {catName}
                      </h2>
                      <Link 
                        to={`/?category=${catName}`} 
                        className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-all hover:gap-2"
                      >
                        Explore {catName} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {catArticles.map((art) => (
                        <ArticleCard key={art.id} article={art} variant="medium" />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {category !== "Latest" && (
            <>
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{category} News</h2>
                <div className="flex gap-4 text-sm font-bold text-gray-400">
                  <button className="text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4">Newest</button>
                  {/* <button className="hover:text-gray-900 transition-colors">Popular</button> */}
                </div>
              </div>

              <div className="space-y-12">
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

              {hasMore && (
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
            </>
          )}
        </div>

        {/* Right Column: Sidebar (Always visible) */}
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
