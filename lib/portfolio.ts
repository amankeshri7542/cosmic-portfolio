// Public facts reconciled against the September 2026 resume and existing portfolio.
export const profile = {
  name: "Aman Kumar",
  email: "amankeshri7479@gmail.com",
  github: "https://github.com/amankeshri7542",
  linkedin: "https://www.linkedin.com/in/aman-kumar-keshri",
  resume: "/amankeshridotcom.pdf",
};
export const studies = [
  {
    id: "hardware-erp",
    phase: "Build",
    type: "Production business software",
    title: "One invoice. Every part in agreement.",
    name: "Hardware Store ERP",
    date: "Mar 2026 — present",
    summary:
      "Billing is never just a PDF. It changes stock, customer balances and the books. I built a retail and wholesale ERP that keeps those pieces together.",
    stack: "React · Node.js · PostgreSQL · Redis · AWS",
    details: [
      [
        "Keep the transaction whole",
        "Invoice creation uses a six-step PostgreSQL transaction with FOR UPDATE row locking. Invoice, stock and ledger updates succeed together, avoiding partial business records.",
      ],
      [
        "Move slow work out of the way",
        "BullMQ and Redis workers generate PDFs with Puppeteer, then store them privately in S3. PostgreSQL pg_trgm search supports partial and misspelled product names.",
      ],
      [
        "Run it in the real world",
        "Billing, inventory, pricing, unit conversion, customer ledgers and financial reports, deployed on Ubuntu with AWS RDS PostgreSQL and CloudFront.",
      ],
    ],
    flow: ["Invoice", "Stock", "Ledger"],
    invariant: "One transaction. Commit together.",
    link: "https://url-shortner-woad-tau.vercel.app/z4v3d6",
    linkLabel: "Visit the platform",
  },
  {
    id: "procurement",
    phase: "Understand",
    type: "Current engineering · CodeApto",
    title: "A workflow is only as strong as its boundaries.",
    name: "Procure-to-Pay platform",
    date: "Jun 2026 — present",
    summary:
      "At CodeApto, I work across an enterprise procurement product: from purchase requests and supplier onboarding to approvals, sourcing and purchase-order release.",
    stack: "React · TypeScript · Rust / Axum · PostgreSQL",
    details: [
      [
        "Connect the whole workflow",
        "Building frontend features and backend flows across purchase requisitions, approvals, sourcing, supplier onboarding, award decisions and purchase-order release.",
      ],
      [
        "Make invalid transitions impossible",
        "Improved workflow paths to prevent invalid status changes, duplicate actions and unauthorized PO release, with tests around the main paths.",
      ],
      [
        "Respect the boundary",
        "Role-based access, tenant-specific data handling and workflow rules are part of the feature, not something added after the interface. This account uses only public resume-level information.",
      ],
    ],
    flow: ["Request", "Approve", "Release"],
    invariant: "Every transition checks its permission.",
    link: "",
    linkLabel: "",
  },
  {
    id: "vartalaap",
    phase: "Ship & operate",
    type: "Serverless communication",
    title: "Conversations move. Failures stay contained.",
    name: "Vartalaap",
    date: "Independent project",
    summary:
      "A real-time communication platform built around authenticated connections, clear data access patterns and message delivery that can tolerate an individual failure.",
    stack: "Next.js · Lambda · DynamoDB · Cognito · Chime SDK",
    details: [
      [
        "A connection with an identity",
        "Authenticated WebSocket connections support one-to-one and group messaging, with audio/video calls and push notifications using AWS-managed services.",
      ],
      [
        "Design around access patterns",
        "DynamoDB single-table access patterns underpin the communication backend. Parallel fan-out with Promise.allSettled keeps one failed recipient from stopping the rest of the broadcast.",
      ],
      [
        "Carry the work into operations",
        "My deployment experience also includes AWS EC2, Route 53, IAM and Security Groups at Technosys, with Docker and GitHub Actions workflows for repeatable releases and simpler rollback.",
      ],
    ],
    flow: ["Authenticate", "Persist", "Fan out"],
    invariant: "One failed recipient ≠ a failed broadcast.",
    link: "",
    linkLabel: "",
  },
];
export const archive = [
  {
    id: "shiv-cement",
    title: "Shiv Cement Store",
    kind: "Business platform",
    date: "2025 — 2026",
    image: "/shivtraders.png",
    description:
      "A customer website, staff/admin mobile app and REST API for a cement retailer. Product enquiries, quotations and staff workflows connect across web and mobile.",
    detail:
      "Includes a multilingual RAG assistant, GPS and rotating-QR attendance, role-based authentication and S3 uploads. Existing architecture artwork is retained.",
    tech: "Next.js · Express · MongoDB · Expo · OpenAI · AWS S3",
    href: "https://shiv-cement-app.vercel.app/",
    diagram: "/diagram-export-18-04-2026-22_29_24.png",
  },
  {
    id: "alexa",
    title: "AI-Powered Alexa Assistant",
    kind: "Voice / AI",
    date: "2025",
    image: "/alexaAI.png",
    description:
      "A serverless voice assistant connecting Alexa to OpenAI for contextual conversations, with session persistence in DynamoDB.",
    detail:
      "Built with AWS Lambda and Node.js, with CloudWatch and secrets held in Systems Manager Parameter Store.",
    tech: "AWS Lambda · Node.js · OpenAI · DynamoDB",
    href: "https://tinyurl.com/bddevjbv",
    diagram: "",
  },
  {
    id: "mythos",
    title: "Mythos AI Studio",
    kind: "Creative tools",
    date: "Archive",
    image: "/mythos.jpeg",
    description:
      "An AI storytelling experiment that turns prompts into narrated videos through multi-agent orchestration.",
    detail:
      "Combines image generation and video composition in a Streamlit interface.",
    tech: "Python · Streamlit · Stable Diffusion · MoviePy",
    href: "https://ai-img-uw5tcdkkkrpzafnnaiq8am.streamlit.app",
    diagram: "",
  },
  {
    id: "foxpop",
    title: "Foxpop.in",
    kind: "Commerce",
    date: "Archive",
    image: "/foxpop.png",
    description:
      "An e-commerce platform for makhana, with a product catalogue, secure payments and deployment pipelines.",
    detail:
      "Built on the MERN stack and deployed with AWS EC2 and Nginx, with Razorpay for payments.",
    tech: "MERN · AWS EC2 · Nginx · Razorpay",
    href: "https://foxpop.in",
    diagram: "",
  },
  {
    id: "medscan",
    title: "MedScan AI",
    kind: "Vision / AI",
    date: "Archive",
    image: "/image.png",
    description:
      "An image-and-text medication information tool, using Gemini Vision to identify medicines and present readable summaries.",
    detail:
      "A web and mobile project, also distributed as an APK. It is an information tool; its output is not a substitute for professional medical advice.",
    tech: "Gemini Vision · AWS · Next.js · React Native",
    href: "https://med-scan-ai-web.vercel.app/",
    diagram: "",
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    kind: "Web utility",
    date: "Archive",
    image: "/url.png",
    description:
      "A small, focused utility: turn a long URL into a short, shareable link.",
    detail: "Built with Next.js and TypeScript, deployed on Vercel.",
    tech: "Next.js · TypeScript · Vercel",
    href: "https://url-shortner-woad-tau.vercel.app",
    diagram: "",
  },
  {
    id: "prompt-enhancer",
    title: "Prompt Enhancer",
    kind: "Language / AI",
    date: "Archive",
    image: "/prompt.png",
    description:
      "A utility for refining language-model prompts into clearer instructions.",
    detail: "A focused interface around the OpenAI API, built with Next.js.",
    tech: "Next.js · OpenAI · Vercel",
    href: "https://prompt-inhancer.vercel.app",
    diagram: "",
  },
  {
    id: "notifications",
    title: "Serverless Notification System",
    kind: "Cloud infrastructure",
    date: "Archive",
    image: "/aws-serverless.png",
    description:
      "An event-driven architecture for email and SMS notifications, with Step Functions coordinating state and delivery logic.",
    detail:
      "A cost-conscious serverless project built with Lambda, API Gateway, SNS and SES. The original architecture image remains available here.",
    tech: "AWS Lambda · Step Functions · SNS · SES · Python",
    href: "",
    diagram: "/aws-serverless.png",
  },
];
