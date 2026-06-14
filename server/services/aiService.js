const axios = require("axios");

function safeParseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const stripped = text.replace(/```json|```/gi, "").trim();
  try { return JSON.parse(stripped); } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

// ── Role profiles ─────────────────────────────────────────────────────────────
const ROLE_PROFILES = {
  "UPSC CSE (General Studies)": {
    domain: "UPSC Civil Services Examination General Studies",
    topics: "Indian History, Indian Polity and Constitution, Indian Economy, Geography, Environment and Ecology, Science and Technology, Current Affairs, Ethics and Integrity, Art and Culture, Social Issues",
    examContext: "UPSC CSE Prelims and Mains examination",
  },
  "UPSC CSE (Optional: Computer Science)": {
    domain: "UPSC CSE Computer Science Optional Paper",
    topics: "Data Structures, Algorithms, Operating Systems, Computer Networks, Databases, Compiler Design, Software Engineering, Theory of Computation, Digital Logic, Computer Organization",
    examContext: "UPSC CSE Mains Computer Science optional paper",
  },
  "UPSC CSE (Optional: Mathematics)": {
    domain: "UPSC CSE Mathematics Optional Paper",
    topics: "Linear Algebra, Calculus, Real Analysis, Complex Analysis, Abstract Algebra, Differential Equations, Numerical Analysis, Statistics, Mechanics, Topology",
    examContext: "UPSC CSE Mains Mathematics optional paper",
  },
  "UPSC CSE (Optional: Public Administration)": {
    domain: "UPSC CSE Public Administration Optional Paper",
    topics: "Administrative Theory, Indian Administration, Comparative Public Administration, Development Dynamics, Personnel Administration, Financial Administration, Accountability and Control, Governance",
    examContext: "UPSC CSE Mains Public Administration optional paper",
  },
  "UPSC CSE (Optional: Economics)": {
    domain: "UPSC CSE Economics Optional Paper",
    topics: "Micro Economics, Macro Economics, Indian Economy, International Economics, Growth and Development, Public Finance, Money and Banking, Economic Planning",
    examContext: "UPSC CSE Mains Economics optional paper",
  },
  "IAS (Administrative Service)": {
    domain: "IAS Interview and Personality Test",
    topics: "Indian Polity, Governance, Public Policy, Social Issues, Indian Economy, Current Affairs, Ethics and Integrity, Leadership, Administrative Decision Making, International Relations",
    examContext: "UPSC IAS Personality Test and Interview board",
  },
  "IPS (Police Service)": {
    domain: "IPS Police Service Knowledge and Interview",
    topics: "Indian Penal Code, Criminal Procedure Code, Police Administration, Internal Security, Law and Order, Human Rights, Disaster Management, Cybercrime, Forensics, Constitutional Law",
    examContext: "UPSC IPS interview and service examination",
  },
  "IFS (Foreign Service)": {
    domain: "IFS Foreign Affairs and Diplomacy",
    topics: "International Relations, Indian Foreign Policy, Diplomacy, World History, International Organizations UN WTO IMF, Trade Agreements, Geopolitics, Treaties, Bilateral Relations",
    examContext: "UPSC IFS interview and examination",
  },
  "IRS (Revenue Service)": {
    domain: "IRS Revenue Service — Tax Laws and Administration",
    topics: "Income Tax Act, GST, Customs Duty, Tax Administration, Financial Laws, Public Finance, Direct and Indirect Taxes, Tax Policy, Tax Evasion, CBDT, CBIC, Transfer Pricing, TDS, Assessment Procedures",
    examContext: "UPSC IRS interview and departmental examination",
  },
  "IBPS PO (Bank Probationary Officer)": {
    domain: "IBPS PO Banking Examination",
    topics: "Banking Awareness, RBI Guidelines, Monetary Policy, Quantitative Aptitude, Logical Reasoning, English Language, Financial Awareness, Banking Products NEFT RTGS IMPS, NPA, Priority Sector Lending, NABARD",
    examContext: "IBPS PO Prelims and Mains examination with interview",
  },
  "IBPS Clerk": {
    domain: "IBPS Clerk Banking Examination",
    topics: "Quantitative Aptitude, Reasoning Ability, English Language, General and Financial Awareness, Computer Aptitude, Banking Terminology, Basic Banking Concepts",
    examContext: "IBPS Clerk Prelims and Mains examination",
  },
  "SBI PO": {
    domain: "SBI PO Banking Examination",
    topics: "SBI History and Functions, Banking Awareness, Data Analysis and Interpretation, Reasoning, English, RBI Monetary Policy, Banking Products, Financial Awareness, Digital Banking",
    examContext: "SBI PO Prelims Mains and Group Exercise Interview",
  },
  "RBI Grade B Officer": {
    domain: "RBI Grade B Officer Examination",
    topics: "RBI Functions and History, Monetary Policy, Banking Regulation, Indian Financial System, Economic and Social Issues, Finance and Management, FEMA, Payment Systems, Foreign Exchange Management",
    examContext: "RBI Grade B Phase 1 and Phase 2 examination",
  },
  "SSC CGL (Combined Graduate Level)": {
    domain: "SSC CGL Examination",
    topics: "General Intelligence and Reasoning, General Awareness, Quantitative Aptitude, English Comprehension, Indian History, Indian Polity, Geography, General Science, Current Affairs, Economics",
    examContext: "SSC CGL Tier 1 Tier 2 and Tier 3 examination",
  },
  "SSC CHSL": {
    domain: "SSC CHSL Examination",
    topics: "General Intelligence and Reasoning, English Language, Quantitative Aptitude, General Awareness, Indian History, Science, Current Affairs, Basic Computer Knowledge",
    examContext: "SSC CHSL Tier 1 and Tier 2 examination",
  },
  "NDA (National Defence Academy)": {
    domain: "NDA Entrance Examination",
    topics: "Algebra, Matrices and Determinants, Trigonometry, Calculus, Statistics and Probability, Vectors, Physics Mechanics Thermodynamics Electromagnetism, Chemistry, Biology, General Science, Indian History, Geography, Current Events",
    examContext: "UPSC NDA written examination and SSB interview",
  },
  "CDS (Combined Defence Services)": {
    domain: "CDS Entrance Examination",
    topics: "English Comprehension, Indian History, Indian Geography, Indian Economy, Indian Polity, General Science, Current Affairs, Arithmetic, Algebra, Geometry, Trigonometry, Statistics",
    examContext: "UPSC CDS written examination and SSB interview",
  },
  "DRDO Scientist": {
    domain: "DRDO Scientist and Engineer Recruitment",
    topics: "Engineering Mathematics, Electronics and Communication, Computer Science, Mechanical Engineering, Electrical Engineering, Defence Technology, Signal Processing, Research Methodology, Materials Science, Aerospace Engineering",
    examContext: "DRDO CEPTAM and SET examination with interview",
  },
  "ISRO Scientist / Engineer": {
    domain: "ISRO Scientist and Engineer Recruitment",
    topics: "Space Technology, Satellite Systems, Propulsion Systems, Orbital Mechanics, Remote Sensing, Rocket Science, Aerospace Engineering, Electronics, Computer Science, Chandrayaan Mangalyaan Gaganyaan missions",
    examContext: "ISRO Centralized Recruitment Board examination and interview",
  },
  "Railways (RRB JE / RRB NTPC)": {
    domain: "Railway Recruitment Board Examination",
    topics: "Mathematics, General Intelligence and Reasoning, General Awareness, General Science, Current Affairs, Indian Railways History and Zones, Technical Subjects Civil Electrical Electronics Mechanical",
    examContext: "RRB JE and NTPC CBT examination",
  },
  "GATE (Computer Science)": {
    domain: "GATE Computer Science and Information Technology",
    topics: "Data Structures, Algorithms, Operating Systems, Computer Networks, Database Management Systems, Compiler Design, Theory of Computation, Digital Logic, Computer Organization and Architecture, Software Engineering, Engineering Mathematics, Discrete Mathematics",
    examContext: "GATE CSE examination",
  },
  "GATE (Electronics & Communication)": {
    domain: "GATE Electronics and Communication Engineering",
    topics: "Network Theory, Electronic Devices and Circuits, Analog Circuits, Digital Circuits, Control Systems, Communications, Electromagnetics, Signals and Systems, Engineering Mathematics, Microprocessors",
    examContext: "GATE ECE examination",
  },
  "GATE (Electrical Engineering)": {
    domain: "GATE Electrical Engineering",
    topics: "Electric Circuits, Electromagnetic Fields, Signals and Systems, Electrical Machines, Power Systems, Control Systems, Power Electronics, Analog and Digital Electronics, Engineering Mathematics, Measurements",
    examContext: "GATE EE examination",
  },
  "GATE (Mechanical Engineering)": {
    domain: "GATE Mechanical Engineering",
    topics: "Engineering Mathematics, Applied Mechanics, Fluid Mechanics, Heat Transfer, Thermodynamics, Manufacturing Engineering, Industrial Engineering, Theory of Machines, Strength of Materials, Vibrations",
    examContext: "GATE ME examination",
  },
  "UGC NET (Computer Science)": {
    domain: "UGC NET Computer Science and Applications",
    topics: "Data Structures, Computer Networks, Database Management, Operating Systems, Software Engineering, Theory of Computation, Compiler Design, Computer Organization, Web Technologies, Artificial Intelligence, Discrete Mathematics, Research Aptitude",
    examContext: "UGC NET Paper 1 and Paper 2 Computer Science",
  },
  "PhD Research Interview (CS)": {
    domain: "PhD Computer Science Research Interview",
    topics: "Research Methodology, Data Structures, Algorithms, Machine Learning, Deep Learning, Literature Review, Problem Formulation, Experimental Design, Publication Process, Research Ethics, Statistical Analysis",
    examContext: "PhD admission interview at IITs NITs and research institutions",
  },
  "Cybersecurity Analyst": {
    domain: "Cybersecurity and Information Security",
    topics: "Network Security, Cryptography, Ethical Hacking, Vulnerability Assessment, OWASP Top 10, Firewalls IDS IPS, Security Operations Center, Incident Response, Compliance, Digital Forensics, Malware Analysis, Threat Intelligence",
    examContext: "cybersecurity analyst technical interview",
  },
  "Ethical Hacker / Penetration Tester": {
    domain: "Ethical Hacking and Penetration Testing",
    topics: "Reconnaissance, Scanning and Enumeration, Exploitation, Post Exploitation, Web Application Hacking, Network Penetration Testing, Social Engineering, Metasploit, Kali Linux, CVE Vulnerabilities, Bug Bounty, OWASP",
    examContext: "penetration testing job interview",
  },
  "Network Engineer": {
    domain: "Network Engineering",
    topics: "OSI Model, TCP/IP Protocol Suite, Routing Protocols OSPF BGP RIP, Switching VLANs, Subnetting CIDR, Firewalls ACLs, Load Balancers, SD-WAN, Network Troubleshooting, Cisco Juniper, IPv6, QoS, MPLS",
    examContext: "network engineering job interview",
  },
  "Data Scientist": {
    domain: "Data Science and Machine Learning",
    topics: "Statistics and Probability, Supervised Machine Learning, Unsupervised Machine Learning, Deep Learning, Feature Engineering, Model Evaluation, Python Pandas NumPy, Scikit-learn, TensorFlow, A/B Testing, Data Visualization, SQL, Hypothesis Testing",
    examContext: "data science job interview",
  },
  "Machine Learning Engineer": {
    domain: "Machine Learning Engineering and MLOps",
    topics: "Neural Networks, Deep Learning Architecture, Backpropagation, Optimization Algorithms, MLOps, Model Deployment, Feature Pipelines, NLP Transformers, Computer Vision CNN, PyTorch TensorFlow, Distributed Training, Model Monitoring",
    examContext: "ML engineer interview",
  },
  "AI Research Engineer": {
    domain: "Artificial Intelligence Research and Development",
    topics: "Deep Learning Theory, Transformer Architecture, Attention Mechanism, Reinforcement Learning, Generative Models GAN VAE, Research Methodology, Mathematical Optimization, Regularization, Loss Functions, Research Paper Implementation",
    examContext: "AI research engineer interview",
  },
  "Data Engineer": {
    domain: "Data Engineering and Big Data",
    topics: "SQL and NoSQL, ETL and ELT Pipelines, Apache Spark, Apache Kafka, Data Warehousing Star Schema, Apache Airflow, Cloud Data Platforms AWS GCP Azure, Data Modeling, Batch and Stream Processing, Data Quality, dbt",
    examContext: "data engineering interview",
  },
  "Data Analyst": {
    domain: "Data Analysis and Business Intelligence",
    topics: "SQL Advanced Queries, Excel, Python Pandas, Data Visualization Tableau Power BI, Statistical Analysis, Pivot Tables, Data Cleaning, Dashboard Creation, Business Metrics KPIs, A/B Testing, Reporting",
    examContext: "data analyst job interview",
  },
  "Backend Developer": {
    domain: "Backend Software Development",
    topics: "REST APIs, GraphQL, SQL and NoSQL Databases, System Design, Data Structures Algorithms, OOP Design Patterns, Caching Redis, Message Queues RabbitMQ Kafka, Authentication JWT OAuth, Microservices, Cloud Deployment",
    examContext: "backend developer technical interview",
  },
  "Frontend Developer": {
    domain: "Frontend Web Development",
    topics: "HTML5 Semantic Elements, CSS3 Flexbox Grid, JavaScript ES6+, React Angular Vue, Virtual DOM, Event Loop, Promises Async Await, State Management Redux, Performance Optimization, Web Accessibility, CORS XSS CSRF, Testing",
    examContext: "frontend developer technical interview",
  },
  "Full Stack Developer": {
    domain: "Full Stack Web Development",
    topics: "Frontend HTML CSS JavaScript React, Backend Node.js Express, Databases SQL NoSQL, REST APIs GraphQL, Authentication JWT, System Design, DevOps CI/CD, Cloud AWS, Testing, Performance Optimization",
    examContext: "full stack developer technical interview",
  },
  "DevOps Engineer": {
    domain: "DevOps and Site Reliability Engineering",
    topics: "Linux Administration, Docker Containerization, Kubernetes Orchestration, CI/CD Jenkins GitHub Actions, Infrastructure as Code Terraform Ansible, Cloud AWS GCP Azure, Monitoring Prometheus Grafana, Git, Networking, Security",
    examContext: "DevOps engineer technical interview",
  },
  "System Design": {
    domain: "Software System Design and Architecture",
    topics: "Scalability, Load Balancing, Caching Strategies, Database Sharding Replication, Microservices, Message Queues, CAP Theorem, Distributed Systems, API Design, High Availability, Rate Limiting, CDN, Consistent Hashing",
    examContext: "system design interview at senior software engineer level",
  },
  "Mobile App Developer (Android)": {
    domain: "Android Mobile App Development",
    topics: "Java Kotlin, Android SDK, Activities Fragments Lifecycle, RecyclerView, Jetpack Components ViewModel LiveData, Room Database, Retrofit, MVVM Architecture, Firebase, Material Design, Google Play Store, Android Testing",
    examContext: "Android developer technical interview",
  },
  "Mobile App Developer (iOS)": {
    domain: "iOS Mobile App Development",
    topics: "Swift Objective-C, UIKit SwiftUI, Xcode, Core Data, Networking URLSession, MVVM MVC patterns, Auto Layout, App Store Guidelines, Push Notifications, Combine Framework, iOS Testing XCTest",
    examContext: "iOS developer technical interview",
  },
  "Cloud Engineer (AWS/Azure/GCP)": {
    domain: "Cloud Computing and Infrastructure",
    topics: "AWS Azure GCP Core Services, EC2 S3 Lambda, Virtual Machines, Serverless Computing, Cloud Storage, Networking VPC, IAM Security, Auto Scaling, Load Balancing, Cloud Cost Optimization, Kubernetes on Cloud, Terraform",
    examContext: "cloud engineer technical interview",
  },
  "QA Engineer": {
    domain: "Software Quality Assurance and Testing",
    topics: "Manual Testing, Automation Testing Selenium, Test Planning and Design, Bug Life Cycle, SDLC STLC, API Testing Postman, Performance Testing JMeter, Agile Testing, Test Coverage, Regression Testing, Test Cases",
    examContext: "QA engineer technical interview",
  },
  "Product Manager": {
    domain: "Product Management",
    topics: "Product Strategy, User Research, Agile Scrum, Product Roadmap, Prioritization RICE MoSCoW, A/B Testing, Metrics KPIs North Star, Stakeholder Management, Go to Market Strategy, Competitor Analysis, MVP, PRD",
    examContext: "product manager interview",
  },
  "Business Analyst": {
    domain: "Business Analysis",
    topics: "Requirements Gathering, Use Case Diagrams, Business Process Modeling BPMN, SWOT Analysis, Gap Analysis, SQL for Reporting, Agile Methodology, Stakeholder Management, Data Analysis, Project Documentation, User Stories",
    examContext: "business analyst interview",
  },
  "Site Reliability Engineer (SRE)": {
    domain: "Site Reliability Engineering",
    topics: "SLO SLA SLI, Error Budgets, Incident Management, Postmortems, Monitoring Alerting, Observability, Chaos Engineering, Capacity Planning, Toil Reduction, On-call, Distributed Systems Reliability",
    examContext: "SRE technical interview",
  },
  "Scrum Master": {
    domain: "Agile and Scrum Methodology",
    topics: "Scrum Framework, Sprint Planning, Daily Standup, Sprint Review Retrospective, Product Backlog, User Stories, Velocity, Burndown Charts, Agile Principles, Kanban, SAFe, Team Facilitation, Conflict Resolution",
    examContext: "Scrum Master interview",
  },
  "Technical Project Manager": {
    domain: "Technical Project Management",
    topics: "Project Planning, Risk Management, Stakeholder Communication, Agile Waterfall Methodologies, Resource Allocation, Budget Management, JIRA, Gantt Charts, Critical Path, Change Management, Project Lifecycle",
    examContext: "technical project manager interview",
  },
  "JEE (Main & Advanced)": {
    domain: "JEE Joint Entrance Examination",
    topics: "Physics Mechanics, Thermodynamics, Electromagnetism, Optics, Modern Physics, Chemistry Physical, Chemistry Organic, Chemistry Inorganic, Algebra, Calculus, Coordinate Geometry, Trigonometry, Vectors, Probability",
    examContext: "JEE Main and Advanced examination",
  },
  "NEET": {
    domain: "NEET Medical Entrance Examination",
    topics: "Physics Mechanics, Thermodynamics, Electromagnetism, Chemistry Physical, Chemistry Organic, Chemistry Inorganic, Botany, Zoology, Cell Biology, Genetics, Ecology, Human Physiology, Plant Physiology, Evolution",
    examContext: "NEET UG examination for medical admissions",
  },
  "CAT (MBA Entrance)": {
    domain: "CAT Common Admission Test for MBA",
    topics: "Arithmetic, Algebra, Geometry, Number Systems, Verbal Ability, Reading Comprehension, Para Jumbles, Critical Reasoning, Data Interpretation, Logical Reasoning, Sets and Venn Diagrams",
    examContext: "CAT examination for IIM admissions",
  },
  "CLAT (Law Entrance)": {
    domain: "CLAT Common Law Admission Test",
    topics: "English Language Comprehension, Current Affairs and GK, Legal Reasoning, Logical Reasoning, Quantitative Techniques, Constitutional Law basics, Legal Maxims, Contract Law, Criminal Law",
    examContext: "CLAT examination for NLU law admissions",
  },
  "CUET (Central University Entrance)": {
    domain: "CUET Central University Common Entrance Test",
    topics: "English Language, Domain Specific Subjects, General Test Quantitative Reasoning, Logical Reasoning, General Knowledge, Current Affairs",
    examContext: "CUET examination for central university admissions",
  },
  "General Practice": {
    domain: "General Computer Science and Engineering",
    topics: "Data Structures, Algorithms, OOP, Databases, Operating Systems, Computer Networks, System Design, Web Development, Cloud Computing, Software Engineering",
    examContext: "general technical practice session",
  },
};

