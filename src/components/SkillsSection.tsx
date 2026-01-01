import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Award, Code2, Brain, Database, Terminal } from "lucide-react";

const skillCategories = [
  {
    icon: Code2,
    title: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "SQL", "C"],
  },
  {
    icon: Brain,
    title: "AI/ML Frameworks",
    skills: ["TensorFlow", "PyTorch", "Scikit-learn", "Hugging Face", "LangChain"],
  },
  {
    icon: Terminal,
    title: "Web Development",
    skills: ["React", "Flask", "Node.js", "Tailwind CSS", "REST APIs"],
  },
  {
    icon: Database,
    title: "Tools & Platforms",
    skills: ["Git", "Docker", "AWS", "PostgreSQL", "Jupyter"],
  },
];

export const SkillsSection = () => {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-display font-bold text-center text-foreground mb-4">
        Skills & Technologies
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Technical expertise spanning AI research, full-stack development, and data science
      </p>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {skillCategories.map((category) => (
          <Card key={category.title} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/70"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CS50 Certificate */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 rounded-full bg-primary/10 shrink-0">
              <Award className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-foreground mb-1">
                CS50: Introduction to Computer Science
              </h3>
              <p className="text-muted-foreground mb-1">
                Harvard University via edX
              </p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Josef Kurk Edwards • Verified Certificate
              </p>
              <Button asChild variant="outline" className="gap-2">
                <a 
                  href="https://certificates.cs50.io/da27c265-f12e-4ac8-b109-af83c7d70379.pdf?size=letter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Certificate
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
