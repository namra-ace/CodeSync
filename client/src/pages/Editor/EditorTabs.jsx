
import { motion } from "framer-motion";

function EditorTabs({ openTabs, activeFile, setActiveFile, setOpenTabs }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        .cs-tab-close {
          margin-left: 8px;
          width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 4px;
          border: none; background: transparent;
          color: #334155; cursor: pointer;
          font-size: 10px; line-height: 1;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .cs-tab-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
      `}</style>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "2px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.015)",
        padding: "6px 4px 0",
        overflowX: "auto",
        minHeight: "38px",
        flexShrink: 0,
      }}>
        {openTabs.map((file) => {
          const isActive = file === activeFile;
          const fileName = file.split("/").pop();
          // derive a dim colour from extension
          const ext = fileName.split(".").pop();
          const extColors = {
            js: "#f0db4f", jsx: "#61dafb", ts: "#3178c6", tsx: "#61dafb",
            py: "#3572A5", css: "#563d7c", html: "#e44d26", json: "#c7c7c7",
            md: "#083fa1",
          };
          const dotColor = extColors[ext] || "#475569";

          return (
            <motion.div
              key={file}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center",
                padding: "5px 12px",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.15s, border-color 0.15s",
                background: isActive ? "rgba(6,182,212,0.08)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "rgba(6,182,212,0.25)" : "transparent",
                borderBottom: isActive ? "1px solid #020b14" : "1px solid transparent",
                marginBottom: "-1px",
                position: "relative",
              }}
              onClick={() => setActiveFile(file)}
            >
              {/* Language dot */}
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: dotColor, marginRight: "7px", flexShrink: 0,
                opacity: isActive ? 1 : 0.4,
              }} />

              <span
                title={file}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#e2e8f0" : "#475569",
                  transition: "color 0.15s",
                  maxWidth: "140px",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {fileName}
              </span>

              <button
                className="cs-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedTabs = openTabs.filter((f) => f !== file);
                  setOpenTabs(updatedTabs);
                  if (isActive) setActiveFile(updatedTabs.at(-1) || null);
                }}
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

export default EditorTabs;

// import { motion } from "framer-motion";

// function EditorTabs({
//   openTabs,
//   activeFile,
//   setActiveFile,
//   setOpenTabs,
// }) {
//   return (
//     <div className="flex items-center space-x-1 border-b border-gray-800 bg-[#121212] px-2 py-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
//       {openTabs.map((file) => {
//         const isActive = file === activeFile;

//         return (
//           <motion.div
//             key={file}
//             layout
//             initial={{ opacity: 0.6, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className={`flex items-center px-4 py-1 rounded-t-md cursor-pointer transition-colors whitespace-nowrap font-mono text-sm ${
//               isActive
//                 ? "bg-gray-700 text-white font-bold"
//                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//             }`}
//             onClick={() => setActiveFile(file)}
//           >
//             <span title={file}>{file.split("/").pop()}</span>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 const updatedTabs = openTabs.filter((f) => f !== file);
//                 setOpenTabs(updatedTabs);
//                 if (isActive) setActiveFile(updatedTabs.at(-1) || null);
//               }}
//               className="ml-2 hover:text-red-500"
//             >
//               ✕
//             </button>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// }

// export default EditorTabs;
