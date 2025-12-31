import { Brain, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="text-center py-12 md:py-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm text-muted-foreground">CS50 Final Project</span>
      </div>
      
      <div className="flex items-center justify-center gap-4 mb-4">
        <Brain className="w-10 h-10 md:w-12 md:h-12 text-primary animate-glow-pulse" />
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wide animate-wow">
          <span className="text-shimmer">AI Research Portfolio</span>
        </h1>
      </div>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
        Exploring the Frontiers of Artificial Intelligence
      </p>
      
      <p className="text-sm text-muted-foreground/70">
        by <span className="text-primary font-medium">Josef Kurk Edwards</span>
      </p>
    </header>
  );
};
