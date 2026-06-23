import React from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { formatDuration } from "../../utils/helpers";

export const TopNav = () => {
  const {
    activeMode,
    setActiveMode,
    currentAgent,
    setCurrentAgent,
    currentEmployee,
    setCurrentEmployee,
    currentAdmin,
    setCurrentAdmin,
    isAdminLogged,
    setIsAdminLogged,
    shiftStatus,
    shiftDuration,
    endShift,
  } = useGlobalContext();

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/10 z-[60] flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#FFD100] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,209,0,0.4)]">
          <span className="text-black font-black text-xl tracking-tighter">
            M
          </span>
        </div>
        <span className="text-white font-black text-xl tracking-tight hidden sm:block">
          MILES <span className="text-[#FFD100]">OS</span>
        </span>
      </div>

      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative overflow-x-auto max-w-[60%] sm:max-w-none">
        {["customer", "agent", "employee", "admin", "driver"].map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`relative px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors z-10 ${
              activeMode === mode
                ? "text-black"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {activeMode === mode && (
              <motion.div
                layoutId="navTab"
                className="absolute inset-0 bg-[#FFD100] rounded-lg shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            {mode}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {(activeMode === "agent" && currentAgent) ||
        (activeMode === "employee" && currentEmployee) ||
        (activeMode === "admin" && isAdminLogged) ||
        (activeMode === "driver" && currentEmployee) ? (
          <>
            {shiftStatus !== "offline" &&
              (activeMode === "agent" ||
                activeMode === "employee" ||
                activeMode === "driver") && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
                  <span className="hidden sm:block text-[11px] font-bold text-white uppercase tracking-widest">
                    Online
                  </span>
                  <span className="text-xs font-mono text-zinc-400 ml-1">
                    {formatDuration(shiftDuration)}
                  </span>
                </div>
              )}
            <button
              onClick={() => {
                endShift(currentAgent, currentEmployee);
                if (activeMode === "agent") setCurrentAgent(null);
                if (activeMode === "employee" || activeMode === "driver")
                  setCurrentEmployee(null);
                if (activeMode === "admin") {
                  setIsAdminLogged(false);
                  setCurrentAdmin(null);
                }
              }}
              className="p-2 sm:px-4 sm:py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center gap-2 group active:scale-95"
            >
              <LogOut className="w-5 h-5 sm:w-4 sm:h-4 group-hover:animate-pulse" />
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
                Log Out
              </span>
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};
