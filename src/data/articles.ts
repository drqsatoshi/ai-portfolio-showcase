export interface Article {
  id: string;
  title: string;
  summary: string;
  link: string;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Persistent Memory Logic Loop (PMLL) Architecture: Memory Footprint Reduction in Large Language Models",
    summary: "Introduces PMLL for optimizing memory in LLMs.",
    link: "https://www.techrxiv.org/users/856117/articles/1322887-persistent-memory-logic-loop-pmll-architecture-memory-footprint-reduction-in-large-language-models",
  },
  {
    id: "2",
    title: "Enhanced Reconsideration System: A Mathematical Framework for Self-Correcting AI Memory Architecture",
    summary: "Framework for self-correcting AI with temporal decay and consensus validation.",
    link: "https://www.techrxiv.org/users/856117/articles/1324171-enhanced-reconsideration-system-a-mathematical-framework-for-self-correcting-ai-memory-architecture-with-temporal-decay-and-consensus-validation",
  },
  {
    id: "3",
    title: "The Recursive Transformer Model: Architecture, Theory, and Implementation with Persistent Memory Logic Loops",
    summary: "RTM architecture integrating PMLL for stateful transformers.",
    link: "https://www.techrxiv.org/users/856117/articles/1345789-the-recursive-transformer-model-architecture-theory-and-implementation-with-persistent-memory-logic-loops",
  },
  {
    id: "4",
    title: "The Topic Integrator: Dynamic Context Annotation via Cluster Graph Integration in Recursive Transformers",
    summary: "Dynamic annotation using cluster graphs in RTM.",
    link: "https://www.techrxiv.org/users/856117/articles/1366077-the-topic-integrator-dynamic-context-annotation-via-cluster-graph-integration-in-recursive-transformers",
  },
  {
    id: "5",
    title: "Cryptographic Complexity and P vs. NP: A Unified Analysis",
    summary: "Analysis of discrete logarithms, error matrices, and cryptographic systems.",
    link: "https://www.techrxiv.org/users/856117/articles/1323177-cryptographic-complexity-and-p-vs-np-a-unified-analysis-of-discrete-logarithms-error-matrix-verification-and-modern-cryptographic-systems",
  },
  {
    id: "6",
    title: "Supplement: Recursive Verification Depth Analysis Hermetic Proof Framework",
    summary: "Supplement for polynomial-time verification of cryptographic problems.",
    link: "https://www.techrxiv.org/users/856117/articles/1323176-supplement-recursive-verification-depth-analysis-hermetic-proof-framework-for-polynomial-time-verification-of-cryptographic-problems",
  },
];
