
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import Spinner from "../components/common/Spinner";
import ProjectSidebar from "../components/sidebar/ProjectSidebar";
import { useAuth } from "../context/AuthContext";

import { useEditorState } from "./Editor/useEditorState";
import { useEditorActions } from "./Editor/useEditorActions";
import { useEditorRealtime } from "./Editor/useEditorRealtime";

import EditorHeader from "./Editor/EditorHeader";
import EditorTabs from "./Editor/EditorTabs";
import EditorWorkspace from "./Editor/EditorWorkSpace";
import EditorFooter from "./Editor/EditorFooter";

import {
  handleFileClick,
  handleDeleteNode,
  handleRenameNode,
} from "../utils/fileTree/FileOperations";

import {
  getLanguageFromExtension,
  handleAddNode,
} from "../utils/fileTree/structureOperations";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ── Loading screen ────────────────────────────────────────────────
function LoadingScreen({ isVerifying, authLoading }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        @keyframes cs-spin { to { transform: rotate(360deg); } }
        @keyframes cs-pulse-glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 12px rgba(6,182,212,0.3); }
          50%       { opacity: 1;   box-shadow: 0 0 28px rgba(6,182,212,0.7); }
        }
        @keyframes cs-ldot {
          0%, 100% { opacity: 0.2; transform: scaleY(0.5); }
          50%       { opacity: 1;   transform: scaleY(1.3); }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          height: "100vh", width: "100vw",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#020b14",
          backgroundImage: `linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          gap: "28px",
          fontFamily: "'Syne', sans-serif",
          color: "#e2e8f0",
        }}
      >
        {/* Spinner ring */}
        <div style={{ position: "relative", width: "64px", height: "64px" }}>
          <div style={{
            position: "absolute", inset: 0,
            border: "2px solid rgba(6,182,212,0.12)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            border: "2px solid transparent",
            borderTopColor: "#06b6d4",
            borderRadius: "50%",
            animation: "cs-spin 0.9s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: "10px",
            background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.12))",
            borderRadius: "50%",
            animation: "cs-pulse-glow 2s ease-in-out infinite",
          }} />
        </div>

        {/* Bar equalizer */}
        <div style={{ display: "flex", gap: "5px", alignItems: "flex-end", height: "24px" }}>
          {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
            <div key={i} style={{
              width: "4px", height: "100%",
              background: i % 2 === 0 ? "#06b6d4" : "#6366f1",
              borderRadius: "2px",
              animation: `cs-ldot 1s ease-in-out ${delay}s infinite`,
            }} />
          ))}
        </div>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: isVerifying ? "#06b6d4" : "#334155",
          letterSpacing: "0.07em",
        }}>
          {isVerifying
            ? "▸ verifying access..."
            : authLoading
            ? "▸ authenticating..."
            : "▸ loading workspace..."}
        </p>
      </motion.div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────
function EditorPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cursorRef = useRef(0);

  const [isVerifying, setIsVerifying] = useState(false);
  const [canConnect, setCanConnect] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const verifyAccess = async () => {
      const passcode = location.state?.passcode;
      if (!passcode) {
        if (isAuthenticated && !token) return;
        setCanConnect(true);
        return;
      }
      setIsVerifying(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/verify-passcode`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ roomId, passcode }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Access granted");
        } else {
          toast.error(data.error || "Access denied");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Network error: could not verify access");
      } finally {
        setIsVerifying(false);
        setCanConnect(true);
      }
    };
    verifyAccess();
  }, [roomId, token, location.state, authLoading, isAuthenticated, navigate]);

  const {
    activeUsers, setActiveUsers,
    title, setTitle,
    fileLanguage, setFileLanguage,
    projectstructure, setProjectStructure,
    fileContent, setFileContent,
    activeFile, setActiveFile,
    hasLoadedFiles, setHasLoadedFiles,
    openTabs, setOpenTabs,
  } = useEditorState();

  const { handleSave, syncToDB } = useEditorActions({
    roomId, token, fileContent, projectstructure, title, hasLoadedFiles,
  });

  const effectiveRoomId = canConnect ? roomId : null;

  const { provider, yDoc } = useEditorRealtime({
    roomId: effectiveRoomId,
    activeFile, fileContent, setFileContent,
    projectstructure, setProjectStructure,
    hasLoadedFiles, setHasLoadedFiles,
    setActiveUsers, title, setTitle, token,
  });

  const handleApplyAiSuggestion = (suggestion) => {
    if (!yDoc || !activeFile) return toast.error("No active file!");
    const yText = yDoc.getText(activeFile);
    const codeBlockRegex = /```(?:[\w]*\n)?([\s\S]*?)```/;
    const match = suggestion.match(codeBlockRegex);
    const codeToInsert = (match && match[1]) ? match[1].trim() : suggestion;
    const insertPos = cursorRef.current || 0;
    yDoc.transact(() => {
      const safePos = Math.min(insertPos, yText.length);
      yText.insert(safePos, "\n" + codeToInsert + "\n");
    });
    toast.success("Code inserted at cursor");
  };

  if (authLoading || isVerifying || !hasLoadedFiles) {
    return (
      <AnimatePresence>
        <LoadingScreen isVerifying={isVerifying} authLoading={authLoading} />
      </AnimatePresence>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        .cs-editor-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          background: #020b14;
          color: #e2e8f0;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Top ambient gradient line */
        .cs-editor-page::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.4) 35%, rgba(99,102,241,0.35) 65%, transparent 95%);
          z-index: 100;
          pointer-events: none;
        }

        /* Corner glow */
        .cs-editor-page::after {
          content: '';
          position: fixed;
          top: -180px; left: -180px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .cs-sidebar {
          position: relative;
          z-index: 10;
          height: 100%;
          border-right: 1px solid rgba(255,255,255,0.055);
          background: rgba(5,14,24,0.95);
          flex-shrink: 0;
        }

        .cs-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          z-index: 1;
          padding: 0 10px 10px;
          gap: 0;
        }

        /* Custom scrollbars throughout */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.18); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.38); }
      `}</style>

      <div className="cs-editor-page">
        {/* ── Sidebar ── */}
        <motion.div
          className="cs-sidebar"
          initial={{ x: -56, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProjectSidebar
            structure={projectstructure.children}
            activeFile={activeFile}
            onFileClick={(filePath) =>
              handleFileClick(filePath, setActiveFile, setFileLanguage, setOpenTabs, getLanguageFromExtension)
            }
            onAddNode={(newNode, path) =>
              handleAddNode({
                newNode, path, projectstructure, setProjectStructure,
                setFileContent, setFileLanguage, setActiveFile, setOpenTabs, syncToDB,
              })
            }
            onDeleteNode={(pathToDelete) =>
              handleDeleteNode({
                pathToDelete, projectStructure: projectstructure,
                fileContent, setOpenTabs, openTabs, setActiveFile, activeFile,
                setProjectStructure, setFileContent, fileLanguage, setFileLanguage,
                getLanguageFromExtension, syncToDB,
              })
            }
            onRenameNode={(oldPath, newName) =>
              handleRenameNode({
                oldPath, newName, projectStructure: projectstructure,
                setProjectStructure, fileContent, setFileContent,
                setActiveFile, activeFile, setOpenTabs, openTabs,
                fileLanguage, setFileLanguage, getLanguageFromExtension, syncToDB,
              })
            }
          />
        </motion.div>

        {/* ── Main panel ── */}
        <motion.div
          className="cs-main"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.18, ease: "easeOut" }}
        >
          <EditorHeader
            title={title}
            setTitle={setTitle}
            onSave={handleSave}
            roomId={roomId}
            navigate={navigate}
            backendUrl={BACKEND_URL}
            activeFile={activeFile}
            codeContent={fileContent[activeFile] || ""}
            onApplySuggestion={handleApplyAiSuggestion}
          />

          <EditorTabs
            openTabs={openTabs}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            setOpenTabs={setOpenTabs}
          />

          {provider && (
            <EditorWorkspace
              activeFile={activeFile}
              fileContent={fileContent}
              fileLanguage={fileLanguage}
              provider={provider}
              yDoc={yDoc}
              setFileContent={setFileContent}
              cursorRef={cursorRef}
            />
          )}

          <EditorFooter activeUsers={activeUsers} />
        </motion.div>
      </div>
    </>
  );
}

export default EditorPage;

// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import toast from "react-hot-toast";

// import Spinner from "../components/common/Spinner";
// import ProjectSidebar from "../components/sidebar/ProjectSidebar";
// import { useAuth } from "../context/AuthContext";

// import { useEditorState } from "./Editor/useEditorState";
// import { useEditorActions } from "./Editor/useEditorActions";
// import { useEditorRealtime } from "./Editor/useEditorRealtime";

// import EditorHeader from "./Editor/EditorHeader";
// import EditorTabs from "./Editor/EditorTabs";
// import EditorWorkspace from "./Editor/EditorWorkSpace";
// import EditorFooter from "./Editor/EditorFooter";

// import {
//   handleFileClick,
//   handleDeleteNode,
//   handleRenameNode,
// } from "../utils/fileTree/FileOperations";

// import {
//   getLanguageFromExtension,
//   handleAddNode,
// } from "../utils/fileTree/structureOperations";

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// function EditorPage() {
//   const { token, isAuthenticated, loading: authLoading } = useAuth();
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 📍 Tracks cursor position (0 to N)
//   const cursorRef = useRef(0);

//   const [isVerifying, setIsVerifying] = useState(false);
//   const [canConnect, setCanConnect] = useState(false);

//   useEffect(() => {
//     if (authLoading) return;

//     const verifyAccess = async () => {
//       const passcode = location.state?.passcode;

//       if (!passcode) {
//         if (isAuthenticated && !token) return;
//         setCanConnect(true);
//         return;
//       }

//       setIsVerifying(true);
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/verify-passcode`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ roomId, passcode }),
//         });

