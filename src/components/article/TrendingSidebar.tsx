import * as React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/src/types";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/src/lib/utils";

export function TrendingSidebar() {
  const [trending, setTrending] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/articles/trending")
      .then((res) => res.json())
      .then((data) => {
        setTrending(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-20 bg-gray-100 rounded-xl" />
    ))}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="space-y-6">
          {trending.map((article, index) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="group flex gap-4 items-start"
            >
              <span className="text-3xl font-black text-gray-100 group-hover:text-violet-100 transition-colors leading-none pt-1">
                0{index + 1}
              </span>
              <div>
                <h4 className="text-[11px] font-bold text-gray-900 group-hover:text-violet-600 transition-colors leading-tight mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{formatDate(article.published_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-600 rounded-full opacity-20 blur-2xl"></div>
        <h3 className="text-lg font-bold mb-2 relative z-10">Premium Access</h3>
        <p className="text-gray-400 text-sm mb-6 relative z-10">
          Get unlimited access to investigative reports and expert analysis.
        </p>
        <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors relative z-10">
          Go Premium <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
