
import { Formula, Category } from './types';

export const CATEGORIES: Category[] = ['Math', 'Physics', 'Chemistry', 'Finance', 'Conversion'];

export const FORMULAS: Formula[] = [
  // MATH (High School Algebra, Trig, Geometry)
  { id: 'quad', name: 'Quadratic', symbol: 'ax²', category: 'Math', parameters: ['a', 'b', 'c'] },
  { id: 'trig_sin', name: 'Sin(θ)', symbol: 'sin', category: 'Math', parameters: ['Opp', 'Hyp'] },
  { id: 'trig_cos', name: 'Cos(θ)', symbol: 'cos', category: 'Math', parameters: ['Adj', 'Hyp'] },
  { id: 'trig_tan', name: 'Tan(θ)', symbol: 'tan', category: 'Math', parameters: ['Opp', 'Adj'] },
  { id: 'log', name: 'Logarithm', symbol: 'log', category: 'Math', parameters: ['Value', 'Base'] },
  { id: 'dist', name: 'Distance', symbol: 'd(P,Q)', category: 'Math', parameters: ['x1', 'y1', 'x2', 'y2'] },
  { id: 'slope', name: 'Slope', symbol: 'm=', category: 'Math', parameters: ['y2', 'y1', 'x2', 'x1'] },
  { id: 'hcf', name: 'HCF/GCD', symbol: 'HCF', category: 'Math', parameters: ['A', 'B'] },
  { id: 'lcm', name: 'LCM', symbol: 'LCM', category: 'Math', parameters: ['A', 'B'] },
  { id: 'arith_sum', name: 'AP Sum', symbol: 'ΣAP', category: 'Math', parameters: ['a', 'n', 'd'] },

  // PHYSICS (8th-12th Mechanics, Electricity, Waves)
  { id: 'force', name: 'Force', symbol: 'F=ma', category: 'Physics', parameters: ['Mass', 'Acc'] },
  { id: 'ohm', name: 'Ohm Law', symbol: 'V=IR', category: 'Physics', parameters: ['I', 'R'] },
  { id: 'kin1', name: 'Final Vel', symbol: 'v=u+at', category: 'Physics', parameters: ['u', 'a', 't'] },
  { id: 'work', name: 'Work', symbol: 'W=Fd', category: 'Physics', parameters: ['F', 'dist'] },
  { id: 'power', name: 'Power', symbol: 'P=W/t', category: 'Physics', parameters: ['Work', 'Time'] },
  { id: 'grav', name: 'Gravity', symbol: 'F=mg', category: 'Physics', parameters: ['Mass'] },
  { id: 'energy_k', name: 'Kinetic E', symbol: 'KE', category: 'Physics', parameters: ['m', 'v'] },
  { id: 'energy_p', name: 'Potent. E', symbol: 'PE', category: 'Physics', parameters: ['m', 'h'] },

  // CHEMISTRY (Stoichiometry, Gas Laws, Solutions)
  { id: 'molar', name: 'Molarity', symbol: 'M', category: 'Chemistry', parameters: ['Mols', 'Liters'] },
  { id: 'gas_p', name: 'Gas P', symbol: 'P=nRT/V', category: 'Chemistry', parameters: ['n', 'T', 'V'] },
  { id: 'mass', name: 'Density', symbol: 'ρ=m/v', category: 'Chemistry', parameters: ['Mass', 'Vol'] },
  { id: 'ph', name: 'pH Calc', symbol: 'pH', category: 'Chemistry', parameters: ['[H+]'] },
  { id: 'dilution', name: 'Dilution', symbol: 'M1V1=M2V2', category: 'Chemistry', parameters: ['M1', 'V1', 'M2'] }, // Find V2

  // FINANCE (Essential & Advanced)
  { id: 'si', name: 'Simple Int', symbol: 'S.I', category: 'Finance', parameters: ['P', 'R', 'T'] },
  { id: 'ci', name: 'Comp. Int', symbol: 'C.I', category: 'Finance', parameters: ['P', 'R', 'T', 'n'] },
  { id: 'emi', name: 'Loan EMI', symbol: 'EMI', category: 'Finance', parameters: ['Principal', 'Rate', 'Months'] },
  { id: 'tax', name: 'Sales Tax', symbol: 'Tax', category: 'Finance', parameters: ['Amount', 'Rate%'] },
  { id: 'margin', name: 'Margin', symbol: 'GP%', category: 'Finance', parameters: ['Cost', 'Price'] },

  // CONVERSIONS
  { id: 'c2f', name: 'Temp C→F', symbol: '°C→°F', category: 'Conversion', parameters: ['°C'] },
  { id: 'f2c', name: 'Temp F→C', symbol: '°F→°C', category: 'Conversion', parameters: ['°F'] },
  { id: 'km2m', name: 'Dist Km→Mi', symbol: 'Km→Mi', category: 'Conversion', parameters: ['Km'] },
  { id: 'kg2lb', name: 'Mass Kg→Lb', symbol: 'Kg→Lb', category: 'Conversion', parameters: ['Kg'] },
  { id: 'm2f', name: 'Len M→Ft', symbol: 'M→Ft', category: 'Conversion', parameters: ['Meters'] },
];
