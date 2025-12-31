import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Hash } from "lucide-react";
import { articles } from "@/data/articles";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return <Navigate to="/" replace />;
  }

  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4 hover-trembl inline-block">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-primary mt-6 mb-3">
            {trimmedLine.replace('### ', '')}
          </h3>
        );
      } else if (trimmedLine.startsWith('- **')) {
        inList = true;
        const content = trimmedLine.replace('- **', '').replace('**:', ':').replace('**', '');
        const [bold, rest] = content.split(':');
        listItems.push(content);
      } else if (trimmedLine.startsWith('- ')) {
        inList = true;
        listItems.push(trimmedLine.replace('- ', ''));
      } else if (trimmedLine === '') {
        flushList();
      } else if (!inList && trimmedLine) {
        flushList();
        elements.push(
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {trimmedLine}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span key={tag} className="tag">
                <Hash className="w-3 h-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-3xl md:text-5xl text-foreground mb-6 animate-wow">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="glass rounded-2xl p-6 md:p-10 animate-fade-in">
          <p className="text-lg text-foreground/90 mb-8 pb-8 border-b border-border/50 leading-relaxed">
            {article.summary}
          </p>
          
          <div className="prose prose-invert max-w-none">
            {renderContent(article.content)}
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="mt-10 text-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore More Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
