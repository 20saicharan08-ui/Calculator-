import React, { useState, useCallback, useMemo } from 'react';
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

  /* ---------------- BASIC LOGIC ---------------- */

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
        }

        return {
          ...prev,
          display: '',
          parameterValues: updatedParams,
          currentParamIndex: prev.currentParamIndex + 1,
        };
      }

      if (prev.mode === CalculatorMode.BASIC) {
        try {
          const fullExpr = prev.expression + ' ' + (prev.display || '0');
          const sanitizedExpr = fullExpr.replace(/[^-+\/*.\d\s]/g, '');
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

  /* ---------------- FORMULA FLOW ---------------- */

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

  /* ---------------- SECURE BACKEND EXPLAIN ---------------- */

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaName: state.activeFormula.name,
          result: state.display,
          parameters: state.activeFormula.parameters.map((p, i) => ({
            name: p,
            value: state.parameterValues[i]
          }))
        })
      });

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();

      setState(p => ({
        ...p,
        explanation: data.explanation,
        isExplaining: false
      }));

    } catch {
      setState(p => ({
        ...p,
        explanation: "ERROR: Failed to generate explanation.",
        isExplaining: false
      }));
    }
  };

  const currentCategory = CATEGORIES[state.currentCategoryIndex];
  const filteredFormulas = useMemo(
    () => FORMULAS.filter(f => f.category === currentCategory),
    [currentCategory]
  );

  /* ---------------- RENDER ---------------- */

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-center sm:p-4 md:p-8">
      <div className="w-full h-full max-w-xl mx-auto bg-zinc-950 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-zinc-900">

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

          {state.mode === CalculatorMode.BASIC ? (

            /* BASIC MODE */
            <div className="flex-1 grid grid-cols-4 grid-rows-5 p-4">
              <CalcButton label="AC" onClick={reset} />
              <CalcButton label="fx" onClick={toggleMode} />
              <CalcButton label="⌫" onClick={() => setState(p => ({ ...p, display: p.display.slice(0, -1) }))} />
              <CalcButton label="÷" onClick={() => handleOperator('/')} />

              <CalcButton label="7" onClick={() => handleDigit('7')} />
              <CalcButton label="8" onClick={() => handleDigit('8')} />
              <CalcButton label="9" onClick={() => handleDigit('9')} />
              <CalcButton label="×" onClick={() => handleOperator('*')} />

              <CalcButton label="4" onClick={() => handleDigit('4')} />
              <CalcButton label="5" onClick={() => handleDigit('5')} />
              <CalcButton label="6" onClick={() => handleDigit('6')} />
              <CalcButton label="-" onClick={() => handleOperator('-')} />

              <CalcButton label="1" onClick={() => handleDigit('1')} />
              <CalcButton label="2" onClick={() => handleDigit('2')} />
              <CalcButton label="3" onClick={() => handleDigit('3')} />
              <CalcButton label="+" onClick={() => handleOperator('+')} />

              <CalcButton label="0" onClick={() => handleDigit('0')} />
              <CalcButton label="." onClick={() => handleDigit('.')} />
              <CalcButton label="=" onClick={handleEqual} />
            </div>

          ) : (

            /* ADVANCED MODE */
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {state.formulaStep === 'CATEGORY' && (
                CATEGORIES.map((cat, i) => (
                  <CalcButton key={cat} label={cat} onClick={() => selectCategory(i)} />
                ))
              )}

              {state.formulaStep === 'FORMULA' && (
                filteredFormulas.map(f => (
                  <CalcButton key={f.id} label={f.name} onClick={() => selectFormula(f)} />
                ))
              )}

              {state.formulaStep === 'INPUT' && (
                <div className="grid grid-cols-4 gap-3">
                  <CalcButton label="BACK" onClick={() => setState(p => ({ ...p, formulaStep: 'FORMULA' }))} />
                  <CalcButton label="C" onClick={() => setState(p => ({ ...p, display: '' }))} />
                  <CalcButton label="⌫" onClick={() => setState(p => ({ ...p, display: p.display.slice(0, -1) }))} />
                  <CalcButton label="NEXT" onClick={handleEqual} />

                  {[...'7894561230'].map(n => (
                    <CalcButton key={n} label={n} onClick={() => handleDigit(n)} />
                  ))}
                </div>
              )}

              {state.formulaStep === 'RESULT' && (
                <>
                  <div className="text-emerald-400 text-4xl font-mono text-center">
                    {state.display}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CalcButton label="Subjects" onClick={reset} />
                    <CalcButton label="Explain" onClick={getExplanation} />
                  </div>

                  {state.explanation && (
                    <pre className="text-sm text-zinc-300 whitespace-pre-wrap">
                      {state.explanation}
                    </pre>
                  )}
                </>
              )}

            </div>

          )}

        </div>
      </div>
    </div>
  );
};

export default App;