import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Terminal, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function BackgroundOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
        animation: "f1 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "-8%",
        width: "420px", height: "420px",
        background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
        animation: "f2 22s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,25px)} }
        @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-20px)} }
      `}</style>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;
    if (!email || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token);
      localStorage.setItem("username", data.username);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: "100%",
    padding: "14px 18px 14px 44px",
    background: focused === name ? "rgba(6,182,212,0.05)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === name ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.09)"}`,
    borderRadius: "12px",
    color: "#e2e8f0",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: focused === name ? "0 0 0 3px rgba(6,182,212,0.08)" : "none",
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #3d5166 !important; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020b14;
          font-family: 'Syne', sans-serif;
          color: #e2e8f0;
          padding: 24px;
          position: relative;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #0891b2, #6366f1);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover { box-shadow: 0 0 36px rgba(99,102,241,0.4); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .submit-btn span { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .register-link {
          color: #06b6d4;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        .register-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1px;
          background: #06b6d4;
          transform: scaleX(0);
          transition: transform 0.2s;
        }
        .register-link:hover::after { transform: scaleX(1); }

        .loading-dot {
          width: 5px; height: 5px;
          border-radius: 50%; background: #fff;
          animation: ldot 1.1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.18s; }
        .loading-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes ldot { 0%,100%{opacity:0.3;transform:scale(0.75)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      <div className="login-page">
        <BackgroundOrbs />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}
        >
          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "40px 36px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>

            {/* Logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "36px" }}>
              <div style={{
                width: "52px", height: "52px",
                background: "linear-gradient(135deg, #0891b2, #6366f1)",
                borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
                boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
              }}>
                <Terminal size={24} color="#fff" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
                <span style={{ fontWeight: 800, fontSize: "22px", letterSpacing: "-0.02em" }}>Code</span>
                <span style={{ fontWeight: 800, fontSize: "22px", letterSpacing: "-0.02em", color: "#06b6d4" }}>Sync</span>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#334155", marginTop: "4px", letterSpacing: "0.08em" }}>
                SIGN IN TO YOUR WORKSPACE
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Email field */}
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#06b6d4" : "#334155", transition: "color 0.2s", pointerEvents: "none" }} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    style={inputStyle("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "password" ? "#06b6d4" : "#334155", transition: "color 0.2s", pointerEvents: "none" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    style={{ ...inputStyle("password"), paddingRight: "48px" }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#334155", padding: "4px", display: "flex", alignItems: "center",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#64748b"}
                    onMouseLeave={e => e.currentTarget.style.color = "#334155"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "4px 0" }} />

              {/* Submit */}
              <button type="submit" className="submit-btn" disabled={loading}>
                <span>
                  {loading ? (
                    <>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <div className="loading-dot" />
                        <div className="loading-dot" />
                        <div className="loading-dot" />
                      </div>
                      Signing in...
                    </>
                  ) : (
                    <>Sign In <ArrowRight size={15} /></>
                  )}
                </span>
              </button>
            </form>

            {/* Register link */}
            <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#475569" }}>
              No account?{" "}
              <span className="register-link" onClick={() => navigate("/register")}>
                Create one
              </span>
            </p>
          </div>

          {/* Bottom label */}
          <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#1e3042" }}>
            crafted by <span style={{ color: "#06b6d4" }}>Namra</span>
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default Login;


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { useAuth } from "../../context/AuthContext";

// // ✅ Backend URL from environment
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { email, password } = form;

//     if (!email || !password) {
//       toast.error("Fill all fields 🚨");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Login failed");

//       login(data.token);
//       localStorage.setItem("username", data.username);
//       toast.success("✅ Logged in");
//       navigate("/");
//     } catch (err) {
//       toast.error(`❌ ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-gray-800 p-8 rounded shadow-md w-[350px] flex flex-col gap-4"
//       >
//         <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

//         <input
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="Email"
//           className="px-3 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <input
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={handleChange}
//           placeholder="Password"
//           className="px-3 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <button
//           type="submit"
//           className="bg-green-600 hover:bg-green-700 transition py-2 rounded font-semibold"
//           disabled={loading}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <p className="text-sm text-center mt-2">
//           Don’t have an account?{" "}
//           <span
//             className="text-blue-400 cursor-pointer underline"
//             onClick={() => navigate("/register")}
//           >
//             Register here
//           </span>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default Login;
