import React, { useState, useCallback, useMemo, useRef } from 'react';
import { CalculatorMode, CalcState, Formula } from './types';
import { FORMULAS, CATEGORIES } from './constants';
import { solveFormula } from './utils/math';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalcButton } from './components/CalcButton';

const App: React.FC = () => {
  const [state, setState] = useState<CalcState>({
    display: '',
    expression: '',
    mode: CalculatorMode.BASIC,
    formulaStep: 'CATEGORY',
    activeFormula: null,
    parameterValues: [],
    currentParamIndex: 0,
    resultShown: false,
    currentCategoryIndex: 0,
    explanation: null,
    isExplaining: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '',
      expression: '',
      formulaStep: 'CATEGORY',
      activeFormula: null,
      parameterValues: [],
      currentParamIndex: 0,
      resultShown: false,
      explanation: null,
      isExplaining: false,
    }));
  }, []);

  const handleDigit = useCallback((digit: string) => {
    setState(prev => {
      if (prev.resultShown) return { ...prev, display: digit, resultShown: false };
      if (digit === '.' && prev.display.includes('.')) return prev;
      return { ...prev, display: prev.display + digit };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: prev.display.startsWith('-')
        ? prev.display.slice(1)
        : '-' + prev.display
    }));
  }, []);

  const handleScientific = useCallback((op: 'sqrt' | 'sq' | 'pi') => {
    setState(prev => {
      let newVal = parseFloat(prev.display) || 0;
      if (op === 'sqrt') newVal = Math.sqrt(newVal);
      if (op === 'sq') newVal = Math.pow(newVal, 2);
      if (op === 'pi') return { ...prev, display: Math.PI.toString(), resultShown: false };
      return { ...prev, display: newVal.toString(), resultShown: false };
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    setState(prev => {
      if (prev.mode === CalculatorMode.FORMULA) return prev;
      const currentVal = prev.display || '0';
      return {
        ...prev,
        expression: prev.expression + ' ' + currentVal + ' ' + op,
        display: '',
        resultShown: false,
      };
    });
  }, []);

  const handleEqual = useCallback(() => {
    setState(prev => {
      if (prev.mode === CalculatorMode.FORMULA && prev.activeFormula) {
        const currentVal = parseFloat(prev.display) || 0;
        const updatedParams = [...prev.parameterValues, currentVal];

        if (updatedParams.length === prev.activeFormula.parameters.length) {
          const result = solveFormula(prev.activeFormula.id, updatedParams);
          return {
            ...prev,
            display: result,
            formulaStep: 'RESULT',
            parameterValues: updatedParams,
            resultShown: true
          };
        } else {
          return {
            ...prev,
            display: '',
            parameterValues: updatedParams,
            currentParamIndex: prev.currentParamIndex + 1,
          };
        }
      }

      if (prev.mode === CalculatorMode.BASIC) {
        try {
          const fullExpr = prev.expression + ' ' + (prev.display || '0');
          const sanitizedExpr = fullExpr.replace(/[^-+\/*.\d\s]/g, '');
          // eslint-disable-next-line no-eval
          const result = eval(sanitizedExpr);
          return {
            ...prev,
            display: result.toString(),
            expression: '',
            resultShown: true
          };
        } catch {
          return { ...prev, display: 'Error', expression: '' };
        }
      }

      return prev;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: prev.mode === CalculatorMode.BASIC
        ? CalculatorMode.FORMULA
        : CalculatorMode.BASIC,
      formulaStep: 'CATEGORY',
      activeFormula: null,
      parameterValues: [],
      currentParamIndex: 0,
      display: '',
      expression: '',
      resultShown: false,
      explanation: null,
    }));
  }, []);

  const selectCategory = (index: number) => {
    setState(prev => ({
      ...prev,
      currentCategoryIndex: index,
      formulaStep: 'FORMULA',
      display: '',
    }));
  };

  const selectFormula = (formula: Formula) => {
    setState(prev => ({
      ...prev,
      activeFormula: formula,
      formulaStep: 'INPUT',
      display: '',
      parameterValues: [],
      currentParamIndex: 0,
      resultShown: false
    }));
  };

  // ✅ SECURE BACKEND CALL
  const getExplanation = async () => {
    if (!state.activeFormula || state.parameterValues.length === 0) return;

    setState(p => ({
      ...p,
      isExplaining: true,
      explanation: "Generating explanation..."
    }));

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          formulaName: state.activeFormula.name,
          result: state.display,
          parameters: state.activeFormula.parameters.map((p, i) => ({
            name: p,
            value: state.parameterValues[i]
          }))
        })
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      setState(p => ({
        ...p,
        explanation: data.explanation,
        isExplaining: false
      }));

    } catch (error) {
      console.error(error);
      setState(p => ({
        ...p,
        explanation: "ERROR: Failed to generate explanation.",
        isExplaining: false
      }));
    }
  };

  const currentCategory = CATEGORIES[state.currentCategoryIndex];

  const filteredFormulas = useMemo(() =>
    FORMULAS.filter(f => f.category === currentCategory),
    [currentCategory]
  );

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-center sm:p-4 md:p-8">
      <div className="w-full h-full max-w-xl mx-auto bg-zinc-950 sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-zinc-900 shadow-emerald-950/20">

        <CalculatorDisplay
          value={state.display}
          expression={state.expression}
          mode={state.mode}
          activeFormula={state.activeFormula}
          paramIndex={state.currentParamIndex}
          currentCategory={currentCategory}
          step={state.formulaStep}
        />

        <div className="flex-1 flex flex-col min-h-0 relative">

          {/* BASIC MODE */}
          {state.mode === CalculatorMode.BASIC && (
            <div className="flex-1 grid grid-cols-4 grid-rows-5 gap-0 p-2 sm:p-4">
              <button onClick={reset} className="p-1">
                <div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
                  AC
                </div>
              </button>

              <button onClick={toggleMode} className="p-1">
                <div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
                  fx
                </div>
              </button>

              <button onClick={() => setState(p => ({ ...p, display: p.display.slice(0, -1) }))} className="p-1">
                <div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
                  ⌫
                </div>
              </button>

              <CalcButton label="÷" onClick={() => handleOperator('/')} variant="accent" />
              <CalcButton label="7" onClick={() => handleDigit('7')} />
              <CalcButton label="8" onClick={() => handleDigit('8')} />
              <CalcButton label="9" onClick={() => handleDigit('9')} />
              <CalcButton label="×" onClick={() => handleOperator('*')} variant="accent" />
              <CalcButton label="4" onClick={() => handleDigit('4')} />
              <CalcButton label="5" onClick={() => handleDigit('5')} />
              <CalcButton label="6" onClick={() => handleDigit('6')} />
              <CalcButton label="-" onClick={() => handleOperator('-')} variant="accent" />
              <CalcButton label="1" onClick={() => handleDigit('1')} />
              <CalcButton label="2" onClick={() => handleDigit('2')} />
              <CalcButton label="3" onClick={() => handleDigit('3')} />
              <CalcButton label="+" onClick={() => handleOperator('+')} variant="accent" />
              <CalcButton label="0" onClick={() => handleDigit('0')} className="col-span-2" />
              <CalcButton label="." onClick={() => handleDigit('.')} />
              <CalcButton label="=" onClick={handleEqual} variant="accent" />
            </div>
          )}

          {/* RESULT MODE */}
          {state.formulaStep === 'RESULT' && (
            <div className="flex-1 flex flex-col gap-6 p-4 sm:p-6">
              <div className="p-10 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-900 text-center">
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
                  Solution
                </div>
                <div className="text-4xl sm:text-5xl font-mono text-emerald-400 break-all leading-relaxed">
                  {state.display}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CalcButton label="Subjects" onClick={reset} variant="accent" className="min-h-[70px]" />
                <CalcButton label="Explain" onClick={getExplanation} variant="formula" className="min-h-[70px]" />
              </div>

              {state.explanation && (
                <div className="flex-1 p-8 bg-zinc-900/20 rounded-[2.5rem] border border-zinc-900/50 overflow-y-auto">
                  <pre className="text-zinc-300 text-sm font-mono whitespace-pre-wrap">
                    {state.explanation}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;