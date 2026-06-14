import React, { useState } from "react";

const ROLES = [
  "Backend Developer","Frontend Developer","Full Stack Developer",
  "Data Structures & Algorithms","Data Engineer","DevOps Engineer","System Design",
  "Mobile App Developer (Android)","Mobile App Developer (iOS)",
  "Cloud Engineer (AWS/Azure/GCP)","QA Engineer","Data Analyst",
  "Data Scientist","Machine Learning Engineer","AI Research Engineer",
  "Cybersecurity Analyst","Ethical Hacker / Penetration Tester","Network Engineer",
  "Product Manager","Business Analyst","Technical Project Manager","Scrum Master",
  "Site Reliability Engineer (SRE)",
];

const COMPETITIVE_EXAMS = [
  "GATE (Computer Science)","GATE (Electronics & Communication)",
  "GATE (Electrical Engineering)","GATE (Mechanical Engineering)",
  "UPSC CSE (General Studies)","UPSC CSE (Optional: Computer Science)",
  "UPSC CSE (Optional: Mathematics)","UPSC CSE (Optional: Economics)",
  "UPSC CSE (Optional: Public Administration)",
  "IAS (Administrative Service)","IPS (Police Service)",
  "IFS (Foreign Service)","IRS (Revenue Service)",
  "IBPS PO (Bank Probationary Officer)","IBPS Clerk","SBI PO","RBI Grade B Officer",
  "SSC CGL (Combined Graduate Level)","SSC CHSL",
  "NDA (National Defence Academy)","CDS (Combined Defence Services)",
  "DRDO Scientist","ISRO Scientist / Engineer","Railways (RRB JE / RRB NTPC)",
  "UGC NET (Computer Science)","PhD Research Interview (CS)",
  "JEE (Main & Advanced)","NEET","CAT (MBA Entrance)","CLAT (Law Entrance)",
  "CUET (Central University Entrance)",
];

const DIFFICULTIES = ["Easy","Medium","Hard"];

const QUESTION_TYPES = [
  { value:"openended", label:"Open Ended",    sub:"AI evaluates" },
  { value:"mcq",       label:"MCQ",           sub:"Instant scoring" },
  { value:"fillblank", label:"Fill in Blank", sub:"Complete it" },
];

const PURPOSES = [
  { value:"exam",     label:"Exam Prep",         icon:"📚", desc:"University or competitive", color:"#6366f1" },
  { value:"company",  label:"Company Interview", icon:"🏢", desc:"FAANG, startups, any company", color:"#22c55e" },
  { value:"practice", label:"Free Practice",     icon:"🎯", desc:"Learn at your pace",           color:"#f59e0b" },
];

const PRACTICE_TOPIC_GROUPS = {
  "💻 Programming & CS": ["Data Structures","Algorithms","OOP Concepts","Design Patterns","System Design","Operating Systems","Computer Networks","Databases","Compiler Design","Theory of Computation"],
  "🌐 Web Development":  ["HTML & CSS","JavaScript","React","Node.js","REST APIs","GraphQL","Web Security","Performance Optimization","Testing","DevOps & CI/CD"],
  "🤖 AI & Data":        ["Machine Learning","Deep Learning","NLP","Computer Vision","Statistics","Data Analysis","SQL","Data Engineering","MLOps","AI Ethics"],
  "☁️ Cloud & Infra":    ["AWS","Azure","GCP","Docker","Kubernetes","Terraform","Monitoring","Networking","Linux","Security"],
  "📊 Business & PM":    ["Product Strategy","Agile & Scrum","Business Analysis","Stakeholder Management","Data-Driven Decisions","Go-to-Market","User Research","KPIs & Metrics"],
  "🔐 Security":         ["Network Security","Cryptography","Ethical Hacking","OWASP","Incident Response","Malware Analysis","Forensics","Compliance"],
};

const DAILY_GOALS = [
  { value:5,  label:"5 questions",  desc:"Quick warmup",   icon:"⚡" },
  { value:10, label:"10 questions", desc:"Daily practice", icon:"🔥" },
  { value:20, label:"20 questions", desc:"Deep session",   icon:"🚀" },
  { value:0,  label:"No limit",     desc:"Go until done",  icon:"♾️" },
];

