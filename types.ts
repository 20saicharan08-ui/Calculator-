
export enum CalculatorMode {
  BASIC = 'BASIC',
  FORMULA = 'FORMULA'
}

export type Category = 'Math' | 'Physics' | 'Chemistry' | 'Finance' | 'Conversion';

export type FormulaStep = 'CATEGORY' | 'FORMULA' | 'INPUT' | 'RESULT';

export interface Formula {
  id: string;
  name: string;
  symbol: string;
  category: Category;
  parameters: string[];
}

export type CalcState = {
  display: string;
  expression: string;
  mode: CalculatorMode;
  formulaStep: FormulaStep;
  activeFormula: Formula | null;
  parameterValues: number[];
  currentParamIndex: number;
  resultShown: boolean;
  currentCategoryIndex: number;
  explanation: string | null;
  isExplaining: boolean;
};
