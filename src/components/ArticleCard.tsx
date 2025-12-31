import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import type { Article } from "@/data/articles";

interface ArticleCardProps {
  article: Article;
  index: number;
  searchQuery: string;
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
};

export const ArticleCard = ({ article, index, searchQuery }: ArticleCardProps) => {
  return (
    <Link 
      to={`/article/${article.id}`}
      className="block animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <article className="article-card hover-twist group h-full">
        <div className="relative z-10">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors hover-trembl">
            {highlightText(article.title, searchQuery)}
          </h2>

          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {highlightText(article.summary, searchQuery)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
              <span className="mx-2">•</span>
              <span>{new Date(article.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
