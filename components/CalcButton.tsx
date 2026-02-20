
import React from 'react';

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'formula';
}

export const CalcButton: React.FC<CalcButtonProps> = ({ 
  label, 
  onClick, 
  className = '', 
  variant = 'primary' 
}) => {
  const baseStyles = "flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-75 active:scale-95 select-none h-full w-full rounded-2xl";
  
  const variantStyles = {
    primary: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
    secondary: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
    accent: "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/10",
    formula: "bg-zinc-900 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10"
  };

  return (
    <div className={`w-full h-full p-1 ${className}`}>
      <button 
        onClick={onClick}
        className={`${baseStyles} ${variantStyles[variant]}`}
      >
        {label}
      </button>
    </div>
  );
};
