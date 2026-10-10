// "Let's build yours": what a visitor might need, how Aman would approach it, and where he's done it before.
export type Need = { id: string; label: string; stack: string[]; proof: { name: string; href: string } };

export const needs: Need[] = [
  { id: "website", label: "Customer website", stack: ["Next.js", "React", "TypeScript"], proof: { name: "Shiv Cement Store", href: "/work#shiv-cement" } },
  { id: "dashboard", label: "Admin dashboard", stack: ["React", "TypeScript", "PostgreSQL"], proof: { name: "Hardware Store ERP", href: "/work#hardware-erp" } },
  { id: "mobile", label: "Mobile app", stack: ["React Native", "Expo", "REST API"], proof: { name: "Shiv Cement staff app", href: "/work#shiv-cement" } },
  { id: "billing", label: "Billing & inventory", stack: ["PostgreSQL transactions", "Redis queues", "PDF workers"], proof: { name: "Hardware Store ERP", href: "/work#hardware-erp" } },
  { id: "workflow", label: "Approvals & workflows", stack: ["Rust / Axum", "Role-based access", "State machines"], proof: { name: "Procure-to-Pay platform", href: "/work#procurement" } },
  { id: "realtime", label: "Real-time chat or calls", stack: ["WebSockets", "AWS Lambda", "DynamoDB"], proof: { name: "Vartalaap", href: "/work#vartalaap" } },
  { id: "ai", label: "AI assistant", stack: ["RAG", "OpenAI", "Your own data"], proof: { name: "Shiv Cement RAG assistant", href: "/work#shiv-cement" } },
  { id: "cloud", label: "Move to AWS", stack: ["Docker", "GitHub Actions", "EC2 · RDS · S3"], proof: { name: "Technosys migration", href: "/about#experience" } },
];
