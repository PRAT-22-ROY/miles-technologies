import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, User, ChevronRight, ChevronLeft } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";
import { TiltCard } from "../../components/layout/TiltCard";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";
import { THEME } from "../../constants";

export const AdminLogin = () => {
  const { setIsAdminLogged, setCurrentAdmin, db } = useGlobalContext();
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setCurrentAdmin(selectedAdmin);
      setIsAdminLogged(true);
    } else {
      setError("Invalid master key.");
    }
  };

  if (!selectedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
        <Floating3DBackground />
        <TiltCard
          className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10 border-purple-500/20`}
        >
          <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/10">
            <ShieldAlert className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Masterpower
          </h2>
          <p className="text-zinc-400 text-sm mb-10 font-bold uppercase tracking-widest">
            Select Admin Profile
          </p>

          <div className="space-y-4">
            {db.adminUsers.map((admin: any, i: number) => (
              <motion.button
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full p-5 flex items-center justify-between bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/50 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-black border border-purple-500/20 rounded-xl flex items-center justify-center font-black text-purple-500 text-xl">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg flex items-center gap-2">
                      {admin.name}{" "}
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                        {admin.tags[0]}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                      {admin.role}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-purple-500 transition-colors group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>
        </TiltCard>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] px-4 relative overflow-hidden">
      <Floating3DBackground />
      <TiltCard
        className={`${THEME.panel} p-10 rounded-[2.5rem] w-full max-w-md text-center z-10 border-purple-500/20`}
      >
        <button
          onClick={() => setSelectedAdmin(null)}
          className="absolute top-6 left-6 text-zinc-500 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/10">
          <User className="w-12 h-12 text-purple-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
          {selectedAdmin.name}
        </h2>
        <p className="text-zinc-400 text-xs mb-8 font-bold uppercase tracking-widest">
          {selectedAdmin.role}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Master Key (admin)"
            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-white focus:outline-none focus:border-purple-500 transition-all font-medium tracking-widest"
          />
          {error && (
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full !bg-purple-600 hover:!bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border-0"
          >
            Authenticate Masterpower
          </Button>
        </form>
      </TiltCard>
    </div>
  );
};
