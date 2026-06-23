import React from "react";
import { motion } from "framer-motion";
import { Headset, ChevronRight } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { TiltCard } from "../../components/layout/TiltCard";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";
import { THEME } from "../../constants";

export const AgentLogin = () => {
  const { setCurrentAgent, db } = useGlobalContext();
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard
        className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10`}
      >
        <div className="w-24 h-24 bg-[#FFD100]/10 border border-[#FFD100]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#FFD100]/10">
          <Headset className="w-12 h-12 text-[#FFD100]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Agent Portal
        </h2>
        <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">
          Internal Access
        </p>
        <div className="space-y-4">
          {db.agents.map((agent: any, i: number) => (
            <motion.button
              key={agent.id}
              onClick={() => setCurrentAgent(agent)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#FFD100]/50 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center font-black text-[#FFD100] text-xl">
                  {agent.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">
                    {agent.name}
                  </div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    {agent.role}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-[#FFD100] transition-colors group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </TiltCard>
    </div>
  );
};