function getRoleProfile(role) {
  if (ROLE_PROFILES[role]) return ROLE_PROFILES[role];
  return {
    domain: role,
    topics: "core concepts, fundamentals, practical applications, and advanced topics related to " + role,
    examContext: "technical or competitive examination interview for " + role,
  };
}

// ── Difficulty specs ──────────────────────────────────────────────────────────
const DIFF = {
  Easy: {
    openended: `EASY LEVEL — first year / absolute beginner.
ASK: basic definitions, what something is, one simple example.
GOOD: "What is a stack? Give one real-world example."
GOOD: "What does HTTP stand for and what is it used for?"
BAD: anything requiring analysis, trade-offs, proofs, or deep understanding.
The question must be answerable by anyone who attended one introductory lecture.`,

    mcq: `EASY LEVEL — first year / absolute beginner.
The correct answer must be obvious to anyone who studied the basics.
Wrong options must be clearly from a different category — not subtle traps.
GOOD: "Which structure follows LIFO? A)Queue B)Stack C)Tree D)Graph"
BAD: options that are subtle variations — keep wrong options obviously wrong.`,

    fillblank: `EASY LEVEL — first year / absolute beginner.
The blank must be a well-known, single standard term.
GOOD: "An array stores elements in _____ memory." (contiguous)
GOOD: "HTTP stands for _____." (HyperText Transfer Protocol)
BAD: technical terms only experts know — keep it textbook standard.`,

    idealAnswerDepth: `The ideal answer should be 3-5 sentences covering:
1. A clear definition of the concept
2. One concrete real-world example
3. One key property or characteristic
No need for advanced analysis or deep technical detail.`,

    score: `EASY scoring rules:
- Clear correct definition with example = 8-9
- Perfect textbook answer = 10
- Partial definition, missing example = 5-6
- Vague or mostly wrong = 2-4
- Completely wrong or nonsense = 0-1
Be lenient with terminology but strict about correctness.`,
  },

  Medium: {
    openended: `MEDIUM LEVEL — 3rd year undergraduate / someone with 1-2 years experience.
ASK: HOW something works internally, WHY you would choose it, COMPARE two approaches, apply to a scenario.
GOOD: "Compare stack and heap memory allocation. When does a program prefer each and why?"
GOOD: "Explain why quicksort degrades to O(n²) in the worst case and how introsort fixes this."
GOOD: "You are building a chat application. Would you use WebSockets or REST polling? Justify."
BAD: simple definitions a beginner knows.
BAD: questions answerable in one sentence.
The question must require the candidate to THINK, not just recall.`,

    mcq: `MEDIUM LEVEL — 3rd year undergraduate / 1-2 years experience.
ALL 4 options must look plausible. The candidate must understand the concept to distinguish.
GOOD: "A B-tree index speeds up range queries because: A)it stores data sorted by key B)it uses hash chaining C)it compresses data D)it caches in memory" — all sound reasonable
BAD: obviously wrong options like "it uses magic" or unrelated concepts.`,

    fillblank: `MEDIUM LEVEL — 3rd year undergraduate / 1-2 years experience.
The blank must require understanding, not just memorisation.
GOOD: "The amortized time complexity of dynamic array push is _____." (O(1))
GOOD: "In SQL, the _____ clause filters rows after grouping." (HAVING)
BAD: trivially obvious blanks a first-year student knows.`,

    idealAnswerDepth: `The ideal answer should be 6-10 sentences covering:
1. Core concept explained clearly
2. Internal mechanism or HOW it works
3. Comparison with alternatives or trade-offs
4. A concrete scenario or example
5. Edge cases or important caveats
Depth expected: someone with real hands-on experience.`,

    score: `MEDIUM scoring rules:
- Definition only, no reasoning = MAX 4
- Correct concept + some reasoning but shallow = 5-6
- Correct + good reasoning + example = 7-8
- Complete answer with trade-offs and depth = 9-10
- Wrong direction entirely = 0-2
- Buzzwords without substance = 2-3
Be strict: surface-level answers must score below 5.`,
  },

  Hard: {
    openended: `HARD LEVEL — senior engineer / expert / professor level.
ASK: deep internals, formal analysis, edge cases, architectural decisions under real constraints, research-level reasoning.
GOOD: "Prove using the potential method that dynamic array push has O(1) amortized complexity."
GOOD: "Explain how PostgreSQL's MVCC handles phantom reads differently from 2PL, and what trade-offs each makes."
GOOD: "Design a distributed rate limiter across 100 geographically distributed servers. Address consistency, failover, and latency trade-offs."
GOOD: "How does the Linux kernel scheduler implement CFS and what are its weaknesses in high-contention scenarios?"
BAD: anything covered in a standard textbook definition.
BAD: questions a 3rd year student can answer.
The question must make even experienced engineers pause and think deeply.`,

    mcq: `HARD LEVEL — senior engineer / expert level.
ALL 4 options must be extremely plausible — only deep expertise reveals the correct one.
GOOD: Subtle differences between isolation levels, amortized vs worst-case complexity, specific protocol behaviours.
GOOD: "Which happens first during a TCP connection teardown? A)FIN from client B)ACK from server C)FIN-ACK exchange D)RST packet" — requires precise protocol knowledge.
BAD: any obviously wrong option — all 4 must be things an expert might plausibly choose.`,

    fillblank: `HARD LEVEL — senior engineer / expert level.
The blank must be a precise technical term only a specialist would know.
GOOD: "In a B+ tree of order m, the minimum keys in a non-root internal node is _____." (⌈m/2⌉-1)
GOOD: "The algorithm that guarantees O(n) median finding is _____." (Median of Medians)
GOOD: "PostgreSQL uses _____ to implement MVCC." (tuple versioning with transaction ID snapshots)
BAD: anything a 3rd year textbook covers.`,

    idealAnswerDepth: `The ideal answer should be comprehensive and technically rigorous:
1. Precise technical explanation with correct terminology
2. Internal implementation details or formal proof
3. Multiple trade-offs and when each applies
4. Real-world implications and failure scenarios
5. Comparison with alternative approaches at expert level
6. Edge cases and why they matter
Depth expected: a senior engineer with 5+ years or a PhD-level explanation.`,

    score: `HARD scoring rules:
- Surface-level or textbook answer = 0-2 MAXIMUM, no exceptions
- Shows awareness but lacks depth = 3-4
- Correct but missing internals or trade-offs = 5-6
- Deep, correct, with trade-offs = 7-8
- Expert-level rigorous complete answer = 9-10
- Wrong answer = 0, period
Be brutally honest. A wrong or shallow answer on a hard question scores 0-2.`,
  },
};

