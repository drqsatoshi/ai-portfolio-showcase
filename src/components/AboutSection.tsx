import { Brain, Lightbulb, BookOpen, Code } from "lucide-react";

export const AboutSection = () => {
  const highlights = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Research in persistent memory architectures and recursive transformers",
    },
    {
      icon: Code,
      title: "Software Engineering",
      description: "Full-stack development with Python, React, and modern web technologies",
    },
    {
      icon: BookOpen,
      title: "Academic Research",
      description: "Published preprints on TechRxiv/IEEE covering computational complexity",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Developing novel frameworks for self-correcting AI memory systems",
    },
  ];

  return (
    <section className="mt-16 glass rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center text-foreground mb-8 hover-trembl inline-block w-full">
        About Me
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <img
              src="/favicon.png"
              alt="Josef Kurk Edwards - Dr. Q"
              className="w-40 h-40 rounded-full border-4 border-primary/30 shadow-lg group-hover:border-primary/60 transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Bio Content */}
        <div className="flex-1 text-center lg:text-left">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Josef Kurk Edwards
          </h3>
          <p className="text-primary font-medium mb-1">@DrQSatoshin</p>
          <p className="text-muted-foreground text-sm mb-4">
            University of Colorado Boulder • AI Researcher & CS50 Student
          </p>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            I'm an AI researcher and software engineer passionate about advancing machine learning 
            architectures. My work focuses on developing innovative memory systems for large language 
            models, including the Persistent Memory Logic Loop (PMLL) and Recursive Transformer Model (RTM). 
            Currently pursuing research at the intersection of computational complexity and artificial 
            intelligence, with published preprints on TechRxiv/IEEE.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            This portfolio represents my CS50 Final Project at Harvard, showcasing both my web development 
            skills and my research contributions to the AI community. I believe in open science and 
            making complex AI concepts accessible to everyone.
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all duration-200 group text-center"
          >
            <item.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-foreground text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
