import React from "react";
import { motion } from "framer-motion";

export const Floating3DBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-[#FFD100] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.06]"
    />
    <motion.div
      animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
      className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-screen filter blur-[180px] opacity-[0.04]"
    />
  </div>
);