//         const data = await res.json();
        
//         if (res.ok) {
//           toast.success("Access Granted");
//         } else {
//           toast.error(data.error || "Access Denied");
//           setTimeout(() => navigate("/"), 2000);
//         }
//       } catch (err) {
//         console.error("Verification error:", err);
//         toast.error("Network Error: Could not verify access");
//       } finally {
//         setIsVerifying(false);
//         setCanConnect(true);
//       }
//     };

//     verifyAccess();
//   }, [roomId, token, location.state, authLoading, isAuthenticated, navigate]);

//   const {
//     activeUsers,
//     setActiveUsers,
//     title,
//     setTitle,
//     fileLanguage,
//     setFileLanguage,
//     projectstructure,
//     setProjectStructure,
//     fileContent,
//     setFileContent,
//     activeFile,
//     setActiveFile,
//     hasLoadedFiles,
//     setHasLoadedFiles,
//     openTabs,
//     setOpenTabs,
//   } = useEditorState();

//   const { handleSave, syncToDB } = useEditorActions({
//     roomId,
//     token,
//     fileContent,
//     projectstructure,
//     title,
//     hasLoadedFiles,
//   });

//   const effectiveRoomId = canConnect ? roomId : null;

//   const { provider, yDoc } = useEditorRealtime({
//     roomId: effectiveRoomId,
//     activeFile,
//     fileContent,
//     setFileContent,
//     projectstructure,
//     setProjectStructure,
//     hasLoadedFiles,
//     setHasLoadedFiles,
//     setActiveUsers,
//     title,
//     setTitle,
//     token,
//   });