const LEARNING_PATHS = [
  { value:"fundamentals", label:"Build Fundamentals",  desc:"Start from basics and build a solid foundation", icon:"🏗️", color:"#22c55e" },
  { value:"interview",    label:"Interview Ready",      desc:"Focus on most commonly asked interview topics",  icon:"💼", color:"#6366f1" },
  { value:"advanced",     label:"Advanced Mastery",     desc:"Deep dive into complex and expert-level topics", icon:"🎓", color:"#a855f7" },
  { value:"weak",         label:"Fix Weak Areas",       desc:"AI focuses on your historically weak topics",   icon:"🎯", color:"#f59e0b" },
  { value:"explore",      label:"Explore & Discover",   desc:"Random mix across all topics — keep it fresh",  icon:"🌏", color:"#22d3ee" },
];

export default function SetupPage({ onStart, loading, error }) {
  const [purpose, setPurpose]               = useState("practice");

  // Exam state
  const [examType, setExamType]             = useState("");
  const [university, setUniversity]         = useState("");
  const [course, setCourse]                 = useState("");
  const [semester, setSemester]             = useState("");
  const [subject, setSubject]               = useState("");
  const [syllabus, setSyllabus]             = useState("");
  const [compExam, setCompExam]             = useState("");
  const [compSearch, setCompSearch]         = useState("");

  // Company state
  const [companyName, setCompanyName]       = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Common
  const [role, setRole]                     = useState("");
  const [roleSearch, setRoleSearch]         = useState("");
  const [difficulty, setDiff]               = useState("Medium");
  const [qType, setQType]                   = useState("openended");

  // Practice state
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [dailyGoal, setDailyGoal]           = useState(10);
  const [learningPath, setLearningPath]     = useState("interview");
  const [practiceStep, setPracticeStep]     = useState(1);

  const selPurpose    = PURPOSES.find(p => p.value === purpose);
  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()));
  const filteredExams = COMPETITIVE_EXAMS.filter(e => e.toLowerCase().includes(compSearch.toLowerCase()));

  const streak        = parseInt(localStorage.getItem("practice_streak") || "0");
  const lastDate      = localStorage.getItem("practice_last_date");
  const currentStreak = lastDate === new Date().toDateString() ? streak :
                        lastDate === new Date(Date.now()-86400000).toDateString() ? streak : 0;

  const toggleTopic = (t) =>
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const buildRole = () => {
    if (purpose === "exam") {
      if (examType === "university") return `University Exam — ${university} | ${course} | ${semester} | ${subject}`;
      if (examType === "competitive") return compExam;
    }
    if (purpose === "company")  return role || roleSearch.trim();
    if (purpose === "practice") return role || "General Practice";
    return role;
  };

  const buildMeta = () => {
    if (purpose === "exam" && examType === "university") {
      return { examType:"university", university, course, semester, subject, syllabus:syllabus.trim() };
    }
    if (purpose === "exam" && examType === "competitive") {
      return { examType:"competitive", exam:compExam };
    }
    if (purpose === "company") {
      return {
        companyName:    companyName.trim(),
        jobDescription: jobDescription.trim(),
      };
    }
    if (purpose === "practice") {
      return { learningPath, selectedTopics, dailyGoal };
    }
    return null;
  };

  const isReady = () => {
    if (purpose === "exam") {
      if (!examType) return false;
      if (examType === "university") return !!(university.trim() && course.trim() && semester.trim() && subject.trim());
      if (examType === "competitive") return !!compExam;
    }
    if (purpose === "company")  return !!(role || roleSearch.trim());
    if (purpose === "practice") return practiceStep === 3;
    return !!role;
  };

  const handleStart = () => {
    if (!isReady()) return;
    onStart(buildRole(), difficulty, qType, purpose, buildMeta());
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-title">
          <div className="logo-mark">AI</div>
          <h1>Configure your session</h1>
          <p>Adaptive interviews powered by AI</p>
        </div>

        {/* ── Purpose ── */}
        <span className="section-label">Interview Purpose</span>
        <div className="purpose-grid" style={{ marginBottom:20 }}>
          {PURPOSES.map(p => (
            <button
              key={p.value}
              className={`purpose-card ${purpose === p.value ? "active" : ""}`}
              style={purpose === p.value ? { borderColor:p.color, background:p.color+"15" } : {}}
              onClick={() => {
                setPurpose(p.value);
                setExamType(""); setRole(""); setRoleSearch("");
                setCompExam(""); setCompSearch("");
                setCompanyName(""); setJobDescription("");
                if (p.value === "practice") setPracticeStep(1);
              }}
            >
              <span className="p-icon">{p.icon}</span>
              <span className="p-label" style={purpose === p.value ? { color:p.color } : {}}>{p.label}</span>
              <span className="p-desc">{p.desc}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            EXAM PREP FLOW
        ══════════════════════════════════════════ */}
        {purpose === "exam" && (
          <>
            <span className="section-label">Exam Type</span>
            <div className="examtype-grid">
              <button
                className={`examtype-card ${examType === "university" ? "active" : ""}`}
                onClick={() => setExamType("university")}
              >
                <span className="et-icon">🎓</span>
                <div>
                  <span className="et-label">University Exam</span>
                  <span className="et-desc">Your college / university subject exam</span>
                </div>
              </button>
              <button
                className={`examtype-card ${examType === "competitive" ? "active" : ""}`}
                onClick={() => setExamType("competitive")}
              >
                <span className="et-icon">🏆</span>
                <div>
                  <span className="et-label">Competitive Exam</span>
                  <span className="et-desc">GATE, UPSC, JEE, NEET, CAT and more</span>
                </div>
              </button>
            </div>

            {examType === "university" && (
              <div className="uni-form">
                <div className="fg">
                  <label>University / College</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi University, VTU, Anna University..."
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                  />
                </div>
                <div className="fg">
                  <label>Course / Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science, BCA, MBA..."
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                  />
                </div>
                <div className="uni-row">
                  <div className="fg">
                    <label>Year / Semester</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Year / Sem 5"
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                    />
                  </div>
                  <div className="fg">
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Data Structures, DBMS..."
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                </div>
                <div className="fg">
                  <label>Syllabus Topics <span className="label-muted">— paste your syllabus</span></label>
                  <textarea
                    className="syllabus-area"
                    placeholder={"Unit 1: Arrays, Linked Lists, Stacks, Queues\nUnit 2: Trees, Graphs, Hashing\nUnit 3: Sorting and Searching..."}
                    value={syllabus}
                    onChange={e => setSyllabus(e.target.value)}
                    rows={4}
                  />
                  <span className="syllabus-hint">💡 More detail = more accurate questions</span>
                </div>
              </div>
            )}

            {examType === "competitive" && (
              <div className="fg">
                <label>Select Exam</label>
                <input
                  className="role-search-input"
                  type="text"
                  placeholder="Search — GATE, UPSC, JEE, NEET, CAT..."
                  value={compSearch}
                  onChange={e => { setCompSearch(e.target.value); setCompExam(""); }}
                />
                <div className="role-list" style={{ marginTop:6 }}>
                  {filteredExams.map(e => (
                    <div
                      key={e}
                      className={`role-item ${compExam === e ? "selected" : ""}`}
                      onClick={() => { setCompExam(e); setCompSearch(e); }}
                    >{e}</div>
                  ))}
                </div>
              </div>
            )}

            {examType && (
              <>
                <div className="config-row">
                  <div className="config-box">
                    <span className="section-label" style={{ marginBottom:0 }}>Difficulty</span>
                    <div className="diff-row">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d}
                          className={`diff-pill ${d.toLowerCase()} ${difficulty === d ? "on" : ""}`}
                          onClick={() => setDiff(d)}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="config-box">
                    <span className="section-label" style={{ marginBottom:0 }}>Question Type</span>
                    <div className="qtype-col">
                      {QUESTION_TYPES.map(qt => (
                        <button
                          key={qt.value}
                          className={`qtype-pill ${qType === qt.value ? "on" : ""}`}
                          onClick={() => setQType(qt.value)}
                        >
                          <span>{qt.label}</span>
                          <span className="qt-sub">{qt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && <div className="error-banner" style={{ marginBottom:12 }}>{error}</div>}

                <button
                  className="start-btn"
                  onClick={handleStart}
                  disabled={loading || !isReady()}
                  style={{ background:"#6366f1" }}
                >
                  {loading ? "Starting..." : "Start Exam Prep →"}
                </button>
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            COMPANY INTERVIEW FLOW
        ══════════════════════════════════════════ */}
        {purpose === "company" && (
          <>
            <div className="company-jd-banner">
              <span className="cjd-icon">🏢</span>
              <div>
                <span className="cjd-title">Personalised Company Interview</span>
                <span className="cjd-desc">Add the company name and paste the job description for highly targeted questions</span>
              </div>
            </div>

            <div className="fg">
              <label>Company Name <span className="label-muted">— optional</span></label>
              <input
                type="text"
                placeholder="e.g. Google, Infosys, Zomato, TCS, Flipkart..."
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>

            <div className="fg">
              <label>Job Role</label>
              <input
                className="role-search-input"
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={e => { setRoleSearch(e.target.value); setRole(""); }}
              />
              <div className="role-list" style={{ marginTop:6 }}>
                {filteredRoles.map(r => (
                  <div
                    key={r}
                    className={`role-item ${role === r ? "selected" : ""}`}
                    onClick={() => { setRole(r); setRoleSearch(r); }}
                  >{r}</div>
                ))}
              </div>
            </div>

            <div className="fg">
              <label>
                Job Description
                <span className="label-muted"> — paste the JD from the job posting</span>
              </label>
              <textarea
                className="syllabus-area"
                placeholder={`Paste the job description here...\n\nExample:\n• 3+ years of experience with React and Node.js\n• Experience with REST APIs and microservices\n• Proficiency in SQL and NoSQL databases\n• Strong understanding of system design principles\n• Experience with AWS or Azure cloud services...`}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={6}
              />
              <span className="syllabus-hint">
                💡 Pasting the full JD makes questions match exactly what the company is testing for
              </span>
            </div>

            <div className="config-row">
              <div className="config-box">
                <span className="section-label" style={{ marginBottom:0 }}>Difficulty</span>
                <div className="diff-row">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      className={`diff-pill ${d.toLowerCase()} ${difficulty === d ? "on" : ""}`}
                      onClick={() => setDiff(d)}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="config-box">
                <span className="section-label" style={{ marginBottom:0 }}>Question Type</span>
                <div className="qtype-col">
                  {QUESTION_TYPES.map(qt => (
                    <button
                      key={qt.value}
                      className={`qtype-pill ${qType === qt.value ? "on" : ""}`}
                      onClick={() => setQType(qt.value)}
                    >
                      <span>{qt.label}</span>
                      <span className="qt-sub">{qt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="error-banner" style={{ marginBottom:12 }}>{error}</div>}

            <button
              className="start-btn"
              onClick={handleStart}
              disabled={loading || !isReady()}
              style={{ background:"#22c55e" }}
            >
              {loading ? "Starting..." : `Start ${companyName ? companyName + " " : ""}Interview →`}
            </button>
          </>
        )}

        {/* ══════════════════════════════════════════
            FREE PRACTICE FLOW
        ══════════════════════════════════════════ */}
        {purpose === "practice" && (
          <div className="practice-flow">

            {/* Step indicator */}
            <div className="practice-steps">
              {["Learning Path","Topics","Settings"].map((s,i) => (
                <div
                  key={s}
                  className={`ps-item ${practiceStep > i+1 ? "done" : ""} ${practiceStep === i+1 ? "active" : ""}`}
                >
                  <div className="ps-dot">{practiceStep > i+1 ? "✓" : i+1}</div>
                  <span className="ps-label">{s}</span>
                </div>
              ))}
              <div className="ps-line" />
            </div>

            {/* ── Step 1 — Learning path ── */}
            {practiceStep === 1 && (
              <div className="practice-step-content">
                {currentStreak > 0 && (
                  <div className="streak-banner">
                    🔥 <strong>{currentStreak} day streak!</strong> Keep it up!
                  </div>
                )}

                <span className="section-label">Choose your learning path</span>
                <div className="path-grid">
                  {LEARNING_PATHS.map(lp => (
                    <button
                      key={lp.value}
                      className={`path-card ${learningPath === lp.value ? "active" : ""}`}
                      style={learningPath === lp.value ? { borderColor:lp.color, background:lp.color+"12" } : {}}
                      onClick={() => setLearningPath(lp.value)}
                    >
                      <span className="path-icon">{lp.icon}</span>
                      <div>
                        <span className="path-label" style={learningPath === lp.value ? { color:lp.color } : {}}>{lp.label}</span>
                        <span className="path-desc">{lp.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <span className="section-label" style={{ marginTop:16 }}>Daily goal</span>
                <div className="goal-grid">
                  {DAILY_GOALS.map(g => (
                    <button
                      key={g.value}
                      className={`goal-card ${dailyGoal === g.value ? "active" : ""}`}
                      onClick={() => setDailyGoal(g.value)}
                    >
                      <span className="goal-icon">{g.icon}</span>
                      <span className="goal-label">{g.label}</span>
                      <span className="goal-desc">{g.desc}</span>
                    </button>
                  ))}
                </div>

                <button className="practice-next-btn" onClick={() => setPracticeStep(2)}>
                  Next: Choose Topics →
                </button>
              </div>
            )}

            {/* ── Step 2 — Topic picker ── */}
            {practiceStep === 2 && (
              <div className="practice-step-content">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span className="section-label" style={{ margin:0 }}>
                    Pick topics to focus on
                    <span style={{ color:"var(--text4)", fontWeight:400, textTransform:"none", letterSpacing:0, marginLeft:8, fontSize:10 }}>
                      — leave empty for all topics
                    </span>
                  </span>
                  {selectedTopics.length > 0 && (
                    <button
                      onClick={() => setSelectedTopics([])}
                      style={{ background:"none", border:"none", color:"var(--text4)", fontSize:11, cursor:"pointer" }}
                    >Clear all</button>
                  )}
                </div>

                {selectedTopics.length > 0 && (
                  <div className="selected-topics-bar">
                    {selectedTopics.map(t => (
                      <span key={t} className="selected-topic-chip" onClick={() => toggleTopic(t)}>
                        {t} ✕
                      </span>
                    ))}
                  </div>
                )}

                {Object.entries(PRACTICE_TOPIC_GROUPS).map(([group, topics]) => (
                  <div key={group} className="topic-group">
                    <span className="topic-group-label">{group}</span>
                    <div className="topic-chip-grid">
                      {topics.map(t => (
                        <button
                          key={t}
                          className={`topic-chip-btn ${selectedTopics.includes(t) ? "selected" : ""}`}
                          onClick={() => toggleTopic(t)}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button className="practice-back-btn" onClick={() => setPracticeStep(1)}>← Back</button>
                  <button
                    className="practice-next-btn"
                    style={{ flex:1 }}
                    onClick={() => setPracticeStep(3)}
                  >
                    Next: Configure Session →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3 — Config ── */}
            {practiceStep === 3 && (
              <div className="practice-step-content">
                <div className="practice-summary">
                  <div className="ps-summary-row">
                    <span className="ps-summary-label">Learning Path</span>
                    <span className="ps-summary-val">
                      {LEARNING_PATHS.find(l => l.value === learningPath)?.icon}{" "}
                      {LEARNING_PATHS.find(l => l.value === learningPath)?.label}
                    </span>
                  </div>
                  <div className="ps-summary-row">
                    <span className="ps-summary-label">Daily Goal</span>
                    <span className="ps-summary-val">
                      {DAILY_GOALS.find(g => g.value === dailyGoal)?.label}
                    </span>
                  </div>
                  <div className="ps-summary-row">
                    <span className="ps-summary-label">Topics</span>
                    <span className="ps-summary-val">
                      {selectedTopics.length > 0 ? `${selectedTopics.length} selected` : "All topics"}
                    </span>
                  </div>
                </div>

                <div className="fg" style={{ marginTop:16 }}>
                  <label>
                    Focus on a specific role
                    <span className="label-muted"> — optional</span>
                  </label>
                  <input
                    className="role-search-input"
                    type="text"
                    placeholder="e.g. Backend Developer, Data Scientist..."
                    value={roleSearch}
                    onChange={e => { setRoleSearch(e.target.value); setRole(""); }}
                  />
                  {roleSearch && (
                    <div className="role-list" style={{ marginTop:6 }}>
                      {filteredRoles.slice(0,6).map(r => (
                        <div
                          key={r}
                          className={`role-item ${role === r ? "selected" : ""}`}
                          onClick={() => { setRole(r); setRoleSearch(r); }}
                        >{r}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="config-row" style={{ marginTop:12 }}>
                  <div className="config-box">
                    <span className="section-label" style={{ marginBottom:0 }}>Difficulty</span>
                    <div className="diff-row">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d}
                          className={`diff-pill ${d.toLowerCase()} ${difficulty === d ? "on" : ""}`}
                          onClick={() => setDiff(d)}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="config-box">
                    <span className="section-label" style={{ marginBottom:0 }}>Question Type</span>
                    <div className="qtype-col">
                      {QUESTION_TYPES.map(qt => (
                        <button
                          key={qt.value}
                          className={`qtype-pill ${qType === qt.value ? "on" : ""}`}
                          onClick={() => setQType(qt.value)}
                        >
                          <span>{qt.label}</span>
                          <span className="qt-sub">{qt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && <div className="error-banner" style={{ marginBottom:12 }}>{error}</div>}

                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <button className="practice-back-btn" onClick={() => setPracticeStep(2)}>← Back</button>
                  <button
                    className="start-btn"
                    style={{ flex:1, background:"#f59e0b" }}
                    onClick={handleStart}
                    disabled={loading}
                  >
                    {loading ? "Starting..." : "Start Free Practice →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}