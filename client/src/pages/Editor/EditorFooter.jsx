
import { motion } from "framer-motion";

function EditorFooter({ activeUsers }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700&display=swap');
        @keyframes cs-ping {
          0%   { transform: scale(1); opacity: 0.8; }
          70%  { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: "8px",
          padding: "8px 14px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
          <div style={{ position: "relative", width: "8px", height: "8px" }}>
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: "50%", background: "#10b981",
              animation: "cs-ping 1.8s ease-out infinite",
            }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981" }} />
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px", color: "#334155",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Live
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

        {/* Users */}
        {activeUsers.length ? (
          [...activeUsers]
            .sort((a, b) => a.username.localeCompare(b.username))
            .map((u, i) => {
              const isSelf = u.username === localStorage.getItem("username");
              return (
                <span
                  key={u.id || i}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    background: isSelf
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isSelf ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`,
                    color: isSelf ? "#10b981" : "#64748b",
                  }}
                >
                  {u.username || "Guest"}{isSelf && " ·you"}
                </span>
              );
            })
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#1e3042" }}>
            no active users
          </span>
        )}
      </motion.div>
    </>
  );
}

export default EditorFooter;

// import { motion } from "framer-motion";

// function EditorFooter({ activeUsers }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="bg-[#121212] mt-4 p-2 rounded shadow text-white flex flex-wrap items-center gap-2 text-sm border border-gray-700"
//     >
//       👥 Active Users:
//       {activeUsers.length ? (
//         [...activeUsers]
//           .sort((a, b) => a.username.localeCompare(b.username))
//           .map((u, i) => {
//             const isSelf =
//               u.username === localStorage.getItem("username");

//             return (
//               <span
//                 key={u.id || i}
//                 className={`px-2 py-1 rounded-full font-medium ${
//                   isSelf
//                     ? "bg-green-600 text-white"
//                     : "bg-gray-700 text-gray-300"
//                 }`}
//               >
//                 {u.username || "Guest"} {isSelf && "(You)"}
//               </span>
//             );
//           })
//       ) : (
//         <span className="ml-2 text-gray-400">None</span>
//       )}
//     </motion.div>
//   );
// }

// export default EditorFooter;