// ── Purpose profiles ──────────────────────────────────────────────────────────
const PURPOSE_PROFILES = {
  exam: {
    label: "Exam Preparation",
    tone: "academic — use exact textbook terminology, match official exam question style and marking scheme",
    feedbackTone: "academic examiner — cite the standard textbook answer, name the exact concept missed, reference the marking scheme",
  },
  company: {
    label: "Company Interview",
    tone: "professional interviewer — scenario-based, test real engineering judgment, match the seniority and tech stack implied by the JD",
    feedbackTone: "senior engineer interviewer — be direct and honest about whether this answer would pass a real interview, reference what the company's tech stack requires",
  },
  practice: {
    label: "Free Practice",
    tone: "educational — make it genuinely interesting, build deep understanding, encourage curiosity",
    feedbackTone: `teacher and mentor:
1. Be honest first — if the answer is wrong, say so clearly before anything else
2. Explain the full concept from first principles with clarity
3. Use a relatable analogy or real-world example
4. Point out every specific gap and why it matters
5. Give one memorable tip or trick
6. End with encouragement and what to study next`,
  },
};

// ── Domain context ────────────────────────────────────────────────────────────
function buildDomainContext(purposeMeta) {
  if (!purposeMeta) return "";

  if (purposeMeta.examType === "university") {
    return `UNIVERSITY: ${purposeMeta.university}
COURSE: ${purposeMeta.course}
LEVEL: ${purposeMeta.semester}
SUBJECT: ${purposeMeta.subject}
${purposeMeta.syllabus ? `SYLLABUS:\n${purposeMeta.syllabus}` : ""}`;
  }

  if (purposeMeta.examType === "competitive") {
    return `EXAM: ${purposeMeta.exam}`;
  }

  if (purposeMeta.companyName || purposeMeta.jobDescription) {
    return `COMPANY: ${purposeMeta.companyName || "Not specified"}
${purposeMeta.jobDescription
  ? `JOB DESCRIPTION:\n${purposeMeta.jobDescription}

QUESTION REQUIREMENTS FOR THIS JD:
- Ask about technologies explicitly listed in the JD above
- Match the seniority level implied by years of experience required
- Ask scenario questions this specific company and role would actually test
- If JD mentions specific tools, frameworks, or methodologies — ask about those specifically
- Questions must feel like they came from a real interviewer at ${purposeMeta.companyName || "this company"}`
  : `Ask questions relevant to a ${purposeMeta.companyName} interview for this role.`}`;
  }

  return "";
}

