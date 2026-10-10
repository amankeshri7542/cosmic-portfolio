// "Build a product with me": the home page story. One product is built as you scroll; each step names the
// tools, what I actually know about them, and the real project where I did it. Facts only — see content/profile.ts.

export type Tool = { name: string; logo?: string; invert?: boolean };
export type Chapter = {
  id: string;
  step: number;
  label: string;
  title: string;
  body: string;
  know: string[];
  tools: Tool[];
  builtIn: { name: string; href: string }[];
  log: string[]; // what the build terminal prints during this step
};

export const chapters: Chapter[] = [
  {
    id: "interface",
    step: 1,
    label: "Interface",
    title: "Start with what people touch.",
    body:
      "I design screens around the job someone is doing — a cashier making a bill, a manager approving a purchase. React and Next.js on the web, and the same API feeding a React Native app for staff.",
    know: ["Server-rendered React for fast first loads", "Forms that validate and never lose input", "One API serving web and mobile"],
    tools: [
      { name: "React", logo: "react" },
      { name: "Next.js", logo: "nextjs", invert: true },
      { name: "TypeScript", logo: "typescript" },
      { name: "Tailwind CSS", logo: "tailwindcss" },
      { name: "React Native" },
    ],
    builtIn: [
      { name: "Shiv Cement Store", href: "/work#shiv-cement" },
      { name: "MedScan AI", href: "/work#medscan" },
      { name: "Foxpop.in", href: "/work#foxpop" },
    ],
    log: ["$ npx create-next-app billing --ts", "✓ ui: invoice screen, product search, totals"],
  },
  {
    id: "api",
    step: 2,
    label: "API",
    title: "Then the contract between screen and data.",
    body:
      "Every request is checked before it changes anything: who is asking, whether they’re allowed, and whether this is the right moment. I build these services in Node.js and in Rust with Axum.",
    know: ["Role-based access and tenant isolation", "Guarded workflow transitions — no skipped steps", "JWT and Cognito auth, WebSockets for real time"],
    tools: [
      { name: "Node.js", logo: "nodejs" },
      { name: "Express", logo: "express", invert: true },
      { name: "Rust · Axum", logo: "rust", invert: true },
      { name: "REST" },
      { name: "WebSockets" },
    ],
    builtIn: [
      { name: "Procure-to-Pay (CodeApto)", href: "/work#procurement" },
      { name: "Vartalaap", href: "/work#vartalaap" },
      { name: "Shiv Cement API", href: "/work#shiv-cement" },
    ],
    log: ["POST /invoices  → auth ✓ role ✓ state ✓", "201 Created"],
  },
  {
    id: "data",
    step: 3,
    label: "Data",
    title: "Make the data agree with itself.",
    body:
      "One sale writes an invoice, moves stock and updates a customer ledger — inside a single PostgreSQL transaction with row locks, so all of it happens or none of it does. Slow work, like PDFs, goes to a queue.",
    know: ["BEGIN … SELECT … FOR UPDATE … COMMIT", "pg_trgm search for misspelled product names", "BullMQ workers on Redis", "DynamoDB single-table design"],
    tools: [
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "Redis", logo: "redis" },
      { name: "MongoDB", logo: "mongodb" },
      { name: "DynamoDB", logo: "dynamodb" },
    ],
    builtIn: [
      { name: "Hardware Store ERP", href: "/work#hardware-erp" },
      { name: "Vartalaap", href: "/work#vartalaap" },
    ],
    log: ["BEGIN; SELECT qty … FOR UPDATE;", "INSERT invoice · UPDATE stock · INSERT ledger", "COMMIT;  queue → pdf.render"],
  },
  {
    id: "ship",
    step: 4,
    label: "Ship",
    title: "Package it, test it, put it in the cloud.",
    body:
      "Containers with Docker, pipelines in GitHub Actions, and AWS underneath — EC2 and RDS, S3 and CloudFront, Lambda when it should be serverless. Releases are repeatable and rollbacks are boring.",
    know: ["AWS Certified Solutions Architect – Associate", "IAM, VPC, Route 53, security groups", "Lambda, API Gateway, Step Functions, SNS, SES"],
    tools: [
      { name: "Docker", logo: "docker" },
      { name: "GitHub Actions", logo: "githubactions" },
      { name: "AWS", logo: "aws", invert: true },
      { name: "Nginx", logo: "nginx" },
      { name: "Linux", logo: "linux" },
    ],
    builtIn: [
      { name: "Hardware Store ERP (RDS · CloudFront)", href: "/work#hardware-erp" },
      { name: "Serverless Notification System", href: "/work#notifications" },
      { name: "Technosys — EC2 migration", href: "/about#experience" },
    ],
    log: ["git push → test ✓ build ✓", "docker push · deploy → ap-south-1 ✓"],
  },
  {
    id: "ai",
    step: 5,
    label: "Applied AI",
    title: "Then make it smarter — where it helps.",
    body:
      "An assistant that answers from the shop’s own data in Hindi, English or Hinglish. A voice assistant on Alexa. Medicine identification from a photo. AI inside the product, not bolted on beside it.",
    know: ["Retrieval-augmented generation over business data", "Prompting, context and session memory", "Vision models for real-world photos"],
    tools: [
      { name: "OpenAI" },
      { name: "RAG" },
      { name: "Gemini Vision" },
      { name: "Python", logo: "python" },
    ],
    builtIn: [
      { name: "Shiv Cement RAG assistant", href: "/work#shiv-cement" },
      { name: "AI-Powered Alexa Assistant", href: "/work#alexa" },
      { name: "MedScan AI", href: "/work#medscan" },
    ],
    log: ["ask: “OPC 53 ka stock kitna hai?”", "retrieve → stock, godowns · answer ✓"],
  },
  {
    id: "run",
    step: 6,
    label: "Run",
    title: "And then I keep it running.",
    body:
      "That’s the whole product — interface, API, data, cloud and AI. The part I care about most is the bad day: the failed payment, the dropped connection, the deploy that needs to roll back.",
    know: ["Failures contained, not spread", "Logs and metrics in CloudWatch", "Repeatable releases, simple rollbacks"],
    tools: [],
    builtIn: [],
    log: ["health: ok · all services green", "deployed ✓"],
  },
];
