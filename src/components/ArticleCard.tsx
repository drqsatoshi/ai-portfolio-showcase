import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
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
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <article className="article-card hover-twist group h-full">
        <div className="relative z-10">
          {/* Title */}
          <h2 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors hover-trembl leading-tight">
            {highlightText(article.title, searchQuery)}
          </h2>

          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {highlightText(article.summary, searchQuery)}
          </p>

          {/* Link to TechRxiv */}
          <a 
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Read on TechRxiv
          </a>
        </div>
      </article>
    </div>
  );
};
