
import { useState } from "react";
import { FaHome, FaSave, FaDownload, FaCopy, FaRobot, FaTimes, FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function EditorHeader({
  title, setTitle, onSave, roomId, navigate,
  backendUrl, activeFile, codeContent, onApplySuggestion
}) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return toast.error("Please enter a question");
    if (!activeFile) return toast.error("Open a file first");
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ code: codeContent, prompt: aiPrompt, language: activeFile.split('.').pop() })
      });
      const data = await res.json();
      if (res.ok) setAiResponse(data.result);
      else toast.error(data.error || "AI failed to respond");
    } catch (err) {
      toast.error("Failed to connect to AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInsert = () => {
    if (!aiResponse) return;
    onApplySuggestion(aiResponse);
    setIsAiOpen(false);
  };

  const iconBtn = (onClick, Icon, title, style) => (
    <button onClick={onClick} title={title} style={{
      width: "34px", height: "34px",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)",
      cursor: "pointer", transition: "all 0.18s ease",
      fontSize: "13px",
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.filter = "brightness(1.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}
    >
      <Icon />
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');
        .cs-title-input {
          flex: 1;
          padding: 9px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .cs-title-input::placeholder { color: #334155; }
        .cs-title-input:focus {
          border-color: rgba(6,182,212,0.4);
          background: rgba(6,182,212,0.04);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.07);
        }
        .cs-ai-input {
          flex: 1;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .cs-ai-input::placeholder { color: #334155; }
        .cs-ai-input:focus {
          border-color: rgba(139,92,246,0.45);
          background: rgba(139,92,246,0.04);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.07);
        }
        .cs-send-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border: none; border-radius: 10px;
          color: #fff; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
        }
        .cs-send-btn:hover { box-shadow: 0 0 20px rgba(124,58,237,0.4); transform: translateY(-1px); }
        .cs-send-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
        .cs-insert-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 9px; color: #10b981;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
        }
        .cs-insert-btn:hover { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); box-shadow: 0 0 16px rgba(16,185,129,0.15); }
        .ai-loading-dot { width: 5px; height: 5px; border-radius: 50%; background: #a78bfa; animation: cs-ldot 1s ease-in-out infinite; }
        .ai-loading-dot:nth-child(2) { animation-delay: 0.18s; }
        .ai-loading-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes cs-ldot { 0%,100%{opacity:0.25;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      {/* ── Header bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", padding: "10px 0 6px" }}>
        <input
          className="cs-title-input"
          placeholder="Project title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* AI */}
          {iconBtn(
            () => setIsAiOpen(true), FaRobot, "Ask AI",
            { background: "rgba(124,58,237,0.15)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa" }
          )}
          {/* Home */}
          {iconBtn(
            () => navigate("/"), FaHome, "Home",
            { background: "rgba(234,179,8,0.12)", borderColor: "rgba(234,179,8,0.25)", color: "#eab308" }
          )}
          {/* Save */}
          {iconBtn(
            onSave, FaSave, "Save",
            { background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.25)", color: "#10b981" }
          )}
          {/* Copy Room ID */}
          {iconBtn(
            () => roomId && navigator.clipboard.writeText(roomId).then(() => toast.success("Room ID copied!")),
            FaCopy, "Copy Room ID",
            { background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.25)", color: "#818cf8" }
          )}
          {/* Download */}
          {iconBtn(
            () => roomId && window.open(`${backendUrl}/api/download/${roomId}`, "_blank"),
            FaDownload, "Download",
            { background: "rgba(6,182,212,0.10)", borderColor: "rgba(6,182,212,0.22)", color: "#06b6d4" }
          )}
        </div>
      </div>

      {/* ── AI Modal ── */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(2,11,20,0.82)", backdropFilter: "blur(12px)",
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "#0d1f2d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                width: "100%", maxWidth: "560px",
                maxHeight: "80vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.1)",
                overflow: "hidden",
              }}
            >
              {/* Modal header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "30px", height: "30px",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.2))",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#a78bfa", fontSize: "13px",
                  }}>
                    <FaRobot />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", color: "#e2e8f0" }}>
                      AI Assistant
                    </p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#475569", marginTop: "1px" }}>
                      {activeFile || "no file open"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiOpen(false)}
                  style={{
                    width: "28px", height: "28px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#64748b", cursor: "pointer", fontSize: "12px", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#e2e8f0"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Response area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {isAiLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <div className="ai-loading-dot" />
                      <div className="ai-loading-dot" />
                      <div className="ai-loading-dot" />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#475569", letterSpacing: "0.06em" }}>
                      ▸ thinking...
                    </p>
                  </div>
                ) : aiResponse ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "12px",
                      padding: "16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "13px",
                      color: "#cbd5e1",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                    }}
                  >
                    {aiResponse}
                  </motion.div>
                ) : (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", height: "120px", gap: "10px",
                    color: "#1e3a4a",
                  }}>
                    <FaRobot style={{ fontSize: "28px", opacity: 0.3 }} />
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.04em" }}>
                      Enter a prompt to analyse your code
                    </p>
                  </div>
                )}
              </div>

              {/* Footer: insert + input */}
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <button className="cs-insert-btn" onClick={handleInsert}>
                      <FaMagic size={11} /> Insert at Cursor
                    </button>
                  </motion.div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="cs-ai-input"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !isAiLoading && handleAskAI()}
                    placeholder="Ask about your code..."
                  />
                  <button className="cs-send-btn" onClick={handleAskAI} disabled={isAiLoading}>
                    {isAiLoading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default EditorHeader;

// import { useState } from "react";
// import { FaHome, FaSave, FaDownload, FaCopy, FaRobot, FaTimes, FaMagic } from "react-icons/fa";
// import toast from "react-hot-toast";

// function EditorHeader({
//   title,
//   setTitle,
//   onSave,
//   roomId,
//   navigate,
//   backendUrl,
//   activeFile,
//   codeContent,
//   onApplySuggestion // 👈 New Handler
// }) {
//   // AI State
//   const [isAiOpen, setIsAiOpen] = useState(false);
//   const [aiPrompt, setAiPrompt] = useState("");
//   const [aiResponse, setAiResponse] = useState("");
//   const [isAiLoading, setIsAiLoading] = useState(false);

//   // 1. Fetch AI
//   const handleAskAI = async () => {
//     if (!aiPrompt.trim()) return toast.error("Please enter a question");
//     if (!activeFile) return toast.error("Open a file first");

//     setIsAiLoading(true);
//     setAiResponse("");

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${backendUrl}/api/ai/ask`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           code: codeContent,
//           prompt: aiPrompt,
//           language: activeFile.split('.').pop()
//         })
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setAiResponse(data.result);
//       } else {
//         toast.error(data.error || "AI failed to respond");
//       }
//     } catch (err) {
//       toast.error("Failed to connect to AI");
//     } finally {
//       setIsAiLoading(false);
//     }
//   };

//   // 2. Insert Handler
//   const handleInsert = () => {
//     if (!aiResponse) return;
//     onApplySuggestion(aiResponse); // Calls parent to clean & insert
//     setIsAiOpen(false); // Close modal
//   };

//   return (
//     <>
//       <div className="flex items-center gap-3 mb-4">
//         <input
//           className="flex-grow px-4 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white shadow-inner"
//           placeholder="📝 Project title..."
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <div className="flex gap-2">
//           {/* 🤖 AI Button */}
//           <button
//             onClick={() => setIsAiOpen(true)}
//             className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg shadow-sm text-white transition-colors"
//             title="Ask AI"
//           >
//             <FaRobot />
//           </button>

//           <button onClick={() => navigate("/")} className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg text-black">
//             <FaHome />
//           </button>
//           <button onClick={onSave} className="bg-green-500 hover:bg-green-600 p-2 rounded-lg text-white">
//             <FaSave />
//           </button>
//           <button
//             onClick={() => {
//                 roomId && navigator.clipboard.writeText(roomId).then(() => toast.success("Copied!"));
//             }}
//             className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg text-white"
//           >
//             <FaCopy />
//           </button>
//           <button
//             onClick={() => roomId && window.open(`${backendUrl}/api/download/${roomId}`, "_blank")}
//             className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white"
//           >
//             <FaDownload />
//           </button>
//         </div>
//       </div>

//       {/* 🤖 AI Modal */}
//       {isAiOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
//           <div className="bg-gray-900 border border-gray-700 w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
            
//             <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
//               <h3 className="text-white font-bold flex items-center gap-2">
//                 <FaRobot className="text-purple-400"/> AI Assistant
//               </h3>
//               <button onClick={() => setIsAiOpen(false)} className="text-gray-400 hover:text-white">
//                 <FaTimes />
//               </button>
//             </div>

//             <div className="p-4 overflow-y-auto flex-1 text-gray-300 space-y-4">
//               <div className="text-xs text-gray-500">
//                 Context: <span className="text-purple-400">{activeFile}</span>
//               </div>
              
//               {aiResponse ? (
//                 <div className="bg-black/30 p-3 rounded border border-gray-700/50 whitespace-pre-wrap leading-relaxed font-mono text-sm">
//                   {aiResponse}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-600">Enter a prompt to analyze code</div>
//               )}
//             </div>

//             <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl flex flex-col gap-3">
//               {/* ✨ Insert Button */}
//               {aiResponse && (
//                  <div className="flex justify-end pb-2">
//                     <button 
//                       onClick={handleInsert}
//                       className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition"
//                     >
//                       <FaMagic /> Insert at Cursor
//                     </button>
//                  </div>
//               )}

//               <div className="flex gap-3">
//                 <input 
//                   value={aiPrompt}
//                   onChange={(e) => setAiPrompt(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && handleAskAI()}
//                   placeholder="Ask about your code..."
//                   className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
//                 />
//                 <button 
//                   onClick={handleAskAI}
//                   disabled={isAiLoading}
//                   className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium disabled:opacity-50"
//                 >
//                   {isAiLoading ? "..." : "Send"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default EditorHeader;