// ── Similarity check ──────────────────────────────────────────────────────────
function isTooSimilar(newQ, askedQuestions) {
  if (!askedQuestions || askedQuestions.length === 0) return false;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const newN = norm(newQ);
  return askedQuestions.some((q) => {
    const oldN = norm(q);
    if (newN === oldN) return true;
    const nw = new Set(newN.split(" ").filter((w) => w.length > 3));
    const ow = oldN.split(" ").filter((w) => w.length > 3);
    if (!ow.length) return false;
    return ow.filter((w) => nw.has(w)).length / ow.length > 0.4;
  });
}

// ── Pick fresh topic ──────────────────────────────────────────────────────────
function pickFreshTopic(roleProfile, askedTopics, purposeMeta) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const used = new Set((askedTopics || []).map(norm));

  if (purposeMeta?.examType === "university" && purposeMeta?.syllabus) {
    const all  = purposeMeta.syllabus.split(/[\n,;]/).map((t) => t.replace(/unit\s*\d+[:.]?/gi,"").trim()).filter((t) => t.length > 2);
    const free = all.filter((t) => !used.has(norm(t)));
    const pool = free.length > 0 ? free : all;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (purposeMeta?.selectedTopics?.length > 0) {
    const all  = purposeMeta.selectedTopics;
    const free = all.filter((t) => !used.has(norm(t)));
    const pool = free.length > 0 ? free : all;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const all  = roleProfile.topics.split(",").map((t) => t.trim());
  const free = all.filter((t) => !used.has(norm(t)));
  const pool = free.length > 0 ? free : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── AI calls ──────────────────────────────────────────────────────────────────
async function callOpenAI(system, user) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role:"system", content:system },
        { role:"user",   content:user   },
      ],
      temperature: 1.0,
      presence_penalty: 2.0,
      frequency_penalty: 2.0,
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 25000,
    }
  );
  return res.data.choices[0].message.content;
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await axios.post(url, { contents:[{ parts:[{ text:prompt }] }] }, { timeout:20000 });
  return res.data.candidates[0].content.parts[0].text;
}

