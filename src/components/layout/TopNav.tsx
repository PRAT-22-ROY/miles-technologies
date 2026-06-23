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
    <nav className="fixed top-0 left-0 w-full h-16 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/10 z-[60] flex items-center px-4 md:px-8">
      {/* LEFT: Logo (Fixed Width) */}
      <div className="w-1/4 flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 bg-[#FFD100] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,209,0,0.4)] shrink-0">
          <span className="text-black font-black text-xl tracking-tighter">
            M
          </span>
        </div>
        <span className="text-white font-black text-xl tracking-tight hidden lg:block">
          MILES <span className="text-[#FFD100]">OS</span>
        </span>
      </div>

      {/* CENTER: Segmented Control (Allows horizontal scroll on very small screens, centered) */}
      <div className="w-2/4 flex justify-center shrink-0">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative overflow-x-auto scrollbar-hide max-w-full">
          {["customer", "agent", "employee", "admin", "driver"].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`relative px-3 py-2 w-16 sm:w-20 lg:w-24 h-8 text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors z-10 shrink-0 ${
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
              <span className="truncate block w-full">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Actions (Fixed Width) */}
      <div className="w-1/4 flex justify-end items-center gap-2 sm:gap-3 shrink-0">
        {(activeMode === "agent" && currentAgent) ||
        (activeMode === "employee" && currentEmployee) ||
        (activeMode === "admin" && isAdminLogged) ||
        (activeMode === "driver" && currentEmployee) ? (
          <>
            {shiftStatus !== "offline" &&
              (activeMode === "agent" ||
                activeMode === "employee" ||
                activeMode === "driver") && (
                <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl h-10 w-28 justify-center shrink-0 overflow-hidden">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse shrink-0"></span>
                  <span className="hidden lg:block text-[11px] font-bold text-white uppercase tracking-widest shrink-0">
                    Online
                  </span>
                  <span className="text-xs font-mono text-zinc-400 ml-1 shrink-0 truncate">
                    {formatDuration(shiftDuration)}
                  </span>
                </div>
              )}
            {/* Mobile timer dot */}
            {shiftStatus !== "offline" &&
              (activeMode === "agent" ||
                activeMode === "employee" ||
                activeMode === "driver") && (
                <div className="md:hidden flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-xl shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse shrink-0"></span>
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
              className="px-3 sm:px-4 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-95 w-10 md:w-28 shrink-0 overflow-hidden"
            >
              <LogOut className="w-4 h-4 group-hover:animate-pulse shrink-0" />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest shrink-0">
                Log Out
              </span>
            </button>
          </>
        ) : (
          <div className="h-10 w-10 md:w-28 shrink-0" /> /* Placeholder to maintain layout stability */
        )}
      </div>

      {/* Scrollbar hide styles via injected style tag since tailwind plugins might not be present */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `,
        }}
      />
    </nav>
  );
};
