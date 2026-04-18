import { useState, useEffect, useRef } from "react";

// ============================================================
// GRADEOPS - Full UI
// Light Green Modern Theme | Smooth Animations
// ============================================================
// BACKEND CONNECTION GUIDE (search for "BACKEND:" comments)
// ============================================================

const theme = {
  bg: "#f0faf4",
  bgCard: "#ffffff",
  bgSidebar: "#1a2e22",
  green1: "#22c55e",
  green2: "#16a34a",
  green3: "#bbf7d0",
  green4: "#dcfce7",
  greenDark: "#14532d",
  text: "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#d1fae5",
  shadow: "0 4px 24px rgba(34,197,94,0.10)",
  shadowLg: "0 8px 40px rgba(34,197,94,0.16)",
};

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ── Inject global styles ──────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    ${fonts}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${theme.bg}; color: ${theme.text}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${theme.green4}; }
    ::-webkit-scrollbar-thumb { background: ${theme.green1}; border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .fade-up   { animation: fadeUp 0.5s ease both; }
    .fade-in   { animation: fadeIn 0.4s ease both; }
    .slide-in  { animation: slideIn 0.4s ease both; }
    .btn-hover {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-hover:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadowLg};
    }
    .btn-hover:active { transform: translateY(0); }
    .card-hover {
      transition: all 0.25s ease;
    }
    .card-hover:hover {
      transform: translateY(-3px);
      box-shadow: ${theme.shadowLg};
    }
    .nav-item {
      transition: all 0.2s ease;
      cursor: pointer;
      border-radius: 10px;
    }
    .nav-item:hover { background: rgba(34,197,94,0.12); }
    .nav-item.active { background: rgba(34,197,94,0.2); color: ${theme.green1}; }
    .shimmer {
      background: linear-gradient(90deg, #e8fdf0 25%, #d1fae5 50%, #e8fdf0 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite;
    }
    input, textarea, select {
      font-family: 'DM Sans', sans-serif;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 500;
    }
    .tag-green { background: ${theme.green4}; color: ${theme.green2}; }
    .tag-yellow { background: #fefce8; color: #a16207; }
    .tag-red { background: #fef2f2; color: #dc2626; }
    .tag-blue { background: #eff6ff; color: #2563eb; }
  `}</style>
);

// ── Reusable Components ──────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    grade: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    rubric: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    review: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></svg>,
    pdf: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6M9 11h6M9 7h2"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    stats: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    flag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    key: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  };
  return icons[name] || null;
};

const Spinner = () => (
  <div style={{ width: 18, height: 18, border: `2px solid rgba(255,255,255,0.3)`, borderTop: `2px solid white`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
);

const StatCard = ({ label, value, sub, color = theme.green1, delay = 0, icon }) => (
  <div className="card-hover fade-up" style={{ background: theme.bgCard, borderRadius: 16, padding: "20px 24px", boxShadow: theme.shadow, border: `1px solid ${theme.border}`, animationDelay: `${delay}s`, flex: 1, minWidth: 150 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "Syne", color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: theme.textLight, marginTop: 4 }}>{sub}</div>}
      </div>
      {icon && <div style={{ background: `${color}18`, borderRadius: 12, padding: 10, color }}><Icon name={icon} size={20} color={color} /></div>}
    </div>
  </div>
);

// ── LOGIN PAGE ────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState("instructor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { 
      setError("Please fill all fields"); 
      return; 
    }
    setLoading(true);
    setError("");

    try {
      // Call our real backend API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // Login failed - show error message
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Login successful!
      // Save token to localStorage (keeps user logged in)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userName", data.user.name);

      // Go to dashboard
      setLoading(false);
      onLogin(data.user.role, { 
        name: data.user.name, 
        email: data.user.email 
      });

    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Background circles */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(34,197,94,0.08)", top: -100, right: -100 }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(34,197,94,0.06)", bottom: -80, left: -80 }} />

      <div className="fade-up" style={{ background: "white", borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(34,197,94,0.15)", border: `1px solid ${theme.border}` }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, borderRadius: 16, marginBottom: 16, boxShadow: `0 4px 16px rgba(34,197,94,0.3)` }}>
            <Icon name="brain" size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: theme.greenDark, letterSpacing: -0.5 }}>GradeOps</h1>
          <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>AI-Powered Exam Grading System</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: "flex", background: theme.green4, borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {["instructor", "ta"].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, background: role === r ? "white" : "transparent", color: role === r ? theme.green2 : theme.textMuted, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: role === r ? "0 2px 8px rgba(0,0,0,0.08)" : "none", fontFamily: "DM Sans" }}>
              {r === "instructor" ? "🤡Instructor" : "🤡Teaching Assistant"}
            </button>
          ))}
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" type="email"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", transition: "border 0.2s", background: theme.bg }}
              onFocus={e => e.target.style.border = `1.5px solid ${theme.green1}`}
              onBlur={e => e.target.style.border = `1.5px solid ${theme.border}`}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", transition: "border 0.2s", background: theme.bg }}
              onFocus={e => e.target.style.border = `1.5px solid ${theme.green1}`}
              onBlur={e => e.target.style.border = `1.5px solid ${theme.border}`}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button className="btn-hover" onClick={handleLogin} disabled={loading}
            style={{ marginTop: 8, padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(34,197,94,0.35)" }}>
            {loading ? <><Spinner /> Signing in...</> : "Sign In →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: theme.textLight }}>GradeOps v1.0 · Built for CS Department</p>
      </div>
    </div>
  );
};

// ── SIDEBAR ───────────────────────────────────────────────
const Sidebar = ({ page, setPage, role, user, onLogout }) => {
  const navItems = role === "instructor"
    ? [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "upload", label: "Upload Exams", icon: "upload" },
        { id: "rubrics", label: "Rubrics", icon: "rubric" },
        { id: "results", label: "Results", icon: "stats" },
        { id: "plagiarism", label: "Plagiarism", icon: "flag" },
        { id: "students", label: "Students", icon: "users" },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "review", label: "Review Queue", icon: "review" },
        { id: "results", label: "Results", icon: "stats" },
        { id: "plagiarism", label: "Plagiarism", icon: "flag" },
      ];

  return (
    <div style={{ width: 240, background: theme.bgSidebar, height: "100vh", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", padding: "24px 16px", zIndex: 100 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 36 }}>
        <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="brain" size={20} color="white" />
        </div>
        <span style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 800, color: "white" }}>GradeOps</span>
      </div>

      {/* Role badge */}
      <div style={{ background: "rgba(34,197,94,0.12)", borderRadius: 10, padding: "10px 12px", marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: theme.green1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{role === "instructor" ? "👨‍🏫 Instructor" : "🧑‍💻 Teaching Assistant"}</div>
        <div style={{ color: "white", fontWeight: 600, fontSize: 14, marginTop: 2 }}>{user?.name}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item, i) => (
          <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", marginBottom: 4, color: page === item.id ? theme.green1 : "rgba(255,255,255,0.65)", fontWeight: 500, fontSize: 14, animationDelay: `${i * 0.05}s` }}>
            <Icon name={item.icon} size={17} color={page === item.id ? theme.green1 : "rgba(255,255,255,0.65)"} />
            {item.label}
            {item.id === "review" && <span style={{ marginLeft: "auto", background: theme.green1, color: "white", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>5</span>}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="nav-item" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        <Icon name="logout" size={17} color="rgba(255,255,255,0.5)" />
        Logout
      </div>
    </div>
  );
};

// ── TOP BAR ───────────────────────────────────────────────
const TopBar = ({ title, subtitle }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
    <div>
      <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>{title}</h1>
      {subtitle && <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 2 }}>{subtitle}</p>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Icon name="search" size={16} color={theme.textMuted} />
        <input placeholder="Search..." style={{ marginLeft: 8, border: `1.5px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px 8px 6px", fontSize: 13, outline: "none", background: "white", width: 180, color: theme.text }} />
      </div>
      <div style={{ position: "relative", cursor: "pointer" }}>
        <div style={{ width: 38, height: 38, background: "white", border: `1.5px solid ${theme.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bell" size={17} color={theme.textMuted} />
        </div>
        <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: theme.green1, borderRadius: "50%", border: "2px solid white" }} />
      </div>
    </div>
  </div>
);

// ── DASHBOARD PAGE ────────────────────────────────────────
const DashboardPage = ({ role }) => {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalSubmissions: 0,
    pendingReview: 0,
    completed: 0
  });
  const [exams, setExams] = useState([]);
  const [activities, setActivities] = useState([]);

  // Fetch Stats
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(err => console.log('Stats error:', err));
  }, []);

  // Fetch Exams
  useEffect(() => {
    fetch('/api/upload/exams')
      .then(r => r.json())
      .then(data => {
        const formatted = data.map(exam => ({
          name: exam.name,
          students: exam.totalStudents || 0,
          graded: exam.graded || 0,
          pending: exam.pending || 0,
          date: new Date(exam.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          courseCode: exam.courseCode,
          status: exam.status,
          id: exam._id
        }));
        setExams(formatted);
      })
      .catch(err => console.log('Exams error:', err));
  }, []);

  // Fetch Activity
  useEffect(() => {
    fetch('/api/dashboard/activity')
      .then(r => r.json())
      .then(data => setActivities(Array.isArray(data) ? data : []))
      .catch(err => console.log('Activity error:', err));
  }, []);

  return (
    <div className="fade-in">
      <TopBar 
        title="Dashboard" 
        subtitle="Welcome back! Here's today's overview." 
      />

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard 
          label="Total Exams" 
          value={stats.totalExams} 
          icon="grade" 
          delay={0} 
        />
        <StatCard 
          label="Total Submissions" 
          value={stats.totalSubmissions} 
          icon="check" 
          color="#16a34a" 
          delay={0.05} 
        />
        <StatCard 
          label="Pending Review" 
          value={stats.pendingReview} 
          icon="review" 
          color="#f59e0b" 
          delay={0.1} 
        />
        <StatCard 
          label="Completed" 
          value={stats.completed} 
          icon="flag" 
          color="#ef4444" 
          delay={0.15} 
        />
      </div>

      {/* Recent Exams Table */}
      <div className="fade-up" style={{ background: "white", borderRadius: 18, boxShadow: theme.shadow, border: `1px solid ${theme.border}`, padding: "24px", marginBottom: 24, animationDelay: "0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 700 }}>
            Recent Exams
          </h2>
          <span className="tag tag-green">Live</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.green4}` }}>
                {["Exam Name", "Students", "Graded", "Pending", "Date", "Status"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: theme.textMuted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 14px", textAlign: "center", color: theme.textMuted }}>
                    No exams yet. Upload your first exam!
                  </td>
                </tr>
              ) : (
                exams.map((e, i) => (
                  <tr 
                    key={i} 
                    style={{ borderBottom: `1px solid ${theme.green4}`, transition: "background 0.15s" }}
                    onMouseEnter={ev => ev.currentTarget.style.background = theme.bg}
                    onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 14px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name="pdf" size={16} color={theme.green1} />
                        {e.name}
                      </div>
                    </td>
                    <td style={{ padding: "14px 14px", color: theme.textMuted }}>
                      {e.students}
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <span style={{ color: theme.green2, fontWeight: 600 }}>
                        {e.graded || 0}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      {(e.pending || 0) > 0 ? (
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                          {e.pending}
                        </span>
                      ) : (
                        <span style={{ color: theme.green2 }}>✓ Done</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 14px", color: theme.textMuted, fontSize: 13 }}>
                      {e.date}
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <span className={`tag ${e.pending === 0 ? "tag-green" : "tag-yellow"}`}>
                        {e.pending === 0 ? "Complete" : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Activity */}
      <div className="fade-up" style={{ background: "white", borderRadius: 18, boxShadow: theme.shadow, border: `1px solid ${theme.border}`, padding: 24, animationDelay: "0.25s" }}>
        <h2 style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
          AI Grading Activity
        </h2>

        {activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: theme.textMuted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <p style={{ fontSize: 14 }}>No activity yet!</p>
            <p style={{ fontSize: 12, color: theme.textLight, marginTop: 4 }}>
              Upload exams to see AI grading activity
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activities.map((a, i) => (
              <div 
                key={i} 
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: theme.bg, borderRadius: 10 }}
              >
                <div style={{ background: theme.green4, borderRadius: 8, padding: 8, flexShrink: 0 }}>
                  <Icon name={a.icon || "brain"} size={15} color={theme.green2} />
                </div>
                <span style={{ fontSize: 13, flex: 1 }}>
                  {a.text}
                </span>
                <span style={{ fontSize: 12, color: theme.textLight, whiteSpace: "nowrap" }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// ── UPLOAD PAGE ───────────────────────────────────────────
const UploadPage = () => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [examName, setExamName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [rubric, setRubric] = useState('');
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    if (!examName || !courseCode || !totalMarks || !rubric) {
      alert('Please fill all exam details!');
      return;
    }
    setUploading(true);

    try {
      // Step 1: Create exam
      const examRes = await fetch('/api/upload/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: examName, 
          courseCode, 
          totalMarks, 
          rubric 
        })
      });
      const examData = await examRes.json();
      const examId = examData.exam._id;

      // Step 2: Upload each PDF
      for (const file of files) {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('studentName', file.name.replace('.pdf', ''));
        formData.append('studentRoll', `ROLL${Math.floor(Math.random() * 1000)}`);

        await fetch(`/api/upload/pdf/${examId}`, {
          method: 'POST',
          body: formData
        });
      }

      setUploading(false);
      setUploaded(true);
      alert('Uploaded! AI grading started! 🚀');

    } catch (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <TopBar title="Upload Exams" subtitle="Upload scanned exam PDFs for AI grading" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div>
          {/* Drop zone */}
          <div 
            onDragOver={e => { e.preventDefault(); setDragging(true); }} 
            onDragLeave={() => setDragging(false)} 
            onDrop={handleDrop} 
            onClick={() => fileRef.current.click()}
            style={{ border: `2.5px dashed ${dragging ? theme.green1 : theme.border}`, borderRadius: 18, padding: "56px 24px", textAlign: "center", background: dragging ? theme.green4 : "white", cursor: "pointer", transition: "all 0.2s", marginBottom: 20 }}
          >
            <input 
              ref={fileRef} 
              type="file" 
              multiple 
              accept=".pdf" 
              style={{ display: "none" }} 
              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])} 
            />
            <div style={{ width: 64, height: 64, background: theme.green4, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon name="upload" size={28} color={theme.green2} />
            </div>
            <h3 style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              Drop PDF files here
            </h3>
            <p style={{ color: theme.textMuted, fontSize: 14 }}>
              or <span style={{ color: theme.green1, fontWeight: 600 }}>browse files</span>
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                Files ({files.length})
              </h3>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < files.length - 1 ? `1px solid ${theme.green4}` : "none" }}>
                  <Icon name="pdf" size={18} color={theme.green1} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button 
                    onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} 
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Icon name="x" size={15} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <button 
            className="btn-hover" 
            onClick={handleUpload} 
            disabled={uploading || !files.length}
            style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: files.length ? `linear-gradient(135deg, ${theme.green1}, ${theme.green2})` : "#e5e7eb", color: files.length ? "white" : "#9ca3af", fontSize: 15, fontWeight: 700, cursor: files.length ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {uploading ? (
              <><Spinner /> Uploading...</>
            ) : uploaded ? (
              "✓ Uploaded!"
            ) : (
              `Upload ${files.length || ""} Files`
            )}
          </button>
        </div>

        {/* Exam details form */}
        <div style={{ background: "white", borderRadius: 18, border: `1px solid ${theme.border}`, padding: 24, boxShadow: theme.shadow, height: "fit-content" }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, marginBottom: 18 }}>
            Exam Details
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>
              Exam Name
            </label>
            <input 
              placeholder="e.g. Data Structures Mid-Term"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>
              Course Code
            </label>
            <input 
              placeholder="e.g. CS301"
              value={courseCode}
              onChange={e => setCourseCode(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>
              Total Marks
            </label>
            <input 
              placeholder="e.g. 100"
              value={totalMarks}
              onChange={e => setTotalMarks(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: "block", marginBottom: 6 }}>
              Rubric
            </label>
            <textarea
              placeholder="Q1: Arrays 10 marks. Q2: Linked Lists 10 marks..."
              value={rubric}
              onChange={e => setRubric(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg, resize: "vertical", fontFamily: "DM Sans" }} 
            />
          </div>

          <div style={{ background: theme.green4, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 8 }}>
            <Icon name="brain" size={16} color={theme.green2} />
            <p style={{ fontSize: 12, color: theme.greenDark, lineHeight: 1.5 }}>
              AI will auto-grade against your rubric!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── RUBRICS PAGE ──────────────────────────────────────────
const RubricsPage = () => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [criteria, setCriteria] = useState([{ 
    question: "", maxMarks: "", keywords: "" 
  }]);
  const [selectedRubric, setSelectedRubric] = useState(null); // ADD
  const [showModal, setShowModal] = useState(false); // ADD

  // Fetch real rubrics from database
  useEffect(() => {
    fetch('/api/rubrics')
      .then(r => r.json())
      .then(data => {
        console.log('Rubrics loaded:', data);
        setRubrics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.log('Rubrics error:', err);
        setLoading(false);
      });
  }, []);

  const addCriteria = () => setCriteria(prev => [
    ...prev, 
    { question: "", maxMarks: "", keywords: "" }
  ]);

  const saveRubric = async () => {
    if (!newName) {
      alert('Please enter a rubric name!');
      return;
    }
    try {
      // Create exam with rubric
      const res = await fetch(
        '/api/upload/exam',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName,
            courseCode: 'CUSTOM',
            totalMarks: criteria.reduce(
              (s, c) => s + (+c.maxMarks || 0), 0
            ),
            rubric: criteria.map(c => 
              `${c.question}: ${c.maxMarks} marks. ${c.keywords}`
            ).join(' ')
          })
        }
      );
      const data = await res.json();
      
      // Add to list
      setRubrics(prev => [{
        id: data.exam._id,
        name: `${newName} Rubric`,
        courseCode: 'CUSTOM',
        totalMarks: criteria.reduce(
          (s, c) => s + (+c.maxMarks || 0), 0
        ),
        rubricContent: criteria.map(c => c.question).join(', ')
      }, ...prev]);

      setCreating(false);
      setNewName("");
      setCriteria([{ question: "", maxMarks: "", keywords: "" }]);
      alert('Rubric saved! ✅');
    } catch (error) {
      alert('Failed to save: ' + error.message);
    }
  };
  // Rubric View Modal
const RubricModal = () => (
  <div 
    onClick={() => setShowModal(false)}
    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
  >
    <div 
      onClick={e => e.stopPropagation()}
      className="fade-up"
      style={{ background: "white", borderRadius: 20, padding: 32, width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 800, color: theme.text }}>
            {selectedRubric?.name}
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>
            {selectedRubric?.courseCode} · {selectedRubric?.totalMarks} total marks
          </p>
        </div>
        <button 
          onClick={() => setShowModal(false)}
          style={{ background: theme.bg, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: theme.textMuted }}
        >
          ✕
        </button>
      </div>

      {/* Rubric Content */}
      <div style={{ background: theme.bg, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Grading Criteria
        </p>
        <div style={{ fontSize: 14, lineHeight: 2, color: theme.text, whiteSpace: "pre-wrap" }}>
          {selectedRubric?.rubricContent}
        </div>
      </div>

      {/* Questions Breakdown */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Questions Breakdown
        </p>
        {selectedRubric?.rubricContent
          ?.split('.')
          .filter(q => q.trim().length > 5)
          .map((q, i) => (
            <div 
              key={i}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: i % 2 === 0 ? theme.green4 : "white", borderRadius: 10, marginBottom: 6 }}
            >
              <div style={{ width: 24, height: 24, background: theme.green1, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.5 }}>
                {q.trim()}
              </p>
            </div>
          ))
        }
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button 
          onClick={() => setShowModal(false)}
          style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${theme.border}`, background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Close
        </button>
        <button 
          className="btn-hover"
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Use This Rubric
        </button>
      </div>
    </div>
  </div>
);

  return (
    <div className="fade-in">
      {/* Show modal when rubric selected */}
      {showModal && selectedRubric && <RubricModal />}
      <TopBar 
        title="Rubrics" 
        subtitle="Manage grading criteria for each exam" 
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button 
          className="btn-hover" 
          onClick={() => setCreating(!creating)} 
          style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          + Create Rubric
        </button>
      </div>

      {/* Create Rubric Form */}
      {creating && (
        <div className="fade-up" style={{ background: "white", borderRadius: 18, border: `1px solid ${theme.border}`, padding: 28, marginBottom: 24, boxShadow: theme.shadow }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
            New Rubric
          </h3>
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Rubric name e.g. Data Structures Mid"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", marginBottom: 20, background: theme.bg }} 
          />
          {criteria.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: 10, marginBottom: 10 }}>
              <input 
                placeholder={`Q${i+1}: Question`} 
                value={c.question} 
                onChange={e => { 
                  const n = [...criteria]; 
                  n[i].question = e.target.value; 
                  setCriteria(n); 
                }} 
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
              />
              <input 
                placeholder="Marks" 
                value={c.maxMarks} 
                onChange={e => { 
                  const n = [...criteria]; 
                  n[i].maxMarks = e.target.value; 
                  setCriteria(n); 
                }} 
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
              />
              <input 
                placeholder="Keywords" 
                value={c.keywords} 
                onChange={e => { 
                  const n = [...criteria]; 
                  n[i].keywords = e.target.value; 
                  setCriteria(n); 
                }} 
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 13, outline: "none", background: theme.bg }} 
              />
              <button 
                onClick={() => setCriteria(prev => prev.filter((_, j) => j !== i))} 
                style={{ background: "#fef2f2", border: "none", borderRadius: 10, padding: "0 12px", cursor: "pointer", color: "#ef4444" }}
              >✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button 
              onClick={addCriteria} 
              style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${theme.green1}`, background: "white", color: theme.green1, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              + Add Question
            </button>
            <button 
              className="btn-hover" 
              onClick={saveRubric} 
              style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Save Rubric
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
          Loading rubrics...
        </div>
      )}

      {/* Empty state */}
      {!loading && rubrics.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 18, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700 }}>
            No Rubrics Yet
          </h3>
          <p style={{ color: theme.textMuted, marginTop: 8 }}>
            Create an exam with a rubric first!
          </p>
        </div>
      )}

      {/* Rubrics Grid */}
      {!loading && rubrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {rubrics.map((r, i) => (
            <div 
              key={r.id || i} 
              className="card-hover fade-up" 
              style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: 22, boxShadow: theme.shadow, animationDelay: `${i * 0.07}s` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ background: theme.green4, borderRadius: 10, padding: 10 }}>
                  <Icon name="rubric" size={20} color={theme.green2} />
                </div>
                <span className="tag tag-green">
                  {r.courseCode}
                </span>
              </div>
              <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                {r.name}
              </h3>
              <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 8 }}>
                Total: {r.totalMarks} marks
              </p>
              <p style={{ color: theme.textLight, fontSize: 12, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {r.rubricContent}
              </p>
              <button 
  onClick={() => {
    setSelectedRubric(r);
    setShowModal(true);
  }}
  style={{ marginTop: 16, width: "100%", padding: "9px", borderRadius: 10, border: `1.5px solid ${theme.border}`, background: "white", color: theme.text, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
  onMouseEnter={e => {
    e.currentTarget.style.background = theme.green4;
    e.currentTarget.style.borderColor = theme.green1;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = "white";
    e.currentTarget.style.borderColor = theme.border;
  }}
>
  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
    <Icon name="review" size={14} color={theme.green2} /> 
    View Rubric
  </span>
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── REVIEW PAGE (TA) ──────────────────────────────────────
const ReviewPage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [decision, setDecision] = useState(null);
  const [editScore, setEditScore] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewed, setReviewed] = useState(0);

  // Fetch REAL queue from database
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(
          '/api/grade/review/queue'
        );
        const data = await res.json();
        console.log('Queue data:', data);

        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(s => ({
            id: s._id,           // ← REAL database ID!
            student: s.studentName,
            rollNo: s.studentRoll,
            exam: s.exam?.name || 'Unknown Exam',
            question: 'Full Answer Review',
            answer: s.extractedText || 'No text extracted',
            aiScore: s.aiGrade || 0,
            maxScore: s.exam?.totalMarks || 100,
            justification: s.aiJustification || 'No justification'
          }));
          setQueue(formatted);
          setScore(formatted[0]?.aiScore || 0);
        }
      } catch (error) {
        console.log('Queue fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const current = queue[idx % Math.max(queue.length, 1)];

  const handleDecision = async (type, newScore) => {
    if (!current || !current.id) {
      console.log('No current submission!');
      return;
    }

    setDecision(type);
    console.log('Approving submission:', current.id);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `/api/grade/review/${current.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: type === 'approve' ? 'approve' : 'override',
            finalGrade: newScore || current.aiScore
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);
      const data = await res.json();
      console.log('✅ Review saved:', data);

    } catch (error) {
      console.log('Review error:', error.message);
    }

    // Remove from queue and move to next
    setTimeout(() => {
      setQueue(prev => prev.filter(q => q.id !== current.id));
      setReviewed(p => p + 1);
      setDecision(null);
      setEditScore(false);
      setIdx(0);
    }, 800);
  };

  // All reviewed!
  if (!loading && queue.length === 0) {
    return (
      <div className="fade-in">
        <TopBar title="Review Queue" subtitle="All caught up!" />
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 700, marginTop: 16, color: theme.green2 }}>
            All Reviews Complete!
          </h2>
          <p style={{ color: theme.textMuted, marginTop: 8 }}>
            {reviewed} submissions reviewed
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fade-in">
        <TopBar title="Review Queue" subtitle="Loading..." />
        <div style={{ textAlign: "center", padding: 60, color: theme.textMuted }}>
          Loading submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <TopBar 
        title="Review Queue" 
        subtitle="Review AI-graded answers and approve or override" 
      />

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "center" }}>
        <div style={{ flex: 1, height: 8, background: theme.green4, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(reviewed / (queue.length + reviewed)) * 100}%`, background: `linear-gradient(90deg, ${theme.green1}, ${theme.green2})`, borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
        <span style={{ fontSize: 13, color: theme.textMuted, whiteSpace: "nowrap" }}>
          {reviewed} / {queue.length + reviewed} reviewed
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Student answer */}
        <div className="fade-up" style={{ background: "white", borderRadius: 18, border: `1px solid ${theme.border}`, padding: 24, boxShadow: theme.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>
                {current?.student}
              </h3>
              <p style={{ color: theme.textMuted, fontSize: 13 }}>
                {current?.rollNo} · {current?.exam}
              </p>
            </div>
            <span className="tag tag-blue">Pending</span>
          </div>

          <div style={{ background: theme.bg, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>
              QUESTION
            </p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>
              {current?.question}
            </p>
          </div>

          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "16px 14px", minHeight: 130 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
              ✍ STUDENT ANSWER (OCR extracted)
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1c1917", fontStyle: "italic" }}>
              {current?.answer}
            </p>
          </div>
        </div>

        {/* AI grading result */}
        <div className="fade-up" style={{ background: "white", borderRadius: 18, border: `1px solid ${theme.border}`, padding: 24, boxShadow: theme.shadow, animationDelay: "0.08s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon name="brain" size={18} color={theme.green1} />
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>
              AI Grading Result
            </h3>
          </div>

          {/* Score display */}
          <div style={{ background: `linear-gradient(135deg, ${theme.green4}, #f0fdf4)`, borderRadius: 14, padding: 20, marginBottom: 16, textAlign: "center", border: `1px solid ${theme.border}` }}>
            {editScore ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <button 
                  onClick={() => setScore(s => Math.max(0, s - 1))} 
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: "white", cursor: "pointer", fontWeight: 700, fontSize: 16 }}
                >−</button>
                <span style={{ fontFamily: "Syne", fontSize: 40, fontWeight: 800, color: theme.green2 }}>
                  {score}
                </span>
                <button 
                  onClick={() => setScore(s => Math.min(current?.maxScore || 100, s + 1))} 
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: "white", cursor: "pointer", fontWeight: 700, fontSize: 16 }}
                >+</button>
              </div>
            ) : (
              <div style={{ fontFamily: "Syne", fontSize: 48, fontWeight: 800, color: theme.green2 }}>
                {current?.aiScore}
                <span style={{ fontSize: 20, color: theme.textMuted }}>
                  /{current?.maxScore}
                </span>
              </div>
            )}
            <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
              AI Suggested Score
            </p>
          </div>

          {/* Justification */}
          <div style={{ background: theme.bg, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>
              AI JUSTIFICATION
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              {current?.justification}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button 
              className="btn-hover" 
              onClick={() => handleDecision("approve")} 
              disabled={!!decision}
              style={{ padding: "11px 8px", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {decision === "approve" ? <Spinner /> : <><Icon name="check" size={14} color="white" /> Approve</>}
            </button>

            <button 
              className="btn-hover" 
              onClick={() => setEditScore(!editScore)}
              style={{ padding: "11px 8px", borderRadius: 11, border: `1.5px solid ${theme.border}`, background: editScore ? theme.green4 : "white", color: theme.text, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Icon name="edit" size={14} color={theme.green2} /> Edit
            </button>

            <button 
              className="btn-hover" 
              onClick={() => editScore ? handleDecision("override", score) : handleDecision("reject")}
              style={{ padding: "11px 8px", borderRadius: 11, border: `1.5px solid #fecaca`, background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {decision === "reject" || decision === "override" ? <Spinner /> : <><Icon name="x" size={14} color="#dc2626" /> {editScore ? "Submit" : "Override"}</>}
            </button>
          </div>

          <p style={{ fontSize: 11, color: theme.textLight, textAlign: "center", marginTop: 10 }}>
            Keyboard: A=Approve · E=Edit · R=Reject
          </p>
        </div>
      </div>
    </div>
  );
};

// ── PLAGIARISM PAGE ───────────────────────────────────────
const PlagiarismPage = () => {
  const [flags, setFlags] = useState([]);
  const [examList, setExamList] = useState([]);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [totalPairs, setTotalPairs] = useState(0);

  // Load exams on mount
  useEffect(() => {
    fetch('/api/upload/exams')
      .then(r => r.json())
      .then(data => {
        const examArray = Array.isArray(data) ? data : [];
        setExamList(examArray);
      })
      .catch(err => console.log('Exams error:', err));
  }, []);

  const checkPlagiarism = async (examId) => {
    if (!examId) return;
    setChecking(true);
    setChecked(false);
    setFlags([]);

    try {
      const res = await fetch(
        `/api/grade/plagiarism/${examId}`,
        { method: 'POST' }
      );
      const data = await res.json();
      console.log('Plagiarism result:', data);

      if (data.flags) {
        setFlags(data.flags.map(f => ({
          s1: `${f.student1} (${f.roll1})`,
          s2: `${f.student2} (${f.roll2})`,
          similarity: f.similarity_score,
          question: 'Full Submission',
          status: f.severity
        })));
        setTotalPairs(data.total_pairs_checked || 0);
      }
      setChecked(true);
    } catch (error) {
      console.log('Plagiarism error:', error);
      setChecked(true);
    }
    setChecking(false);
  };

  return (
    <div className="fade-in">
      <TopBar 
        title="Plagiarism Detection" 
        subtitle="AI-powered similarity detection across submissions" 
      />

      {/* Exam Selector */}
      <div style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: "20px 24px", marginBottom: 24, boxShadow: theme.shadow }}>
        <h3 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          Select Exam to Check
        </h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select
            onChange={e => checkPlagiarism(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", background: theme.bg, cursor: "pointer", fontFamily: "DM Sans", minWidth: 250 }}
          >
            <option value="">Select exam...</option>
            {examList.map(exam => (
              <option key={exam._id} value={exam._id}>
                {exam.name} — {exam.courseCode}
              </option>
            ))}
          </select>

          {checking && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.green1, fontWeight: 600 }}>
              <Spinner />
              <span>Analyzing submissions...</span>
            </div>
          )}

          {checked && !checking && (
            <span style={{ color: theme.green2, fontWeight: 600, fontSize: 14 }}>
              ✅ Checked {totalPairs} pairs!
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard 
          label="Flagged Pairs" 
          value={flags.length} 
          icon="flag" 
          color="#ef4444" 
          delay={0} 
        />
        <StatCard 
          label="Critical" 
          value={flags.filter(f => f.status === 'critical').length} 
          icon="alert" 
          color="#dc2626" 
          delay={0.05} 
        />
        <StatCard 
          label="High Similarity" 
          value={flags.filter(f => f.status === 'high').length} 
          icon="review" 
          color="#f59e0b" 
          delay={0.1} 
        />
        <StatCard 
          label="Pairs Checked" 
          value={totalPairs} 
          icon="stats" 
          color={theme.green1} 
          delay={0.15} 
        />
      </div>

      {/* Results */}
      {!checked && !checking && (
        <div style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: "48px 24px", textAlign: "center", boxShadow: theme.shadow }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Select an exam to check
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 14 }}>
            AI will compare all submissions using cosine similarity
          </p>
        </div>
      )}

      {checked && flags.length === 0 && (
        <div style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: "48px 24px", textAlign: "center", boxShadow: theme.shadow }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.green2 }}>
            No plagiarism detected!
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 14 }}>
            All submissions appear to be original work.
          </p>
        </div>
      )}

      {flags.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {flags.map((f, i) => (
            <div 
              key={i} 
              className="card-hover fade-up" 
              style={{ background: "white", borderRadius: 16, border: `1px solid ${f.similarity > 90 ? "#fecaca" : theme.border}`, padding: "20px 24px", boxShadow: theme.shadow, animationDelay: `${i * 0.07}s` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className={`tag ${f.similarity > 90 ? "tag-red" : "tag-yellow"}`}>
                      {f.similarity}% similar
                    </span>
                    <span className={`tag ${f.status === 'critical' ? 'tag-red' : 'tag-yellow'}`}>
                      {f.status?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 13, color: theme.textMuted }}>
                      {f.question}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {f.s1} 
                    <span style={{ color: theme.textMuted, fontWeight: 400, margin: "0 8px" }}>
                      vs
                    </span> 
                    {f.s2}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${theme.border}`, background: "white", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn-hover"
                    style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear Flag
                  </button>
                </div>
              </div>

              {/* Similarity bar */}
              <div style={{ marginTop: 14, height: 6, background: theme.green4, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.similarity}%`, background: f.similarity > 90 ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#f59e0b,#d97706)", borderRadius: 3, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── RESULTS PAGE ──────────────────────────────────────────
const ResultsPage = () => {
  const [students, setStudents] = useState([]);
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [stats, setStats] = useState({
    average: 0, highest: 0, below60: 0
  });
  const [loading, setLoading] = useState(false);

  const getLetterGrade = (score, max) => {
    const percent = (score / max) * 100;
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'A-';
    if (percent >= 70) return 'B+';
    if (percent >= 60) return 'B';
    if (percent >= 50) return 'C';
    return 'F';
  };

  const gradeColor = g => {
    if (g.startsWith('A')) return theme.green2;
    if (g.startsWith('B')) return '#2563eb';
    return '#f59e0b';
  };

  // Fetch all exams on load
  useEffect(() => {
  fetch('/api/upload/exams')
    .then(r => r.json())
    .then(data => {
      console.log('Exams loaded:', data); // Debug log
      // Handle both array and object responses
      const examArray = Array.isArray(data) ? data : [];
      setExamList(examArray);
      if (examArray.length > 0) {
        setSelectedExam(examArray[0]._id);
      }
    })
    .catch(err => console.log('Exams error:', err));
}, []);

  // Fetch results when exam selected
  useEffect(() => {
    if (!selectedExam) return;
    setLoading(true);
    fetch(`/api/grade/results/${selectedExam}`)
      .then(r => r.json())
      .then(data => {
        if (data.submissions) {
          const formatted = data.submissions.map(s => ({
            name: s.studentName,
            roll: s.studentRoll,
            score: s.finalGrade || s.aiGrade || 0,
            max: 100,
            grade: getLetterGrade(
              s.finalGrade || s.aiGrade || 0, 
              100
            ),
            decision: s.taDecision
          }));
          setStudents(formatted);

          // Calculate stats
          const scores = formatted.map(s => s.score);
          if (scores.length > 0) {
            setStats({
              average: Math.round(
                scores.reduce((a,b) => a+b, 0) / scores.length
              ),
              highest: Math.max(...scores),
              below60: scores.filter(s => s < 60).length
            });
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.log('Results error:', err);
        setLoading(false);
      });
  }, [selectedExam]);

  return (
    <div className="fade-in">
      <TopBar 
        title="Results" 
        subtitle="Final graded results and export" 
      />

      {/* Exam Selector */}
      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedExam}
          onChange={e => setSelectedExam(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", background: "white", cursor: "pointer", fontFamily: "DM Sans", minWidth: 250 }}
        >
          {examList.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.name} — {exam.courseCode}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard 
          label="Class Average" 
          value={stats.average} 
          sub="Out of 100" 
          icon="stats" 
          delay={0} 
        />
        <StatCard 
          label="Highest Score" 
          value={stats.highest} 
          sub="Top performer" 
          icon="check" 
          color={theme.green2} 
          delay={0.05} 
        />
        <StatCard 
          label="Below 60" 
          value={stats.below60} 
          sub="Need attention" 
          icon="alert" 
          color="#ef4444" 
          delay={0.1} 
        />
        <StatCard 
          label="Total Students" 
          value={students.length} 
          sub="Graded" 
          icon="users" 
          color="#2563eb" 
          delay={0.15} 
        />
      </div>

      {/* Results Table */}
      <div className="fade-up" style={{ background: "white", borderRadius: 18, border: `1px solid ${theme.border}`, padding: 24, boxShadow: theme.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 700 }}>
            Student Results
          </h2>
          <button 
            className="btn-hover"
            onClick={() => {
              // Export as CSV
              const csv = [
                'Name,Roll,Score,Grade,Status',
                ...students.map(s => 
                  `${s.name},${s.roll},${s.score},${s.grade},${s.decision}`
                )
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'results.csv';
              a.click();
            }}
            style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${theme.green1}, ${theme.green2})`, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
            Loading results...
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: theme.textMuted, fontSize: 14 }}>
              No completed results yet for this exam.
            </p>
            <p style={{ color: theme.textLight, fontSize: 12, marginTop: 6 }}>
              Complete the review queue first!
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.green4}` }}>
                {["Student", "Roll No", "Score", "Grade", "Status", "Progress"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: theme.textMuted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr 
                  key={i} 
                  style={{ borderBottom: `1px solid ${theme.green4}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 14px", fontWeight: 600 }}>
                    {s.name}
                  </td>
                  <td style={{ padding: "14px 14px", color: theme.textMuted, fontSize: 13 }}>
                    {s.roll}
                  </td>
                  <td style={{ padding: "14px 14px", fontWeight: 700, color: theme.green2 }}>
                    {s.score}/{s.max}
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span style={{ fontWeight: 700, color: gradeColor(s.grade) }}>
                      {s.grade}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span className={`tag ${s.decision === 'approved' ? 'tag-green' : 'tag-yellow'}`}>
                      {s.decision === 'approved' ? '✅ Approved' : '✏️ Overridden'}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px", width: 160 }}>
                    <div style={{ height: 7, background: theme.green4, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.score}%`, background: `linear-gradient(90deg, ${theme.green1}, ${theme.green2})`, borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ── STUDENTS PAGE ─────────────────────────────────────────
const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(data => {
        console.log('Students loaded:', data);
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.log('Students error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fade-in">
      <TopBar 
        title="Students" 
        subtitle="All enrolled students and performance" 
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard 
          label="Total Students" 
          value={students.length} 
          icon="users" 
          delay={0} 
        />
        <StatCard 
          label="Avg Score" 
          value={
            students.length > 0 
              ? Math.round(
                  students.reduce((s, st) => s + st.avg, 0) / 
                  students.length
                )
              : 0
          } 
          icon="stats" 
          color={theme.green2}
          delay={0.05} 
        />
        <StatCard 
          label="Total Submissions" 
          value={students.reduce((s, st) => s + st.exams, 0)} 
          icon="grade" 
          color="#2563eb"
          delay={0.1} 
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
          Loading students...
        </div>
      )}

      {/* Empty */}
      {!loading && students.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 18, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h3 style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700 }}>
            No Students Yet
          </h3>
          <p style={{ color: theme.textMuted, marginTop: 8 }}>
            Upload exam PDFs to add students!
          </p>
        </div>
      )}

      {/* Students Grid */}
      {!loading && students.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {students.map((s, i) => (
            <div 
              key={i} 
              className="card-hover fade-up" 
              style={{ background: "white", borderRadius: 16, border: `1px solid ${theme.border}`, padding: 22, boxShadow: theme.shadow, animationDelay: `${i * 0.06}s` }}
            >
              {/* Avatar */}
              <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${theme.green3}, ${theme.green1})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", marginBottom: 12 }}>
                {s.name ? s.name[0].toUpperCase() : '?'}
              </div>

              <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {s.name}
              </h3>
              <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 4 }}>
                {s.roll}
              </p>
              <p style={{ color: theme.textLight, fontSize: 12, marginBottom: 14 }}>
                {s.email}
              </p>

              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "space-between", background: theme.bg, borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: theme.green2, fontSize: 18 }}>
                    {s.exams}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>
                    Exams
                  </div>
                </div>
                <div style={{ width: 1, background: theme.border }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: theme.green2, fontSize: 18 }}>
                    {s.avg}%
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>
                    Average
                  </div>
                </div>
                <div style={{ width: 1, background: theme.border }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: theme.green2, fontSize: 18 }}>
                    {s.completedExams}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>
                    Graded
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("instructor");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  const handleLogin = (r, u) => { setRole(r); setUser(u); setLoggedIn(true); setPage("dashboard"); };
  const handleLogout = () => { setLoggedIn(false); setPage("dashboard"); };

  if (!loggedIn) return <><GlobalStyle /><LoginPage onLogin={handleLogin} /></>;

  const pages = {
    dashboard: <DashboardPage role={role} />,
    upload: <UploadPage />,
    rubrics: <RubricsPage />,
    review: <ReviewPage />,
    results: <ResultsPage />,
    plagiarism: <PlagiarismPage />,
    students: <StudentsPage />,
  };

  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar page={page} setPage={setPage} role={role} user={user} onLogout={handleLogout} />
        <main style={{ marginLeft: 240, flex: 1, padding: "32px 36px", minHeight: "100vh", background: theme.bg }}>
          {pages[page] || <DashboardPage role={role} />}
        </main>
      </div>
    </>
  );
}