import React, { useState } from "react";

const USER_ROLES = ["Student", "Professional", "Job Seeker", "Other"];

export default function AuthPage({ onLogin, onRegister, loading, error }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("Student");

  const handleSubmit = () => {
    if (isLogin) onLogin(email, password);
    else onRegister(name, email, password, role);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">AI</div>
          <h1>Smart Interview Simulator</h1>
          <p>{isLogin ? "Welcome back — sign in to continue" : "Create your account to get started"}</p>
        </div>

        {!isLogin && (
          <div className="fg">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}

        <div className="fg">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="fg">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {!isLogin && (
          <div className="fg">
            <label>I am a</label>
            <div className="role-grid">
              {USER_ROLES.map(r => (
                <button
                  key={r}
                  className={`role-pill ${role === r ? "active" : ""}`}
                  onClick={() => setRole(r)}
                >{r}</button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-banner" style={{ marginBottom: 12 }}>{error}</div>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !email || !password || (!isLogin && !name)}
        >
          {loading ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
        </button>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}