async function callAI(system, user) {
  return process.env.AI_PROVIDER === "gemini" ? callGemini(user) : callOpenAI(system, user);
}

// ── OPEN-ENDED question ───────────────────────────────────────────────────────
async function generateQuestion(role, difficulty, topic=null, askedQuestions=[], askedTopics=[], purpose="practice", purposeMeta={}) {
  const rp     = getRoleProfile(role);
  const diff   = DIFF[difficulty] || DIFF.Medium;
  const pp     = PURPOSE_PROFILES[purpose] || PURPOSE_PROFILES.practice;
  const ctx    = buildDomainContext(purposeMeta);
  const ftopic = topic || pickFreshTopic(rp, askedTopics, purposeMeta);

  const domain = purposeMeta?.examType === "university"
    ? `${purposeMeta.subject} (${purposeMeta.course}, ${purposeMeta.semester}, ${purposeMeta.university})`
    : purposeMeta?.companyName
    ? `${role} at ${purposeMeta.companyName}`
    : rp.domain;

  const system = `You are a world-class technical interviewer and examiner for: ${domain}
You generate precise, meaningful, difficulty-appropriate questions.

${diff.openended}

PURPOSE: ${pp.tone}

${ctx ? `CONTEXT:\n${ctx}\n` : ""}
ABSOLUTE RULES:
- Questions must be 100% relevant to the domain and topic
- Questions must EXACTLY match the difficulty level described above
- Never ask vague or generic questions
- Never repeat concepts from the already asked list`;

  const alreadyAsked = askedQuestions.length > 0
    ? `\nNEVER ask about these — already covered:\n${askedQuestions.map((q,i) => `${i+1}. ${q}`).join("\n")}`
    : "";

  for (let i = 0; i < 5; i++) {
    const seed = `[${Date.now()}-${Math.random().toString(36).slice(2)}-${i}]`;
    const userPrompt = `${seed}
Topic: ${ftopic}
Domain: ${domain}
Difficulty: ${difficulty}
${purposeMeta?.jobDescription ? `JD context: Questions must relate to technologies/skills in the job description.` : ""}
${alreadyAsked}

Generate ONE ${difficulty}-level open-ended question about "${ftopic}" for "${domain}".
It must match the ${difficulty} difficulty spec exactly — not easier, not vague.

Respond ONLY as JSON: {"question":"<your question>","topic":"<${ftopic}>"}`;

    try {
      const raw = await callAI(system, userPrompt);
      const p   = safeParseJSON(raw);
      if (p?.question && p.question.length > 20 && !isTooSimilar(p.question, askedQuestions)) {
        console.log(`✅ Q[${i}] ${difficulty} "${ftopic}":`, p.question);
        return p;
      }
    } catch (e) { console.error(`Q attempt ${i}:`, e.message); }
  }

  const fb = {
    Easy:   `What is ${ftopic}? Give a simple definition and one real-world example.`,
    Medium: `Explain how ${ftopic} works internally and when you would choose it over alternatives.`,
    Hard:   `Analyze the time and space complexity of ${ftopic} in detail, including amortized analysis where applicable, and discuss real-world failure scenarios.`,
  };
  return { question: fb[difficulty] || fb.Medium, topic: ftopic };
}

