import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useGlobalContext } from "../../hooks/useGlobalContext";
import { Button } from "../../components/ui/Button";
import { Floating3DBackground } from "../../components/layout/Floating3DBackground";

export const GateShift = ({ userType }: { userType: "agent" | "employee" }) => {
  const { currentAgent, currentEmployee, startShift } = useGlobalContext();
  const name =
    userType === "agent" ? currentAgent?.name : currentEmployee?.name;
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#050505] relative overflow-hidden">
      <Floating3DBackground />
      <div className="z-10 text-center max-w-lg px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 backdrop-blur-xl"
        >
          <Clock
            className={`w-14 h-14 ${userType === "agent" ? "text-[#FFD100]" : "text-blue-500"}`}
          />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black text-white mb-4"
        >
          Welcome back, {name}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400 text-lg mb-12 font-medium"
        >
          You must clock in to access the system.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={startShift}
            className={`px-12 py-5 text-lg rounded-[2rem] w-full sm:w-auto ${userType === "employee" ? "!bg-blue-600 hover:!bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border-0" : ""}`}
          >
            Start Shift
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
