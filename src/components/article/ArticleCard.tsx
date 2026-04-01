import { Link } from "react-router-dom";
import { Article } from "@/src/types";
import { Badge } from "@/src/components/ui/Badge";
import { formatDate, cn } from "@/src/lib/utils";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant?: "small" | "medium" | "large" | "horizontal";
}

export function ArticleCard({ article, variant = "medium" }: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <Link 
        to={`/article/${article.id}?category=${encodeURIComponent(article.category)}`} 
        className="group cursor-pointer bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-row h-auto md:h-48 items-stretch"
      >
        <div className="w-1/3 max-w-60 shrink-0 relative overflow-hidden bg-gray-100 border-r border-gray-200">
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-4 md:p-6 flex flex-col flex-1 justify-center">
          <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
            {article.title}
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 line-clamp-3">
            <span className="text-violet-500 font-bold mr-2">✨ AI Summary:</span>
            {article.description}
          </p>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
              {article.category}
            </span>
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "large") {
    return (
      <Link to={`/article/${article.id}`} className="group block relative overflow-hidden rounded-3xl bg-gray-900 aspect-[16/9] md:aspect-[21/9]">
        <img
          src={article.image_url}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl">
          <Badge variant="accent" className="mb-4 bg-violet-600 text-white border-none">
            {article.category}
          </Badge>
          <h2 className="text-lg md:text-2xl font-black text-white mb-3 leading-tight tracking-tight">
            {article.title}
          </h2>
          <p className="text-gray-300 text-lg mb-6 line-clamp-2 hidden md:block max-w-2xl">
            {article.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="font-bold text-white">{article.author}</span>
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group block">
      <div className={cn(
        "overflow-hidden rounded-2xl mb-4 relative",
        variant === "small" ? "aspect-square" : "aspect-[4/3]"
      )}>
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-none shadow-sm">
            {article.category}
          </Badge>
        </div>
      </div>
      <h3 className={cn(
        "font-black text-gray-900 mb-2 group-hover:text-violet-600 transition-colors leading-tight",
        variant === "small" ? "text-xs" : "text-sm"
      )}>
        {article.title}
      </h3>
      {variant !== "small" && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {article.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="font-semibold text-gray-700">{article.author}</span>
        <span>{formatDate(article.published_at)}</span>
      </div>
    </Link>
  );
}