// ── MCQ question ──────────────────────────────────────────────────────────────
async function generateMCQ(role, difficulty, topic=null, askedQuestions=[], askedTopics=[], purpose="practice", purposeMeta={}) {
  const rp     = getRoleProfile(role);
  const diff   = DIFF[difficulty] || DIFF.Medium;
  const pp     = PURPOSE_PROFILES[purpose] || PURPOSE_PROFILES.practice;
  const ctx    = buildDomainContext(purposeMeta);
  const ftopic = topic || pickFreshTopic(rp, askedTopics, purposeMeta);

  const domain = purposeMeta?.examType === "university"
    ? `${purposeMeta.subject} (${purposeMeta.course}, ${purposeMeta.semester}, ${purposeMeta.university})`
    : purposeMeta?.companyName
    ? `${role} at ${purposeMeta.companyName}`
    : rp.domain;

  const system = `You are a world-class technical examiner for: ${domain}
You generate precise, difficulty-appropriate MCQs.

${diff.mcq}

PURPOSE: ${pp.tone}

${ctx ? `CONTEXT:\n${ctx}\n` : ""}`;

  const alreadyAsked = askedQuestions.length > 0
    ? `\nNEVER repeat — already asked:\n${askedQuestions.map((q,i) => `${i+1}. ${q}`).join("\n")}`
    : "";

  for (let i = 0; i < 5; i++) {
    const seed = `[${Date.now()}-${Math.random().toString(36).slice(2)}-${i}]`;
    const userPrompt = `${seed}
Topic: ${ftopic}
Domain: ${domain}
Difficulty: ${difficulty}
${alreadyAsked}

Generate ONE ${difficulty}-level MCQ about "${ftopic}" for "${domain}".
Options must match the difficulty spec: ${difficulty === "Easy" ? "wrong options clearly wrong" : difficulty === "Medium" ? "all options plausible, need understanding to distinguish" : "all options extremely plausible, only expert can identify correct one"}.

Respond ONLY as JSON:
{"question":"<question>","options":{"A":"<>","B":"<>","C":"<>","D":"<>"},"correctAnswer":"<A/B/C/D>","explanation":"<thorough explanation of why correct is right AND why each wrong option is wrong>","topic":"<${ftopic}>"}`;

    try {
      const raw = await callAI(system, userPrompt);
      const p   = safeParseJSON(raw);
      if (p?.question && p?.options && p?.correctAnswer && Object.keys(p.options).length === 4
          && !isTooSimilar(p.question, askedQuestions)) {
        console.log(`✅ MCQ[${i}] ${difficulty} "${ftopic}":`, p.question);
        return p;
      }
    } catch (e) { console.error(`MCQ attempt ${i}:`, e.message); }
  }

  return {
    question: `Which of the following best describes the primary purpose of ${ftopic}?`,
    options: {
      A: `To organise and access data efficiently`,
      B: `To manage network connections`,
      C: `To compile source code`,
      D: `To handle operating system interrupts`,
    },
    correctAnswer: "A",
    explanation: `${ftopic} is primarily used to organise and access data efficiently. Options B, C, and D describe unrelated system concerns.`,
    topic: ftopic,
  };
}

