import type { InfoPageProps } from "@/components/layout/InfoPage";

export const pages: Record<string, InfoPageProps> = {
  // Products
  "sms": {
    title: "School Management System",
    subtitle: "A modern, end-to-end platform to run your school operations.",
    intro: "Our School Management System brings together admissions, attendance, academics, fees, communication and reporting in a single, easy-to-use cloud platform built for schools of every size.",
    sections: [
      { heading: "Built for everyone in school", body: "Administrators get powerful dashboards and reports, teachers get simple tools for attendance and assessments, parents get real-time updates on their children, and students get a clean portal for assignments, schedules and results." },
      { heading: "Designed for real classrooms", body: "From single-campus institutions to multi-branch chains, the platform scales to thousands of students with role-based access, bulk operations and automated workflows that save hours each week." },
    ],
    features: ["Admissions and student records", "Attendance and timetable", "Exams, grading and report cards", "Fee collection and accounting", "Parent and teacher communication", "Cloud-hosted, mobile-friendly"],
  },
  "ems": {
    title: "Election Management System",
    subtitle: "Plan, execute and monitor elections with full transparency.",
    intro: "Our Election Management System helps organisations conduct fair, auditable elections — internal corporate ballots, society and association polls, student elections and more — all from a secure web platform.",
    sections: [
      { heading: "Secure by design", body: "Encrypted ballots, role-based access, detailed audit trails and tamper-evident logs ensure that every vote can be traced for compliance while keeping voter identity private where required." },
      { heading: "From nomination to result", body: "Manage the entire cycle: candidate nominations, voter rolls, ballot configuration, live voting, real-time monitoring and instant result publication with shareable certificates." },
    ],
    features: ["Voter registration and verification", "Configurable ballots and constituencies", "Secure online voting", "Live monitoring dashboards", "Auditable result reports", "Multi-channel notifications"],
  },
  "tender-alerts": {
    title: "Tender Alerts",
    subtitle: "Never miss a relevant tender or RFP again.",
    intro: "Tender Alerts continuously scans hundreds of public and private sources, filters them against your business profile, and delivers a daily, prioritised list of opportunities straight to your inbox or dashboard.",
    sections: [
      { heading: "Smart filtering", body: "Set up your sectors, locations, budget ranges and keywords once. Our matching engine learns from your interactions and improves relevance over time so your team can focus only on the tenders that matter." },
      { heading: "Built for bidding teams", body: "Track tender lifecycles, attach internal notes, assign owners, manage deadlines and never miss a submission window with proactive reminders." },
    ],
    features: ["Daily curated tender feed", "Keyword and sector filters", "Saved searches and alerts", "Team collaboration tools", "Deadline reminders", "Exportable reports"],
  },
  "foa": {
    title: "Food Ordering App",
    subtitle: "A complete food ordering platform for restaurants and cloud kitchens.",
    intro: "Launch your branded ordering experience across web, iOS and Android in weeks, with all the tools you need to manage menus, accept orders, dispatch deliveries and grow your customer base.",
    sections: [
      { heading: "End-to-end ordering", body: "Customers browse menus, customise items, pay online and track orders live. Restaurants get a real-time kitchen display, order queue and printable tickets. Managers see daily reports and trends." },
      { heading: "Built to grow with you", body: "Add multiple outlets, support delivery and pickup, run promotions, collect ratings, integrate loyalty programmes and connect with leading delivery partners." },
    ],
    features: ["Customer apps (iOS and Android)", "Restaurant kitchen dashboard", "Online payments and refunds", "Multi-outlet management", "Promotions and loyalty", "Delivery and pickup support"],
  },

  // Services
  "ai": {
    title: "Artificial Intelligence",
    subtitle: "Practical AI solutions that move your business metrics.",
    intro: "We design and deploy AI systems that solve concrete business problems — from intelligent automation and document processing to recommendation engines, computer vision and conversational assistants.",
    sections: [
      { heading: "From idea to production", body: "Our team handles the full AI lifecycle: data strategy, model selection or development, evaluation, deployment and monitoring — so your AI keeps performing well after launch." },
      { heading: "Modern, responsible AI", body: "We use state-of-the-art models including generative AI, with strong guardrails around accuracy, privacy and bias so your solution is safe, explainable and trustworthy." },
    ],
    features: ["Generative AI and LLM applications", "Computer vision systems", "Predictive analytics", "Intelligent automation", "Conversational assistants", "MLOps and monitoring"],
  },
  "blockchain": {
    title: "Blockchain",
    subtitle: "Trustworthy, verifiable systems powered by distributed ledgers.",
    intro: "We build production-grade blockchain solutions — smart contracts, tokenised assets, supply-chain traceability, digital identity and decentralised applications — on the platforms that fit your goals.",
    sections: [
      { heading: "The right chain for the job", body: "Whether you need Ethereum, Polygon, Hyperledger or a custom permissioned network, our architects choose the technology that best matches your performance, cost and governance needs." },
      { heading: "From PoC to production", body: "We move beyond proofs-of-concept: secure smart contracts, audited code, robust off-chain integrations and the operational tooling needed to run blockchain systems in the real world." },
    ],
    features: ["Smart contract development and audit", "Tokenisation and NFT platforms", "Supply chain traceability", "Decentralised identity (DID)", "Wallet and dApp integration", "Permissioned networks"],
  },
  "iot": {
    title: "Internet of Things",
    subtitle: "Connect, monitor and control devices at scale.",
    intro: "We design end-to-end IoT solutions — from device firmware and connectivity to cloud platforms and dashboards — that turn physical assets into intelligent, data-driven systems.",
    sections: [
      { heading: "Hardware to cloud", body: "Our engineers work across the stack: edge firmware, communication protocols (MQTT, BLE, LoRa, cellular), gateways, secure cloud ingestion, analytics and user-facing applications." },
      { heading: "Reliable at scale", body: "We design for the realities of the field — intermittent networks, constrained devices, security, OTA updates and long-term maintenance — so your fleet keeps running smoothly." },
    ],
    features: ["Edge firmware and gateways", "Secure connectivity", "Real-time telemetry dashboards", "Remote control and OTA updates", "Predictive maintenance", "Industrial-grade integrations"],
  },
  "consulting": {
    title: "Software Consulting",
    subtitle: "Strategy, architecture and technology advisory you can trust.",
    intro: "Whether you're starting from scratch, scaling a product or modernising legacy systems, our consultants bring decades of combined experience to help you make confident technology decisions.",
    sections: [
      { heading: "Clarity before code", body: "We start by understanding your business, users and constraints. Then we deliver clear roadmaps, technical architectures and execution plans that align stakeholders and de-risk delivery." },
      { heading: "Hands-on, not just slides", body: "Our consultants stay close to the build — pairing with your team, reviewing code, mentoring engineers and ensuring strategy turns into shipped software." },
    ],
    features: ["Product and technology strategy", "Solution architecture", "Cloud and DevOps assessment", "Legacy modernisation roadmaps", "Team augmentation", "Vendor and tooling selection"],
  },
  "development": {
    title: "Software Development",
    subtitle: "Custom web, mobile and cloud applications, engineered to last.",
    intro: "We build custom software — web platforms, mobile apps, APIs, cloud services and integrations — using modern, well-tested technologies and engineering practices that keep your product reliable as it grows.",
    sections: [
      { heading: "Full-stack expertise", body: "Our teams cover front-end, back-end, mobile, DevOps and QA — so we can deliver complete solutions without hand-offs, or slot into your existing teams as needed." },
      { heading: "Engineered for change", body: "Clean architectures, automated tests, continuous delivery and clear documentation mean your software is easy to evolve as your business and user needs change." },
    ],
    features: ["Web applications and SaaS", "Native and cross-platform mobile", "APIs and integrations", "Cloud and DevOps", "QA and automation", "Maintenance and support"],
  },

  // Industries
  "edtech": {
    title: "EdTech",
    subtitle: "Digital products that improve how people learn and teach.",
    intro: "We help schools, universities, training providers and EdTech startups build engaging digital learning experiences — LMS platforms, virtual classrooms, assessment engines, content libraries and mobile apps for students and parents.",
    sections: [
      { heading: "Built for learners", body: "We design EdTech products around real learning outcomes, accessibility and engagement — backed by analytics that give educators clear insight into progress." },
      { heading: "Scales with your institution", body: "From small academies to multi-campus universities and global online schools, our solutions handle thousands of concurrent learners reliably." },
    ],
    features: ["Learning management systems", "Virtual classroom and webinar tools", "Assessment and proctoring", "Student information systems", "Mobile learning apps", "Analytics for educators"],
  },
  "fintech": {
    title: "FinTech",
    subtitle: "Secure, compliant and elegant financial products.",
    intro: "We build digital banking, lending, payments, wealth and insurance products that meet strict security and regulatory requirements while delivering an experience your customers love.",
    sections: [
      { heading: "Compliance is non-negotiable", body: "Our engineers work with KYC/AML, PCI-DSS, data privacy and audit requirements as first-class concerns — not afterthoughts." },
      { heading: "Fast, safe innovation", body: "From core integrations to mobile-first experiences, we help you ship new financial products quickly without compromising on stability or trust." },
    ],
    features: ["Digital banking and wallets", "Payment gateways and orchestration", "Lending and credit scoring", "KYC/AML and onboarding", "Investment and wealth platforms", "Regulatory reporting"],
  },
  "healthcare": {
    title: "Healthcare",
    subtitle: "Software that helps providers deliver better care.",
    intro: "We build healthcare platforms — hospital information systems, telemedicine, electronic health records, patient apps and clinical analytics — designed around clinical workflows, privacy and patient outcomes.",
    sections: [
      { heading: "Patient-centred, clinically aware", body: "We design with input from clinicians and patients to make tools that fit into real care pathways and reduce administrative burden." },
      { heading: "Privacy and compliance built in", body: "Our solutions follow leading healthcare data standards and best practices for security, consent and auditability." },
    ],
    features: ["Hospital and clinic management", "Electronic health records", "Telemedicine platforms", "Patient apps and portals", "Lab and pharmacy systems", "Clinical analytics"],
  },
  "insurance": {
    title: "Insurance",
    subtitle: "Modern systems for insurers, brokers and customers.",
    intro: "We modernise insurance with digital products that simplify policy administration, accelerate claims and improve customer experience across life, health, motor and general insurance lines.",
    sections: [
      { heading: "Faster, smarter claims", body: "Automated workflows, document understanding and decision support cut claim cycle times while keeping fraud and risk under control." },
      { heading: "End-to-end digital journeys", body: "From quote and bind to renewals and claims, we design connected experiences for customers, agents and underwriters." },
    ],
    features: ["Policy administration", "Quote and bind portals", "Digital claims management", "Underwriting workbench", "Agent and broker apps", "Insurance analytics"],
  },
  "logistics": {
    title: "Logistics",
    subtitle: "Visibility and automation across your supply chain.",
    intro: "We build logistics and supply-chain platforms that connect shippers, carriers, warehouses and customers — providing real-time visibility, optimised routes and smarter operations.",
    sections: [
      { heading: "Real-time visibility", body: "Track shipments, vehicles and inventory across locations with live dashboards and proactive alerts for exceptions." },
      { heading: "Optimisation at every step", body: "From route planning and load optimisation to warehouse picking and dispatching, our solutions reduce cost and improve service levels." },
    ],
    features: ["Transport management (TMS)", "Warehouse management (WMS)", "Fleet tracking and telematics", "Route optimisation", "Last-mile delivery apps", "Customer tracking portals"],
  },
  "manufacturing": {
    title: "Manufacturing",
    subtitle: "Smart factories powered by data, IoT and automation.",
    intro: "We help manufacturers digitise shop-floor operations, integrate machines and ERP systems, and use data to improve productivity, quality and uptime.",
    sections: [
      { heading: "From shop floor to top floor", body: "Connect machines, operators and business systems for a single, real-time view of production performance and OEE." },
      { heading: "Predict, don't react", body: "IoT data and machine learning enable predictive maintenance, quality control and process optimisation that drive measurable cost savings." },
    ],
    features: ["MES and production tracking", "OEE and KPI dashboards", "Predictive maintenance", "Quality management", "ERP and PLM integrations", "Industrial IoT"],
  },
  "on-demand": {
    title: "On-Demand App Development",
    subtitle: "Marketplace and service apps that connect supply and demand instantly.",
    intro: "We design and build on-demand apps — for delivery, ride-hailing, home services, healthcare, beauty, repairs and more — with all the pieces you need to go live and scale.",
    sections: [
      { heading: "Three-app ecosystems", body: "Customer app, provider app and admin dashboard, designed to work together with real-time tracking, payments, ratings, notifications and analytics." },
      { heading: "Built for unit economics", body: "From pricing engines and surge logic to commissions, payouts and incentives, we help you build apps that grow profitably." },
    ],
    features: ["Customer and provider apps", "Real-time tracking", "Payments and payouts", "Ratings and reviews", "Promotions and referrals", "Operations dashboards"],
  },
  "travel": {
    title: "Travel",
    subtitle: "Inspiring digital experiences for travellers and travel businesses.",
    intro: "We help travel companies — OTAs, tour operators, airlines, hotels and destinations — build modern booking platforms, mobile apps and traveller experiences powered by real-time data.",
    sections: [
      { heading: "From inspiration to booking", body: "Beautiful search, rich content, dynamic pricing, seamless checkout and post-booking experiences across web and mobile." },
      { heading: "Connected to the ecosystem", body: "We integrate with GDS, channel managers, payment gateways and CRM systems so your travel product fits cleanly into the wider industry." },
    ],
    features: ["Booking platforms (flights, hotels, tours)", "Itinerary and traveller apps", "Dynamic packaging engines", "Loyalty and rewards", "Channel and inventory integrations", "Analytics and personalisation"],
  },

  // Our Work
  "consultation": {
    title: "Get a Consultation",
    subtitle: "Talk to our experts and explore the right approach for your project.",
    intro: "Book a free, no-obligation consultation with our solution architects and product experts. We'll understand your goals, share what's worked for similar projects, and help you decide on the right next step.",
    sections: [
      { heading: "What to expect", body: "A focused 45-minute conversation where we listen to your context, challenge assumptions where useful, and share concrete options — technologies, architectures, timelines and budgets — based on similar work we've done." },
      { heading: "No strings attached", body: "There is no obligation to engage us afterwards. Many of our long-term clients started with a single consultation that gave them clarity on their next move." },
    ],
    features: ["45-minute working session", "Senior architect on the call", "Recap with recommendations", "Indicative timelines and budgets", "Suggested next steps", "Completely free"],
    ctaText: "Book your free consultation",
  },
  "cost-estimate": {
    title: "Get a Cost Estimate",
    subtitle: "A clear, written estimate for your project — usually within 48 hours.",
    intro: "Share what you want to build and we'll come back with a structured estimate covering scope, approach, team mix, timeline and cost — so you can plan with confidence.",
    sections: [
      { heading: "Structured and transparent", body: "Our estimates break the work into clear phases and deliverables, with ranges that reflect typical variation. You'll always understand what's included and what isn't." },
      { heading: "Built on real experience", body: "Estimates draw on our history delivering similar projects across industries — not optimistic guesses. Where there's genuine uncertainty, we say so and propose a small discovery phase first." },
    ],
    features: ["Written estimate in 48 hours", "Phased scope and deliverables", "Realistic timelines", "Team composition", "Transparent cost ranges", "Optional discovery phase"],
    ctaText: "Request your estimate",
  },
  "kickoff": {
    title: "Project Kickoff",
    subtitle: "How we set every engagement up for success from day one.",
    intro: "Once we decide to work together, we follow a proven kickoff process to align goals, set up the team, agree on ways of working and start delivering value as quickly as possible.",
    sections: [
      { heading: "Aligning on outcomes", body: "We start with a working session to confirm goals, success metrics, key constraints and the people involved on both sides — so everyone is working towards the same outcomes." },
      { heading: "Ways of working", body: "We agree on tools, communication cadence, review and approval processes, and how we'll handle change — so the project runs smoothly from day one." },
    ],
    features: ["Joint kickoff workshop", "Detailed delivery plan", "Roles and responsibilities", "Communication rhythm", "Tooling setup", "First sprint within a week"],
    ctaText: "Ready to start?",
  },
};