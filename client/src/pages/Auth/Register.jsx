
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Terminal, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function BackgroundOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: "520px", height: "520px",
        background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
        animation: "f1 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-8%",
        width: "440px", height: "440px",
        background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)",
        animation: "f2 24s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(35px,-25px)} }
        @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-28px,22px)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #3d5166 !important; }

        .reg-page {
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
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .submit-btn:hover::after { opacity: 1; }
        .submit-btn:hover { box-shadow: 0 0 36px rgba(99,102,241,0.4); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .submit-btn span { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .login-link {
          color: #06b6d4;
          cursor: pointer;
          font-weight: 600;
          position: relative;
        }
        .login-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1px;
          background: #06b6d4;
          transform: scaleX(0);
          transition: transform 0.2s;
        }
        .login-link:hover::after { transform: scaleX(1); }

        .loading-dot {
          width: 5px; height: 5px;
          border-radius: 50%; background: #fff;
          animation: ldot 1.1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.18s; }
        .loading-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes ldot { 0%,100%{opacity:0.3;transform:scale(0.75)} 50%{opacity:1;transform:scale(1)} }

        .strength-bar-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
          margin-top: 8px;
        }
        .strength-bar-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.3s ease, background 0.3s ease;
        }
      `}</style>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "", color: "transparent", width: "0%" },
    { label: "Weak", color: "#ef4444", width: "25%" },
    { label: "Fair", color: "#f59e0b", width: "50%" },
    { label: "Good", color: "#06b6d4", width: "75%" },
    { label: "Strong", color: "#10b981", width: "100%" },
  ];
  return levels[score];
}

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username || !email || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      login(data.token);
      localStorage.setItem("username", data.username);
      toast.success("Welcome to CodeSync!");
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

  const strength = getPasswordStrength(form.password);

  const fields = [
    { name: "username", label: "Username", type: "text", placeholder: "your_handle", icon: User },
    { name: "email",    label: "Email Address", type: "email", placeholder: "you@example.com", icon: Mail },
    { name: "password", label: "Password", type: "password", placeholder: "min. 8 characters", icon: Lock },
  ];

  return (
    <>
      <div className="reg-page">
        <BackgroundOrbs />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}
        >
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
                CREATE YOUR ACCOUNT
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {fields.map(({ name, label, type, placeholder, icon: Icon }, idx) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.07, duration: 0.35 }}
                >
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                    {label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Icon size={15} style={{
                      position: "absolute", left: "16px", top: "50%",
                      transform: "translateY(-50%)",
                      color: focused === name ? "#06b6d4" : "#334155",
                      transition: "color 0.2s",
                      pointerEvents: "none",
                    }} />
                    <input
                      type={name === "password" ? (showPassword ? "text" : "password") : type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      placeholder={placeholder}
                      style={{
                        ...inputStyle(name),
                        ...(name === "password" ? { paddingRight: "48px" } : {}),
                      }}
                      autoComplete={name === "password" ? "new-password" : name}
                    />
                    {name === "password" && (
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
                    )}
                  </div>

                  {/* Password strength bar */}
                  {name === "password" && form.password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <div className="strength-bar-track">
                        <div className="strength-bar-fill" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: strength.color, marginTop: "5px", textAlign: "right", letterSpacing: "0.05em" }}>
                        {strength.label}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "4px 0" }} />

              <button type="submit" className="submit-btn" disabled={loading}>
                <span>
                  {loading ? (
                    <>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                      </div>
                      Creating account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={15} /></>
                  )}
                </span>
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "24px", fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#475569" }}>
              Already have an account?{" "}
              <span className="login-link" onClick={() => navigate("/login")}>Sign in</span>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#1e3042" }}>
            crafted by <span style={{ color: "#06b6d4" }}>Namra</span>
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default Register;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { useAuth } from "../../context/AuthContext";

// // ✅ Backend URL from environment
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// function Register() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ username: "", email: "", password: "" });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { username, email, password } = form;

//     if (!username || !email || !password) {
//       toast.error("Fill all fields 📝");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Registration failed");

//       login(data.token);
//       localStorage.setItem("username", data.username);
//       toast.success("🎉 Registered successfully");
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
//         <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

//         {["username", "email", "password"].map((field) => (
//           <input
//             key={field}
//             type={field === "password" ? "password" : "text"}
//             name={field}
//             value={form[field]}
//             onChange={handleChange}
//             placeholder={field[0].toUpperCase() + field.slice(1)}
//             className="px-3 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         ))}

//         <button
//           type="submit"
//           className="bg-blue-600 hover:bg-blue-700 transition py-2 rounded font-semibold"
//           disabled={loading}
//         >
//           {loading ? "Registering..." : "Register"}
//         </button>

//         <p className="text-sm text-center mt-2">
//           Already have an account?{" "}
//           <span
//             className="text-blue-400 cursor-pointer underline"
//             onClick={() => navigate("/login")}
//           >
//             Login here
//           </span>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default Register;
