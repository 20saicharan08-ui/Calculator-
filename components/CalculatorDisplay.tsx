
import React from 'react';
import { CalculatorMode, Formula, Category, FormulaStep } from '../types';

interface DisplayProps {
  value: string;
  expression: string;
  mode: CalculatorMode;
  activeFormula: Formula | null;
  paramIndex: number;
  currentCategory: Category;
  step: FormulaStep;
}

export const CalculatorDisplay: React.FC<DisplayProps> = ({ 
  value, 
  expression, 
  mode, 
  activeFormula, 
  paramIndex,
  currentCategory,
  step
}) => {
  const isFormulaMode = mode === CalculatorMode.FORMULA;
  const currentParam = activeFormula ? activeFormula.parameters[paramIndex] : null;

  const getStatusText = () => {
    if (!isFormulaMode) return expression || "Standard Calculator";
    if (step === 'CATEGORY') return "Select Subject";
    if (step === 'FORMULA') return currentCategory.toUpperCase();
    if (step === 'INPUT') return `${activeFormula?.name.toUpperCase()} > ${currentParam}`;
    if (step === 'RESULT') return "Solution";
    return "";
  };

  return (
    <div className="bg-zinc-950 p-6 sm:p-10 flex flex-col justify-end items-end min-h-[140px] sm:min-h-[180px] select-none shrink-0">
      <div className="text-emerald-500/40 text-[9px] sm:text-[11px] font-mono mb-2 text-right w-full font-bold tracking-[0.4em] uppercase">
        {getStatusText()}
      </div>
      <div className="text-zinc-100 text-4xl sm:text-6xl font-light font-mono truncate w-full text-right leading-none tracking-tighter">
        {value || '0'}
      </div>
    </div>
  );
};
