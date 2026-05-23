
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Clock, Copy, Check, X, Zap, Users, ArrowRight, Terminal } from "lucide-react";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Floating orb background component
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "float1 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "float2 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "60%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(30px)",
          animation: "float3 15s ease-in-out infinite",
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.97)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,40px) scale(1.03)} 66%{transform:translate(20px,-20px) scale(1.07)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,30px)} }
      `}</style>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "100px",
      backdropFilter: "blur(10px)",
    }}>
      <Icon size={14} style={{ color: "#06b6d4" }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#e2e8f0", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Home() {
  const [roomId, setRoomId] = useState("");
  const [passcode, setPasscode] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, token } = useAuth();
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [newRoomData, setNewRoomData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchVisitedRooms = async () => {
      if (!isAuthenticated) { setVisitedRooms([]); setLoadingRooms(false); return; }
      try {
        const res = await fetch(`${BACKEND_URL}/api/my-rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setVisitedRooms(data);
        else console.error("Error fetching rooms:", data.error);
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchVisitedRooms();
  }, [isAuthenticated, token]);

  const handleCreateRoom = async () => {
    if (!isAuthenticated) { toast.error("Please login to create a room!"); navigate("/login"); return; }
    setIsCreating(true);
    const newRoomId = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: "-", length: 3 });
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId: newRoomId }),
      });
      const data = await res.json();
      if (res.ok) { setNewRoomData({ roomId: newRoomId, passcode: data.passcode }); toast.success("Room Created!"); }
      else toast.error(data.error || "Failed to create room");
    } catch (err) {
      toast.error("Failed to create room. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) navigate(`/room/${roomId.trim()}`, { state: { passcode: passcode.trim() } });
    else toast.error("Please enter a Room ID");
  };

  const handleDeleteRoom = async (roomIdToDelete) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/my-rooms/${roomIdToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setVisitedRooms((prev) => prev.filter((room) => room.roomId !== roomIdToDelete)); toast.success("Removed from history"); }
      else { const data = await res.json(); toast.error(data.error || "Failed to remove room"); }
    } catch (err) {
      toast.error("Couldn't remove room. Try again.");
    }
  };

  const copyPasscode = () => {
    if (newRoomData?.passcode) {
      navigator.clipboard.writeText(newRoomData.passcode);
      setIsCopied(true);
      toast.success("Passcode copied!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cs-page {
          min-height: 100vh;
          background: #020b14;
          color: #e2e8f0;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .cs-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          color: #e2e8f0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .cs-input::placeholder { color: #475569; }
        .cs-input:focus {
          border-color: rgba(6,182,212,0.5);
          background: rgba(6,182,212,0.05);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.08), inset 0 0 20px rgba(6,182,212,0.02);
        }

        .btn-join {
          padding: 14px 28px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 12px;
          color: #10b981;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .btn-join:hover {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.6);
          box-shadow: 0 0 20px rgba(16,185,129,0.15);
          transform: translateY(-1px);
        }

        .btn-create {
          padding: 14px 28px;
          background: linear-gradient(135deg, #0891b2, #6366f1);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }
        .btn-create::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-create:hover::before { opacity: 1; }
        .btn-create:hover { box-shadow: 0 0 30px rgba(99,102,241,0.35); transform: translateY(-1px); }
        .btn-create:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-create span { position: relative; z-index: 1; }

        .btn-auth {
          padding: 9px 20px;
          border-radius: 9px;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          letter-spacing: 0.02em;
        }
        .btn-login {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: #cbd5e1;
        }
        .btn-login:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.2); color: #fff; }
        .btn-register {
          background: linear-gradient(135deg, #0891b2, #6366f1);
          color: #fff;
        }
        .btn-register:hover { box-shadow: 0 0 20px rgba(99,102,241,0.3); transform: translateY(-1px); }
        .btn-logout {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }
        .btn-logout:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); }

        .room-card {
          position: relative;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(12px);
          overflow: hidden;
        }
        .room-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(6,182,212,0.04) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .room-card:hover::before { opacity: 1; }
        .room-card:hover {
          border-color: rgba(6,182,212,0.25);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(6,182,212,0.1);
        }

        .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239,68,68,0.0);
          border: 1px solid transparent;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .delete-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px 5px 10px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 100px;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2,11,20,0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .modal-box {
          background: #0d1f2d;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 40px;
          max-width: 440px;
          width: 100%;
          position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08);
        }

        .passcode-display {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
          position: relative;
          overflow: hidden;
        }
        .passcode-display::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent);
        }

        .btn-enter {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #0891b2, #6366f1);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
        }
        .btn-enter:hover { box-shadow: 0 0 40px rgba(99,102,241,0.4); transform: translateY(-2px); }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(48px, 8vw, 88px);
          line-height: 0.95;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f8fafc 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .accent-word {
          background: linear-gradient(135deg, #06b6d4, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 48px 0;
        }

        .loading-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #06b6d4;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }

        @media (max-width: 640px) {
          .input-row { flex-direction: column; }
          .modal-box { padding: 28px 20px; }
        }
      `}</style>

      <div className="cs-page">
        <BackgroundOrbs />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

          {/* ── NAV ── */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "72px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #0891b2, #6366f1)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Terminal size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.01em" }}>
                Code<span style={{ color: "#06b6d4" }}>Sync</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {isAuthenticated && user?.username && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#64748b", marginRight: "4px" }}>
                  @{user.username}
                </span>
              )}
              {!isAuthenticated ? (
                <>
                  <button className="btn-auth btn-login" onClick={() => navigate("/login")}>Login</button>
                  <button className="btn-auth btn-register" onClick={() => navigate("/register")}>Register</button>
                </>
              ) : (
                <button className="btn-auth btn-logout" onClick={logout}>Logout</button>
              )}
            </div>
          </motion.nav>

          {/* ── HERO ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
              <StatBadge icon={Zap} label="Real-time" value="Sync" />
              <StatBadge icon={Users} label="Multiplayer" value="Collab" />
              <StatBadge icon={Code2} label="Languages" value="20+" />
            </div>

            <h1 className="hero-title">
              Code Together,<br />
              <span className="accent-word">Ship Faster.</span>
            </h1>

            <p style={{
              marginTop: "24px",
              color: "#64748b",
              fontSize: "18px",
              maxWidth: "520px",
              margin: "20px auto 0",
              lineHeight: 1.7,
              fontFamily: "'Syne', sans-serif",
            }}>
              Real-time collaborative code editing with instant sync, syntax highlighting, and zero setup.
            </p>
          </motion.div>

          {/* ── JOIN / CREATE ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "28px 32px",
              backdropFilter: "blur(16px)",
              marginBottom: "64px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "18px" }}>
              ▸ Quick Access
            </p>
            <div
              className="input-row"
              style={{ display: "flex", gap: "12px", alignItems: "stretch", flexWrap: "wrap" }}
            >
              <input
                type="text"
                placeholder="room-id (e.g. quiet-blue-fox)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                className="cs-input"
                style={{ flex: 2, minWidth: "220px" }}
              />
              <input
                type="text"
                placeholder="passcode (optional)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                maxLength={4}
                className="cs-input"
                style={{ flex: 1, minWidth: "150px", textAlign: "center", letterSpacing: "0.25em" }}
              />
              <button className="btn-join" onClick={handleJoinRoom} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Join <ArrowRight size={15} />
              </button>
              <button className="btn-create" onClick={handleCreateRoom} disabled={isCreating}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isCreating ? (
                    <>
                      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                        <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                      </div>
                      Creating...
                    </>
                  ) : (
                    <><Zap size={15} /> New Room</>
                  )}
                </span>
              </button>
            </div>
          </motion.div>

          <div className="divider" />

          {/* ── RECENT ROOMS ── */}
          {isAuthenticated && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="section-label">
                <Clock size={11} />
                Recent Sessions
              </div>

              {loadingRooms ? (
                <div style={{ display: "flex", gap: "8px", padding: "40px 0", justifyContent: "center" }}>
                  <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                </div>
              ) : visitedRooms.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "48px",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  color: "#334155",
                }}>
                  <Code2 size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px" }}>No sessions yet. Create your first room.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {visitedRooms.map((room, idx) => (
                    <motion.div
                      key={room.roomId}
                      className="room-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.06, duration: 0.4 }}
                      onClick={() => navigate(`/room/${room.roomId}`)}
                    >
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.roomId); }}
                        title="Remove from history"
                      >
                        <X size={13} />
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{
                          width: "32px", height: "32px",
                          background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))",
                          border: "1px solid rgba(6,182,212,0.2)",
                          borderRadius: "9px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Code2 size={14} style={{ color: "#06b6d4" }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "#e2e8f0",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {room.title || room.roomId}
                          </div>
                          {room.title && (
                            <div style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "11px", color: "#475569",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {room.roomId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={11} style={{ color: "#334155" }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#475569" }}>
                          {new Date(room.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {/* ── FOOTER ── */}
          <footer style={{
            marginTop: "80px",
            paddingTop: "24px",
            paddingBottom: "32px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={14} style={{ color: "#06b6d4" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#334155" }}>
                CodeSync v2.0
              </span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#334155" }}>
              crafted by{" "}
              <span style={{ color: "#06b6d4", fontWeight: 600 }}>Namra</span>
              {" "}with precision
            </p>
          </footer>
        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {newRoomData && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNewRoomData(null)}
          >
            <motion.div
              className="modal-box"
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setNewRoomData(null)}
                style={{
                  position: "absolute", top: "20px", right: "20px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "6px", cursor: "pointer",
                  color: "#64748b", display: "flex", alignItems: "center", transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#e2e8f0"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
              >
                <X size={16} />
              </button>

              <div style={{ textAlign: "center" }}>
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                  style={{
                    width: "64px", height: "64px",
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: "20px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 0 30px rgba(16,185,129,0.1)",
                  }}
                >
                  <Check size={28} style={{ color: "#10b981" }} />
                </motion.div>

                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "24px", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Room Ready
                </h2>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, fontFamily: "'Syne', sans-serif" }}>
                  Share the passcode with collaborators to grant edit access.
                </p>

                <div className="passcode-display">
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
                    Room Passcode
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "40px",
                      fontWeight: 700,
                      letterSpacing: "0.3em",
                      background: "linear-gradient(135deg, #06b6d4, #818cf8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {newRoomData.passcode}
                    </span>
                    <button
                      onClick={copyPasscode}
                      style={{
                        padding: "10px",
                        background: isCopied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${isCopied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        color: isCopied ? "#10b981" : "#64748b",
                        display: "flex", alignItems: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  {isCopied && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#10b981", marginTop: "8px" }}
                    >
                      ✓ Copied to clipboard
                    </motion.p>
                  )}
                </div>

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#334155", marginBottom: "20px", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                  <span style={{ color: "#475569" }}>room/</span>
                  <span style={{ color: "#06b6d4" }}>{newRoomData.roomId}</span>
                </div>

                <button
                  className="btn-enter"
                  onClick={() => navigate(`/room/${newRoomData.roomId}`, { state: { passcode: newRoomData.passcode } })}
                >
                  Enter Room <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Home;


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import {
//   uniqueNamesGenerator,
//   adjectives,
//   colors,
//   animals,
// } from "unique-names-generator";
// import { motion, AnimatePresence } from "framer-motion";
// import { Code2, Clock, Copy, Check, X } from "lucide-react";
// import toast from "react-hot-toast"; // ✅ Import toast hook only

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// function Home() {
//   const [roomId, setRoomId] = useState("");
//   const [passcode, setPasscode] = useState(""); 
//   const navigate = useNavigate();
//   const { isAuthenticated, user, logout, token } = useAuth();
//   const [visitedRooms, setVisitedRooms] = useState([]);
//   const [loadingRooms, setLoadingRooms] = useState(true);

//   // State for Success Modal
//   const [newRoomData, setNewRoomData] = useState(null); 
//   const [isCopied, setIsCopied] = useState(false);

//   useEffect(() => {
//     const fetchVisitedRooms = async () => {
//       if (!isAuthenticated) {
//         setVisitedRooms([]);
//         setLoadingRooms(false);
//         return;
//       }
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/my-rooms`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (res.ok) setVisitedRooms(data);
//         else console.error("Error fetching rooms:", data.error);
//       } catch (err) {
//         console.error("Fetch error:", err.message);
//       } finally {
//         setLoadingRooms(false);
//       }
//     };
//     fetchVisitedRooms();
//   }, [isAuthenticated, token]);

//   const handleCreateRoom = async () => {
//     if (!isAuthenticated) {
//       toast.error("Please login to create a room!");
//       navigate("/login");
//       return;
//     }

//     const newRoomId = uniqueNamesGenerator({
//       dictionaries: [adjectives, colors, animals],
//       separator: "-",
//       length: 3,
//     });

//     try {
//       const res = await fetch(`${BACKEND_URL}/api/create-room`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}` 
//         },
//         body: JSON.stringify({ roomId: newRoomId }),
//       });
//       const data = await res.json();
      
//       if (res.ok) {
//         setNewRoomData({ roomId: newRoomId, passcode: data.passcode });
//         toast.success("Room Created Successfully!");
//       } else {
//         toast.error(data.error || "Failed to create room");
//       }
//     } catch (err) {
//       toast.error("🚨 Failed to create room. Try again.");
//     }
//   };

//   const handleJoinRoom = () => {
//     if (roomId.trim()) {
//       navigate(`/room/${roomId.trim()}`, { 
//         state: { passcode: passcode.trim() } 
//       });
//     } else {
//       toast.error("Please enter a Room ID");
//     }
//   };

//   const handleDeleteRoom = async (roomIdToDelete) => {
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/my-rooms/${roomIdToDelete}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         setVisitedRooms((prev) =>
//           prev.filter((room) => room.roomId !== roomIdToDelete)
//         );
//         toast.success("Room removed from history");
//       } else {
//         const data = await res.json();
//         toast.error(data.error || "Failed to remove room");
//       }
//     } catch (err) {
//       toast.error("🚨 Couldn't remove room. Try again.");
//       console.error(err.message);
//     }
//   };

//   const copyPasscode = () => {
//     if (newRoomData?.passcode) {
//       navigator.clipboard.writeText(newRoomData.passcode);
//       setIsCopied(true);
//       toast.success("Passcode copied!");
//       setTimeout(() => setIsCopied(false), 2000);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-gray-900 text-white font-sans relative">
//       {/* ❌ No <Toaster /> here, it is in main.jsx */}

//       <div className="flex-grow px-4 py-10 max-w-6xl mx-auto w-full">
//         <header className="flex justify-between items-center mb-12">
//           <h1 className="text-3xl font-bold text-cyan-400">🚀 CodeSync</h1>
//           <div className="space-x-4">
//             {!isAuthenticated ? (
//               <>
//                 <button
//                   onClick={() => navigate("/login")}
//                   className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
//                 >
//                   Login
//                 </button>
//                 <button
//                   onClick={() => navigate("/register")}
//                   className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
//                 >
//                   Register
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={logout}
//                 className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
//               >
//                 Logout
//               </button>
//             )}
//           </div>
//         </header>

//         {isAuthenticated && user?.username && (
//           <p className="mb-6 text-xl text-center">
//             👋 Welcome back,{" "}
//             <span className="text-yellow-300 font-semibold">
//               {user.username}
//             </span>
//           </p>
//         )}

//         <section className="flex flex-col md:flex-row items-center gap-4 mb-12 justify-center">
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//             className="px-4 py-2 w-full md:w-64 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring focus:ring-cyan-500"
//           />
          
//           <input
//             type="text"
//             placeholder="Passcode (Optional)"
//             value={passcode}
//             onChange={(e) => setPasscode(e.target.value)}
//             maxLength={4}
//             className="px-4 py-2 w-full md:w-40 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring focus:ring-cyan-500 text-center tracking-widest"
//           />

//           <button
//             onClick={handleJoinRoom}
//             className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 w-full md:w-auto font-semibold"
//           >
//             🔗 Join
//           </button>
          
//           <button
//             onClick={handleCreateRoom}
//             className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 w-full md:w-auto font-semibold"
//           >
//             ➕ Create
//           </button>
//         </section>

//         {isAuthenticated && (
//           <section>
//             <h2 className="text-2xl font-bold mb-4">🕘 Recently Visited</h2>
//             {loadingRooms ? (
//               <p>Loading...</p>
//             ) : visitedRooms.length === 0 ? (
//               <p className="text-gray-400">No visited rooms yet.</p>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 {visitedRooms.map((room, idx) => (
//                   <motion.div
//                     key={room.roomId}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     whileHover={{ scale: 1.03 }}
//                     transition={{ delay: idx * 0.05 }}
//                     className="relative p-5 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
//                   >
//                     <div
//                       onClick={() => navigate(`/room/${room.roomId}`)}
//                       className="cursor-pointer"
//                     >
//                       <div className="flex items-center gap-2 mb-2">
//                         <Code2 size={20} className="text-cyan-300" />
//                         <h3 className="text-lg font-semibold text-cyan-300 truncate">
//                           {room.title || room.roomId}
//                         </h3>
//                       </div>
//                       {room.title && (
//                         <p className="text-sm text-gray-300 truncate">
//                           ID: {room.roomId}
//                         </p>
//                       )}
//                       <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
//                         <Clock size={14} />
//                         <span>
//                           {new Date(room.createdAt).toLocaleString()}
//                         </span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDeleteRoom(room.roomId);
//                       }}
//                       title="Remove from history"
//                       className="absolute top-2 right-2 text-red-400 hover:text-red-600"
//                     >
//                       ✖
//                     </button>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </section>
//         )}
//       </div>

//       <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
//         🚀 Made with ❤️ by{" "}
//         <span className="text-cyan-400 font-medium">Namra</span>
//       </footer>

//       {/* Success Modal */}
//       <AnimatePresence>
//         {newRoomData && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md w-full relative"
//             >
//               <button
//                 onClick={() => setNewRoomData(null)}
//                 className="absolute top-4 right-4 text-gray-400 hover:text-white"
//               >
//                 <X size={24} />
//               </button>

//               <div className="text-center">
//                 <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Check size={32} />
//                 </div>
//                 <h2 className="text-2xl font-bold text-white mb-2">Room Created!</h2>
//                 <p className="text-gray-400 mb-6">
//                   Your room is ready. Share this passcode to allow others to edit.
//                 </p>

//                 <div className="bg-black/40 p-4 rounded-xl border border-gray-700 mb-6 flex flex-col items-center">
//                   <span className="text-sm text-gray-500 uppercase tracking-widest mb-1">Passcode</span>
//                   <div className="flex items-center gap-3">
//                     <span className="text-4xl font-mono font-bold text-cyan-400 tracking-widest">
//                       {newRoomData.passcode}
//                     </span>
//                     <button
//                       onClick={copyPasscode}
//                       className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group relative"
//                       title="Copy Passcode"
//                     >
//                       {isCopied ? (
//                         <Check size={20} className="text-green-400" />
//                       ) : (
//                         <Copy size={20} className="text-gray-400 group-hover:text-white" />
//                       )}
//                     </button>
//                   </div>
//                   {isCopied && <span className="text-green-400 text-xs mt-2">Copied!</span>}
//                 </div>

//                 <button
//                   onClick={() => navigate(`/room/${newRoomData.roomId}`, { state: { passcode: newRoomData.passcode } })}
//                   className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-[1.02]"
//                 >
//                   Enter Room 🚀
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default Home;
