import React from "react";
import { motion } from "framer-motion";
import { UserPlus, ChevronRight } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { TiltCard } from "../../components/layout/TiltCard";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";
import { THEME } from "../../constants";

export const EmployeeLogin = () => {
  const { setCurrentEmployee, db } = useGlobalContext();
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard
        className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10`}
      >
        <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/10">
          <UserPlus className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Team Portal
        </h2>
        <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">
          Internal Access
        </p>

        <div className="space-y-4">
          {db.employees.map((emp: any, i: number) => (
            <motion.button
              key={emp.id}
              onClick={() => setCurrentEmployee(emp)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center font-black text-blue-500 text-xl">
                  {emp.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">{emp.name}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    {emp.role}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </TiltCard>
    </div>
  );
};
