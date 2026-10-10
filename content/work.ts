// Engineering plates and the contact sheet. IDs are public URL anchors (/work#id) — never rename them.

export type Plate = {
  id: "hardware-erp" | "procurement" | "vartalaap";
  plate: "I" | "II" | "III";
  name: string;
  system: string; // title-block "system" field
  role: string;
  period: string;
  status: string;
  stack: string[];
  thesis: string; // what holds
  lede: string;
  notes: { heading: string; body: string }[];
  link?: { href: string; label: string };
};

export const plates: Plate[] = [
  {
    id: "hardware-erp",
    plate: "I",
    name: "Hardware Store ERP",
    system: "Retail & wholesale billing",
    role: "Sole engineer",
    period: "Mar 2026 — present",
    status: "In production",
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Redis", "AWS"],
    thesis: "Everything goes through. Or nothing does.",
    lede:
      "A sale is never just a PDF. It moves stock, changes what a customer owes and lands in the books. This ERP keeps those three records in agreement — even when something fails halfway.",
    notes: [
      {
        heading: "One transaction, six steps",
        body: "Invoice creation runs as a single PostgreSQL transaction with FOR UPDATE row locks. Invoice, stock and ledger commit together or not at all — two counters can sell the last bag of cement without both succeeding.",
      },
      {
        heading: "Slow work stays out of the sale",
        body: "BullMQ workers on Redis render invoice PDFs with Puppeteer and store them privately in S3, so the counter never waits on a document. pg_trgm search finds products from partial or misspelled names.",
      },
      {
        heading: "Run where the shop runs",
        body: "Billing, inventory, pricing, unit conversion, customer ledgers and financial reports — deployed on Ubuntu with AWS RDS PostgreSQL and CloudFront.",
      },
    ],
    link: { href: "https://url-shortner-woad-tau.vercel.app/z4v3d6", label: "Visit the platform" },
  },
  {
    id: "procurement",
    plate: "II",
    name: "Procure-to-Pay platform",
    system: "Enterprise procurement workflow",
    role: "Full-stack engineer, CodeApto",
    period: "Jun 2026 — present",
    status: "Active development",
    stack: ["React", "TypeScript", "Rust / Axum", "PostgreSQL"],
    thesis: "Check the role. Check the state. Then move.",
    lede:
      "From a purchase request to a released purchase order, money only moves through gates. Each transition asks two questions before it happens: who is asking, and is this the right moment?",
    notes: [
      {
        heading: "The whole workflow",
        body: "Front-end features and backend flows across requisitions, approvals, sourcing, supplier onboarding, award decisions and purchase-order release.",
      },
      {
        heading: "Invalid transitions can't happen",
        body: "Workflow paths reject invalid status changes, duplicate actions and unauthorised PO release — enforced on the server, with tests around the main paths.",
      },
      {
        heading: "Boundaries are part of the feature",
        body: "Role-based access and tenant-specific data handling are designed in, not bolted on. This account uses only public, resume-level information about the product.",
      },
    ],
  },
  {
    id: "vartalaap",
    plate: "III",
    name: "Vartalaap",
    system: "Serverless real-time messaging",
    role: "Independent project",
    period: "Independent project",
    status: "Built and deployed",
    stack: ["Next.js", "API Gateway WebSockets", "Lambda", "DynamoDB", "Cognito", "Chime SDK"],
    thesis: "One recipient goes quiet. Everyone else still hears.",
    lede:
      "A real-time chat and calling platform on AWS-managed services. A message to a group is many deliveries, and one closed connection must not cancel the rest.",
    notes: [
      {
        heading: "Connections with identity",
        body: "Cognito-authenticated WebSocket connections carry one-to-one and group messages, with audio and video calls through the Chime SDK and push notifications.",
      },
      {
        heading: "Shaped by access patterns",
        body: "A DynamoDB single-table design follows how conversations are actually read. Fan-out uses Promise.allSettled, so a failed recipient is recorded rather than thrown.",
      },
      {
        heading: "Carried into operations",
        body: "The same habits from Technosys — EC2, Route 53, IAM, security groups, Docker and GitHub Actions — make releases repeatable and rollback boring.",
      },
    ],
  },
];

export type Print = {
  id: string;
  title: string;
  kind: string;
  date: string;
  image: { src: string; width: number; height: number; alt: string };
  description: string;
  detail: string;
  tech: string[];
  href?: string;
  diagram?: { src: string; width: number; height: number; alt: string };
  note?: string;
};

