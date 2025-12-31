import { Brain, Sparkles, ChevronDown } from "lucide-react";

export const HeroSection = () => {
  const scrollToResearch = () => {
    const element = document.querySelector("#research");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative pt-16">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">CS50 Final Project 2025 • Harvard University</span>
        </div>

        {/* Avatar */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <img
            src="/favicon.png"
            alt="Josef Kurk Edwards - Dr. Q"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/30 shadow-2xl mx-auto hover:border-primary/60 transition-all duration-300"
          />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Brain className="w-10 h-10 md:w-14 md:h-14 text-primary animate-glow-pulse" />
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wide animate-wow">
            <span className="text-shimmer">AI Research Portfolio</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-foreground font-medium mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Josef Kurk Edwards
        </p>
        <p className="text-primary font-medium mb-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          @DrQSatoshin
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Exploring the Frontiers of Artificial Intelligence
        </p>
        <p className="text-muted-foreground/70 max-w-xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          AI Researcher at University of Colorado Boulder • Published on TechRxiv/IEEE • 
          Specializing in Memory Architectures & Recursive Transformers
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToResearch}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/25 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          View My Research
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </div>
      </div>
    </section>
  );
};