// ── FILL BLANK question ───────────────────────────────────────────────────────
async function generateFillBlank(role, difficulty, topic=null, askedQuestions=[], askedTopics=[], purpose="practice", purposeMeta={}) {
  const rp     = getRoleProfile(role);
  const diff   = DIFF[difficulty] || DIFF.Medium;
  const pp     = PURPOSE_PROFILES[purpose] || PURPOSE_PROFILES.practice;
  const ctx    = buildDomainContext(purposeMeta);
  const ftopic = topic || pickFreshTopic(rp, askedTopics, purposeMeta);

  const domain = purposeMeta?.examType === "university"
    ? `${purposeMeta.subject} (${purposeMeta.course}, ${purposeMeta.semester}, ${purposeMeta.university})`
    : purposeMeta?.companyName
    ? `${role} at ${purposeMeta.companyName}`
    : rp.domain;

  const system = `You are a world-class technical examiner for: ${domain}
You generate precise fill-in-the-blank questions.

${diff.fillblank}

PURPOSE: ${pp.tone}

${ctx ? `CONTEXT:\n${ctx}\n` : ""}`;

  const alreadyAsked = askedQuestions.length > 0
    ? `\nNEVER repeat — already asked:\n${askedQuestions.map((q,i) => `${i+1}. ${q}`).join("\n")}`
    : "";

  for (let i = 0; i < 5; i++) {
    const seed = `[${Date.now()}-${Math.random().toString(36).slice(2)}-${i}]`;
    const userPrompt = `${seed}
Topic: ${ftopic}
Domain: ${domain}
Difficulty: ${difficulty}
${alreadyAsked}

Generate ONE ${difficulty}-level fill-in-the-blank about "${ftopic}" for "${domain}".
Use _____ for the blank. Statement must be 100% factually correct when filled.

Respond ONLY as JSON:
{"question":"<statement with _____ blank>","correctAnswer":"<precise answer>","acceptedAnswers":["<variation1>","<variation2>"],"explanation":"<full explanation of why this is correct>","topic":"<${ftopic}>"}`;

    try {
      const raw = await callAI(system, userPrompt);
      const p   = safeParseJSON(raw);
      if (p?.question && p?.correctAnswer && p.question.includes("_____")
          && !isTooSimilar(p.question, askedQuestions)) {
        console.log(`✅ Fill[${i}] ${difficulty} "${ftopic}":`, p.question);
        return p;
      }
    } catch (e) { console.error(`Fill attempt ${i}:`, e.message); }
  }

  return {
    question: `The time complexity of binary search on a sorted array of n elements is _____.`,
    correctAnswer: "O(log n)",
    acceptedAnswers: ["o(log n)", "log n", "O(log(n))"],
    explanation: `Binary search halves the search space at each step, giving O(log n) time complexity.`,
    topic: ftopic,
  };
}