export const prints: Print[] = [
  {
    id: "shiv-cement",
    title: "Shiv Cement Store",
    kind: "Business platform · applied AI",
    date: "2025 — 2026",
    image: { src: "/work/shiv-cement.webp", width: 1600, height: 730, alt: "Shiv Cement Store website home page with product categories" },
    description:
      "Customer website, staff and admin mobile app, and the REST API between them for a cement retailer in Patna.",
    detail:
      "A multilingual RAG assistant answers in Hindi, English and Hinglish. Staff check in with GPS and a rotating QR code; uploads go to S3 behind role-based auth.",
    tech: ["Next.js", "Express", "MongoDB", "Expo", "OpenAI", "AWS S3"],
    href: "https://shiv-cement-app.vercel.app/",
    diagram: { src: "/work/shiv-cement-architecture.webp", width: 1600, height: 1173, alt: "Architecture diagram of the Shiv Cement platform: web, mobile, API, database and AI assistant" },
  },
  {
    id: "alexa",
    title: "AI-Powered Alexa Assistant",
    kind: "Voice · applied AI",
    date: "Dec 2025",
    image: { src: "/work/alexa.webp", width: 1600, height: 873, alt: "Alexa assistant project artwork" },
    description: "A serverless Alexa skill that holds a contextual conversation through OpenAI.",
    detail: "AWS Lambda and Node.js, session memory in DynamoDB, logs in CloudWatch and secrets in Systems Manager Parameter Store.",
    tech: ["AWS Lambda", "Node.js", "OpenAI", "DynamoDB"],
    href: "https://tinyurl.com/bddevjbv",
  },
  {
    id: "medscan",
    title: "MedScan AI",
    kind: "Vision · applied AI",
    date: "Earlier work",
    image: { src: "/work/medscan.webp", width: 1600, height: 903, alt: "MedScan AI interface identifying a medicine from a photo" },
    description: "Photograph a medicine strip and get a readable summary, using Gemini Vision. Web, mobile and an Android APK.",
    detail: "An information tool. Its output is not a substitute for professional medical advice.",
    tech: ["Gemini Vision", "AWS", "Next.js", "React Native"],
    href: "https://med-scan-ai-web.vercel.app/",
    note: "Not medical advice.",
  },
  {
    id: "mythos",
    title: "Mythos AI Studio",
    kind: "Creative tools",
    date: "Earlier work",
    image: { src: "/work/mythos.webp", width: 1140, height: 634, alt: "Mythos AI Studio interface turning a prompt into a narrated video" },
    description: "Turns a prompt into a narrated video through a small team of cooperating agents.",
    detail: "Image generation and video composition behind a Streamlit interface.",
    tech: ["Python", "Streamlit", "Stable Diffusion", "MoviePy"],
    href: "https://ai-img-uw5tcdkkkrpzafnnaiq8am.streamlit.app",
  },
  {
    id: "foxpop",
    title: "Foxpop.in",
    kind: "Commerce",
    date: "Earlier work",
    image: { src: "/work/foxpop.webp", width: 1600, height: 873, alt: "Foxpop makhana store promotional banner" },
    description: "An online store for makhana: catalogue, payments and a deployment pipeline.",
    detail: "MERN on AWS EC2 behind Nginx, with Razorpay for payments.",
    tech: ["MongoDB", "Express", "React", "Node.js", "AWS EC2", "Nginx", "Razorpay"],
    href: "https://foxpop.in",
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    kind: "Web utility",
    date: "Feb 2026",
    image: { src: "/work/url-shortener.webp", width: 1504, height: 568, alt: "URL shortener input form" },
    description: "Long link in, short link out. It also powers the six-character links on this domain.",
    detail: "Next.js and TypeScript on Vercel, mounted under amankeshri.com through rewrites.",
    tech: ["Next.js", "TypeScript", "Vercel"],
    href: "https://url-shortner-woad-tau.vercel.app",
  },
  {
    id: "prompt-enhancer",
    title: "Prompt Enhancer",
    kind: "Language · applied AI",
    date: "Earlier work",
    image: { src: "/work/prompt-enhancer.webp", width: 1600, height: 873, alt: "Prompt Enhancer interface" },
    description: "Rewrites a rough language-model prompt into clearer instructions.",
    detail: "A focused interface around the OpenAI API, built with Next.js.",
    tech: ["Next.js", "OpenAI", "Vercel"],
    href: "https://prompt-inhancer.vercel.app",
  },
  {
    id: "notifications",
    title: "Serverless Notification System",
    kind: "Cloud infrastructure",
    date: "Jan 2026",
    image: { src: "/work/notifications.webp", width: 1600, height: 873, alt: "Architecture of the serverless notification system on AWS" },
    description: "Event-driven email and SMS notifications, with Step Functions coordinating state and delivery.",
    detail: "Lambda, API Gateway, SNS and SES — cost-conscious and with nothing to keep running between events.",
    tech: ["AWS Lambda", "Step Functions", "SNS", "SES", "Python"],
  },
];

/** The three applied-AI prints featured on the home page as photograms. */
export const photogramIds = ["shiv-cement", "alexa", "medscan"] as const;
