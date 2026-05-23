import { motion, AnimatePresence } from "framer-motion";
import CodeEditor from "../../components/editor/CodeEditor";
import { FaCode } from "react-icons/fa";

function EditorWorkspace({
  activeFile, fileContent, fileLanguage,
  provider, yDoc, setFileContent, cursorRef
}) {
  return (
    <div style={{
      flex: 1,
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.07)",
      background: "#0a141e",
      position: "relative",
      minHeight: 0,
    }}>
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.25), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      <AnimatePresence mode="wait">
        {activeFile && fileContent[activeFile] !== undefined ? (
          <motion.div
            key={activeFile}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ height: "100%" }}
          >
            <CodeEditor
              key={activeFile}
              activeFile={activeFile}
              initialContent={fileContent[activeFile] || ""}
              yProvider={provider}
              yDoc={yDoc}
              onCodeChange={(newCode) =>
                setFileContent((prev) => ({ ...prev, [activeFile]: newCode }))
              }
              language={fileLanguage[activeFile] || "plaintext"}
              cursorRef={cursorRef}
            />
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: "14px",
            }}
          >
            <div style={{
              width: "48px", height: "48px",
              background: "rgba(6,182,212,0.07)",
              border: "1px solid rgba(6,182,212,0.15)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(6,182,212,0.35)", fontSize: "18px",
            }}>
              <FaCode />
            </div>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px", color: "#1e3042",
              letterSpacing: "0.05em",
            }}>
              select or create a file to start coding
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditorWorkspace;


// import { motion, AnimatePresence } from "framer-motion";
// import CodeEditor from "../../components/editor/CodeEditor";

// function EditorWorkspace({
//   activeFile,
//   fileContent,
//   fileLanguage,
//   provider,
//   yDoc,
//   setFileContent,
//   cursorRef // 👈 Receive Prop
// }) {
//   return (
//     <div className="flex-grow bg-[#1a1a1d] rounded-lg overflow-hidden shadow-inner">
//       <AnimatePresence mode="wait">
//         {activeFile && fileContent[activeFile] !== undefined ? (
//           <motion.div
//             key={activeFile}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="h-full"
//           >
//             <CodeEditor
//               key={activeFile}
//               activeFile={activeFile}
//               initialContent={fileContent[activeFile] || ""}
//               yProvider={provider}
//               yDoc={yDoc}
//               onCodeChange={(newCode) =>
//                 setFileContent((prev) => ({
//                   ...prev,
//                   [activeFile]: newCode,
//                 }))
//               }
//               language={fileLanguage[activeFile] || "plaintext"}
//               cursorRef={cursorRef} // 👈 Pass it down
//             />
//           </motion.div>
//         ) : (
//           <motion.div
//             key="placeholder"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="flex items-center justify-center h-full text-gray-500 italic"
//           >
//             Select or create a file to start coding
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default EditorWorkspace;
