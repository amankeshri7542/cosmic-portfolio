// Public facts, reconciled against the September 2026 resume (public/amankeshridotcom.pdf).
// Keep this file factual: no metrics that are not on the resume, nothing proprietary from employers.

export const SITE_URL = "https://www.amankeshri.com";

export const profile = {
  name: "Aman Kumar",
  handle: "amankeshri",
  role: "Full-stack software engineer",
  location: "Bengaluru, India",
  coords: { lat: 12.97, lon: 77.59 },
  email: "amankeshri7479@gmail.com",
  github: "https://github.com/amankeshri7542",
  linkedin: "https://www.linkedin.com/in/aman-kumar-keshri",
  resume: "/amankeshridotcom.pdf",
  summary:
    "Freelance full-stack developer in Bengaluru. I build the interface, the API, the data model and the cloud it runs on, and add applied AI where it earns its place.",
} as const;

export type Role = {
  org: string;
  title: string;
  period: string;
  start: string; // ISO month, for ordering and structured data
  end?: string;
  place: string;
  points: string[];
};

export const experience: Role[] = [
  {
    org: "CodeApto India",
    title: "Full-stack software engineering intern",
    period: "Jun 2026 — present",
    start: "2026-06",
    place: "Bengaluru",
    points: [
      "Building an end-to-end Procure-to-Pay platform: requisitions, approvals, sourcing, supplier onboarding, award decisions and purchase-order release.",
      "React and TypeScript on the front end; Rust (Axum) and PostgreSQL behind it, with role-based access and tenant-specific data.",
      "Hardened workflow paths against invalid status changes, duplicate actions and unauthorised PO release, with tests around the main paths.",
    ],
  },
  {
    org: "Shiv Cement Store",
    title: "Contract backend and AWS cloud engineer",
    period: "Aug 2025 — Mar 2026",
    start: "2025-08",
    end: "2026-03",
    place: "Patna, Bihar",
    points: [
      "Customer website, staff and admin mobile app, and the REST API that connects them.",
      "A multilingual (Hindi, English, Hinglish) RAG assistant, GPS and rotating-QR attendance, role-based auth and S3 uploads.",
    ],
  },
  {
    org: "Technosys IT Management",
    title: "Cloud and full-stack engineering intern",
    period: "Feb 2025 — Aug 2025",
    start: "2025-02",
    end: "2025-08",
    place: "Remote",
    points: [
      "Migrated a client web application to AWS EC2 with Route 53, IAM roles and security groups.",
      "Built Docker and GitHub Actions workflows for repeatable releases and simpler rollback.",
    ],
  },
];

export const education = {
  degree: "B.E. Computer Science",
  school: "JSS Academy of Technical Education, Bengaluru",
  period: "2021 — 2025",
};

export const credentials = [
  { name: "AWS Certified Solutions Architect — Associate (SAA-C03)", date: "Feb 2026" },
  { name: "Advanced Certification in Cloud Computing & DevOps, E&ICT Academy, IIT Guwahati", date: "Apr 2026" },
  { name: "AWS Certified Cloud Practitioner", date: "Oct 2025" },
  { name: "CODEATHON — 3rd place, JSS Academy of Technical Education", date: "Mar 2023" },
];

export const stack = {
  "Interface": ["React", "Next.js", "TypeScript", "HTML & CSS", "React Native / Expo"],
  "Services": ["Node.js", "Express", "Rust / Axum", "REST", "WebSockets", "JWT"],
  "Data": ["PostgreSQL", "MongoDB", "Redis", "DynamoDB"],
  "Cloud": ["EC2", "S3", "RDS", "Lambda", "API Gateway", "CloudFront", "Route 53", "IAM", "VPC", "CloudWatch"],
  "Delivery": ["Docker", "GitHub Actions", "Nginx", "Linux"],
  "Applied AI": ["OpenAI", "RAG", "Gemini Vision"],
} as const;
