import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold rounded-2xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary:
      "bg-[#FFD100] text-black shadow-[0_0_20px_rgba(255,209,0,0.3)] hover:shadow-[0_0_30px_rgba(255,209,0,0.5)] hover:bg-[#ffe040]",
    secondary:
      "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
    danger:
      "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