//   // ---------------------------------------------------------------
//   // 🤖 AI INSERTION LOGIC (CLEAN CODE ONLY)
//   // ---------------------------------------------------------------
//   const handleApplyAiSuggestion = (suggestion) => {
//     if (!yDoc || !activeFile) return toast.error("No active file!");

//     const yText = yDoc.getText(activeFile);
    
//     // 1. EXTRACT CODE ONLY (Regex)
//     // This looks for content between ``` and ```
//     // ([\s\S]*?) matches any character including newlines
//     const codeBlockRegex = /```(?:[\w]*\n)?([\s\S]*?)```/;
//     const match = suggestion.match(codeBlockRegex);

//     let codeToInsert = suggestion;

//     if (match && match[1]) {
//       // ✅ Found a code block! Use ONLY the code inside.
//       codeToInsert = match[1].trim(); 
//     } else {
//       // ⚠️ No code block found. 
//       // Fallback: Use the whole text, but try to strip common prefixes if needed.
//       // Usually, Gemini/OpenAI ALWAYS uses code blocks for code.
//       codeToInsert = suggestion;
//     }

//     // 2. Insert as REAL CODE (No Comments) at Cursor
//     const insertPos = cursorRef.current || 0;

//     // Atomic Transaction (Visible to ALL users instantly)
//     yDoc.transact(() => {
//       // Ensure we don't insert out of bounds
//       const safePos = Math.min(insertPos, yText.length);
//       yText.insert(safePos, "\n" + codeToInsert + "\n");
//     });

