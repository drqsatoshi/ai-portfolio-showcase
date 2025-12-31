import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ArticleCard } from "@/components/ArticleCard";
import { ContactSection } from "@/components/ContactSection";
import { articles } from "@/data/articles";
import { FileQuestion } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    
    const query = searchQuery.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pb-16">
        <Header />
        
        {/* Search Section */}
        <div className="mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          
          {searchQuery && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Found <span className="text-primary font-medium">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                index={index}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileQuestion className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No articles found
            </h3>
            <p className="text-muted-foreground/70">
              Try adjusting your search terms
            </p>
          </div>
        )}

        {/* Contact Section */}
        <ContactSection />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground/60">
          <p>Built with React & TypeScript • CS50 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
