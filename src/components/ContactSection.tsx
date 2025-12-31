import { Github, Mail, Twitter, ExternalLink, GraduationCap } from "lucide-react";

export const ContactSection = () => {
  const links = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/drqsatoshi",
      username: "@drqsatoshi",
    },
    {
      icon: Twitter,
      label: "X (Twitter)",
      href: "https://x.com/DrQSatoshin/",
      username: "@DrQSatoshin",
    },
    {
      icon: ExternalLink,
      label: "Research Profile",
      href: "https://www.authorea.com/users/856117",
      username: "Authorea/TechRxiv",
    },
    {
      icon: GraduationCap,
      label: "EdX Profile",
      href: "https://profile.edx.org/u/Qbearycool",
      username: "Qbearycool",
    },
  ];

  return (
    <section className="mt-16 glass rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6 hover-trembl inline-block w-full">
        Contact & Links
      </h2>
      
      <div className="text-center mb-6">
        <p className="text-lg text-foreground font-medium">Josef Kurk Edwards</p>
        <p className="text-muted-foreground text-sm">
          University of Colorado Boulder • AI Researcher
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all duration-200 group"
          >
            <link.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.username}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center space-y-2">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a 
            href="mailto:joed6834@colorado.edu" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            joed6834@colorado.edu
          </a>
          <a 
            href="mailto:josefedwards29@gmail.com" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            josefedwards29@gmail.com
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-4">
          CS50 Final Project 2025 • Harvard University
        </p>
      </div>
    </section>
  );
};