//     toast.success("Code inserted at cursor!");
//   };

//   if (authLoading || isVerifying || !hasLoadedFiles) {
//     return (
//       <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center bg-gray-950 text-white">
//         <Spinner />
//         {isVerifying && <p className="text-cyan-400 animate-pulse">Verifying Access...</p>}
//         {authLoading && <p className="text-gray-500">Authenticating...</p>}
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen w-screen flex bg-[#0a0a0a] text-white overflow-hidden">
//       <motion.div
//         initial={{ x: -50, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.4, ease: "easeOut" }}
//       >
//         <ProjectSidebar
//           structure={projectstructure.children}
//           activeFile={activeFile}
//           onFileClick={(filePath) =>
//             handleFileClick(
//               filePath,
//               setActiveFile,
//               setFileLanguage,
//               setOpenTabs,
//               getLanguageFromExtension
//             )
//           }
//           onAddNode={(newNode, path) =>
//             handleAddNode({
//               newNode,
//               path,
//               projectstructure,
//               setProjectStructure,
//               setFileContent,
//               setFileLanguage,
//               setActiveFile,
//               setOpenTabs,
//               syncToDB,
//             })
//           }
//           onDeleteNode={(pathToDelete) =>
//             handleDeleteNode({
//               pathToDelete,
//               projectStructure: projectstructure,
//               fileContent,
//               setOpenTabs,
//               openTabs,
//               setActiveFile,
//               activeFile,
//               setProjectStructure,
//               setFileContent,
//               fileLanguage,
//               setFileLanguage,
//               getLanguageFromExtension,
//               syncToDB,
//             })
//           }
//           onRenameNode={(oldPath, newName) =>
//             handleRenameNode({
//               oldPath,
//               newName,
//               projectStructure: projectstructure,
//               setProjectStructure,
//               fileContent,
//               setFileContent,
//               setActiveFile,
//               activeFile,
//               setOpenTabs,
//               openTabs,
//               fileLanguage,
//               setFileLanguage,
//               getLanguageFromExtension,
//               syncToDB,
//             })
//           }
//         />
//       </motion.div>

//       <div className="flex-grow flex flex-col p-4">
//         {/* Pass props including the new handler */}
//         <EditorHeader
//           title={title}
//           setTitle={setTitle}
//           onSave={handleSave}
//           roomId={roomId}
//           navigate={navigate}
//           backendUrl={BACKEND_URL}
//           activeFile={activeFile}
//           codeContent={fileContent[activeFile] || ""}
//           onApplySuggestion={handleApplyAiSuggestion}
//         />

//         <EditorTabs
//           openTabs={openTabs}
//           activeFile={activeFile}
//           setActiveFile={setActiveFile}
//           setOpenTabs={setOpenTabs}
//         />

//         {provider && (
//           <EditorWorkspace
//             activeFile={activeFile}
//             fileContent={fileContent}
//             fileLanguage={fileLanguage}
//             provider={provider}
//             yDoc={yDoc}
//             setFileContent={setFileContent}
//             cursorRef={cursorRef} // 👈 CRITICAL: Pass Ref Down
//           />
//         )}

//         <EditorFooter activeUsers={activeUsers} />
//       </div>
//     </div>
//   );
// }

// export default EditorPage;