// ── Evaluate open-ended ───────────────────────────────────────────────────────
async function evaluateAnswer(question, answer, difficulty="Medium", purpose="practice", purposeMeta={}) {

  // ── Pre-check: detect empty or nonsense answers ───────────────────────────
  const trimmed     = answer?.trim() || "";
  const words       = trimmed.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));

  const isNonsense = (
    trimmed.length < 15 ||
    words.length < 4 ||
    (words.length > 3 && uniqueWords.size <= 2) ||
    /^[^a-zA-Z]*$/.test(trimmed) ||
    /^(.)\1+$/.test(trimmed.replace(/\s/g,"")) // repeated single char like "aaaaaa"
  );

  if (isNonsense) {
    return {
      score: 0,
      topic: "General",
      strengths: "None.",
      weaknesses: "This is not a genuine answer. It contains no meaningful content related to the question. Zero marks awarded.",
      idealAnswer: await generateIdealAnswer(question, difficulty, purposeMeta),
    };
  }

  const diff = DIFF[difficulty] || DIFF.Medium;
  const pp   = PURPOSE_PROFILES[purpose] || PURPOSE_PROFILES.practice;
  const ctx  = buildDomainContext(purposeMeta);

  // Build a rich ideal answer depth guide
  const idealDepthGuide = diff.idealAnswerDepth;

  const system = `You are a strict, uncompromising technical interviewer evaluating a candidate's answer.

DIFFICULTY: ${difficulty}
${diff.score}

EVALUATION PHILOSOPHY:
- You are honest and direct. A wrong answer is WRONG — never "partially correct" if the core is wrong.
- A correct answer that is too shallow for the difficulty level gets penalised heavily.
- Buzzwords without substance score 1-2, not 5-6.
- "I think" or "maybe" answers without substance score 0-2.
- Only give 7+ when the answer genuinely demonstrates real understanding at this difficulty level.
- Only give 9-10 for answers that are impressively complete and accurate.

WHAT THE IDEAL ANSWER LOOKS LIKE AT ${difficulty} LEVEL:
${idealDepthGuide}

Feedback style: ${pp.feedbackTone}`;

  const userPrompt = `Question: ${question}
Difficulty: ${difficulty}
${ctx ? `Context: ${ctx}` : ""}
Candidate's answer: "${answer}"

EVALUATE STRICTLY:
1. Is the answer actually correct? (If not, score MUST be 0-3)
2. Does it match the depth expected at ${difficulty} level? (If not, cap at 5)
3. Are there specific technical errors? (Each one reduces score)
4. How complete is it vs the ideal answer for ${difficulty} level?

IDEAL ANSWER REQUIREMENTS FOR ${difficulty}:
${idealDepthGuide}

The ideal answer in your response must be a COMPLETE, THOROUGH answer at ${difficulty} level — not a hint or summary.
Write the ideal answer as if a top student or senior engineer wrote it for this exact difficulty.

Respond ONLY as JSON:
{
  "score": <integer 0-10, be strict>,
  "topic": "<specific subject area>",
  "strengths": "<specific things that were correct — or 'None' if nothing was right>",
  "weaknesses": "<every error, gap, missing concept — be specific and direct, do not soften>",
  "idealAnswer": "<complete, thorough model answer appropriate for ${difficulty} level — must cover all key points an expert would expect>"
}`;

  try {
    const raw = await callAI(system, userPrompt);
    const p   = safeParseJSON(raw);

    if (p && typeof p.score === "number") {
      // Post-processing enforcement
      const wLower  = (p.weaknesses || "").toLowerCase();
      const sLower  = (p.strengths  || "").toLowerCase();

      // If weaknesses say wrong/incorrect but score is too high — fix it
      if ((wLower.includes("incorrect") || wLower.includes("wrong") ||
           wLower.includes("not correct") || wLower.includes("completely wrong") ||
           wLower.includes("off topic") || wLower.includes("irrelevant")) && p.score > 3) {
        p.score = Math.min(p.score, 3);
      }

      // If strengths say "none" but score is above 2 — suspicious
      if ((sLower === "none" || sLower === "none.") && p.score > 2) {
        p.score = Math.min(p.score, 2);
      }

      // Enforce difficulty-based length minimum
      const minWords = difficulty === "Hard" ? 30 : difficulty === "Medium" ? 20 : 10;
      if (words.length < minWords && p.score > 4) {
        p.score = 4;
        p.weaknesses = `Answer is too brief for a ${difficulty} level question. ` + (p.weaknesses || "");
      }

      return p;
    }
  } catch (e) { console.error("evaluate:", e.message); }

  return {
    score: 0,
    topic: "General",
    strengths: "None.",
    weaknesses: "Could not evaluate. Please try again.",
    idealAnswer: "N/A",
  };
}

// ── Generate ideal answer independently (for nonsense answers) ────────────────
async function generateIdealAnswer(question, difficulty, purposeMeta) {
  const diff = DIFF[difficulty] || DIFF.Medium;
  const ctx  = buildDomainContext(purposeMeta);

  const system = `You generate model answers for technical interview questions at ${difficulty} level.
${diff.idealAnswerDepth}`;

  const userPrompt = `Question: ${question}
Difficulty: ${difficulty}
${ctx ? `Context: ${ctx}` : ""}

Write a complete, thorough model answer appropriate for ${difficulty} level.
The answer must cover all key points an expert evaluator would expect.
Respond with ONLY the answer text — no JSON, no labels.`;

  try {
    const raw = await callAI(system, userPrompt);
    return raw.trim();
  } catch {
    return `A complete answer to this question should cover the core concept, how it works, trade-offs, and a real example — at the ${difficulty} level of depth.`;
  }
}

// ── Evaluate MCQ ──────────────────────────────────────────────────────────────
function evaluateMCQ(selectedOption, correctAnswer, explanation, topic) {
  const ok = selectedOption === correctAnswer;
  return {
    score: ok ? 10 : 0,
    topic: topic || "General",
    isCorrect: ok,
    correctAnswer,
    strengths:   ok ? "Correct answer selected." : "None.",
    weaknesses:  ok ? "None." : `Wrong. You selected ${selectedOption} but the correct answer is ${correctAnswer}. ${explanation}`,
    idealAnswer: explanation,
  };
}

// ── Evaluate Fill Blank ───────────────────────────────────────────────────────
function evaluateFillBlank(userAnswer, correctAnswer, acceptedAnswers, explanation, topic) {
  const norm = (s) => s.trim().toLowerCase().replace(/[^a-z0-9 ()^]/g,"").trim();
  const all  = [correctAnswer, ...(acceptedAnswers||[])].map(norm);
  const ok   = all.includes(norm(userAnswer));
  return {
    score: ok ? 10 : 0,
    topic: topic || "General",
    isCorrect: ok,
    correctAnswer,
    strengths:   ok ? "Correct!" : "None.",
    weaknesses:  ok ? "None." : `Incorrect. You answered "${userAnswer}" but the correct answer is "${correctAnswer}".`,
    idealAnswer: explanation,
  };
}

// ── Follow-up ─────────────────────────────────────────────────────────────────
async function generateFollowUp(question, answer, difficulty="Medium", purpose="practice") {
  const diff = DIFF[difficulty] || DIFF.Medium;
  const pp   = PURPOSE_PROFILES[purpose] || PURPOSE_PROFILES.practice;

  const system = `You generate targeted follow-up interview questions. Style: ${pp.tone}`;
  const user   = `Original question: ${question}
Candidate's answer: ${answer}
Difficulty: ${difficulty}

The candidate's answer is incomplete or partially correct.
Identify the BIGGEST gap or misconception in their answer.
Ask ONE sharp follow-up question that probes exactly that gap.
The follow-up must be at the same or slightly higher difficulty.
Respond with ONLY the follow-up question — no preamble, no explanation.`;

  try {
    const raw = await callAI(system, user);
    return raw.trim();
  } catch (e) {
    console.error("followup:", e.message);
    return null;
  }
}

module.exports = {
  generateQuestion, generateMCQ, generateFillBlank,
  evaluateAnswer, evaluateMCQ, evaluateFillBlank,
  generateFollowUp,
};