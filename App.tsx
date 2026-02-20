
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { CalculatorMode, CalcState, Formula, FormulaStep } from './types';
import { FORMULAS, CATEGORIES } from './constants';
import { solveFormula } from './utils/math';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalcButton } from './components/CalcButton';
import { GoogleGenAI } from "@google/genai";

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
      display: prev.display.startsWith('-') ? prev.display.slice(1) : '-' + prev.display
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
      mode: prev.mode === CalculatorMode.BASIC ? CalculatorMode.FORMULA : CalculatorMode.BASIC,
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

  const getExplanation = async () => {
    if (!state.activeFormula || state.parameterValues.length === 0) return;
    
    setState(p => ({ ...p, isExplaining: true, explanation: "Initializing Analysis..." }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `System: You are an educational mathematical processor. 
      Analyze the following result: "${state.display}" for the formula "${state.activeFormula.name}".
      Provided Inputs: ${state.activeFormula.parameters.map((p, i) => `${p} = ${state.parameterValues[i]}`).join(', ')}

      STRICT OUTPUT REQUIREMENTS:
      1. Use ONLY plain ASCII characters. No LaTeX ($), No Unicode math symbols.
      2. Format:
         [NAME OF CALCULATION]
         
         1. PARAMETERS
         ${state.activeFormula.parameters.map((p, i) => `- ${p}: ${state.parameterValues[i]}`).join('\n')}
         
         2. STEP-BY-STEP DERIVATION
         [Provide logic here using plain text like sqrt(), ^2, *, /, etc.]
         
         3. FINAL VERIFICATION
         Result equals ${state.display}.
      
      Do not include any greeting or conversational filler.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      setState(p => ({ ...p, explanation: response.text, isExplaining: false }));
    } catch (error) {
      console.error(error);
      setState(p => ({ ...p, explanation: "ERROR: System failed to generate explanation.", isExplaining: false }));
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
          {state.mode === CalculatorMode.BASIC ? (
            <div className="flex-1 grid grid-cols-4 grid-rows-5 gap-0 p-2 sm:p-4">
              <button onClick={reset} className="p-1"><div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">AC</div></button>
              <button onClick={toggleMode} className="p-1"><div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">fx</div></button>
              <button onClick={() => setState(p => ({...p, display: p.display.slice(0, -1)}))} className="p-1"><div className="flex items-center justify-center text-lg sm:text-xl font-bold h-full w-full rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">⌫</div></button>
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
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-zinc-950">
              {state.formulaStep === 'CATEGORY' && (
                <div className="flex flex-col gap-3 p-4 sm:p-6">
                  <div className="text-zinc-600 text-[10px] font-black tracking-[0.3em] uppercase mb-4 px-2">Select Subject</div>
                  {CATEGORIES.map((cat, i) => (
                    <button key={cat} onClick={() => selectCategory(i)} className="flex items-center justify-between px-8 py-6 bg-zinc-900/50 border border-zinc-900 rounded-3xl hover:bg-zinc-800 transition-all hover:border-emerald-500/30 group text-left">
                      <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">{cat}</span>
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 text-xs">→</div>
                    </button>
                  ))}
                  <CalcButton label="Standard" onClick={toggleMode} variant="secondary" className="mt-8 min-h-[60px]" />
                </div>
              )}

              {state.formulaStep === 'FORMULA' && (
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase">{currentCategory} Functions</span>
                    <button onClick={() => setState(p => ({...p, formulaStep: 'CATEGORY'}))} className="text-zinc-500 text-[10px] font-black uppercase hover:text-white transition-colors">Return</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredFormulas.map(f => (
                      <button key={f.id} onClick={() => selectFormula(f)} className="flex flex-col items-start p-6 bg-zinc-900/50 border border-zinc-900 rounded-3xl hover:border-emerald-500/50 transition-all text-left group">
                        <span className="text-zinc-500 text-[10px] font-black uppercase mb-2 group-hover:text-emerald-500 tracking-wider transition-colors">{f.name}</span>
                        <span className="text-zinc-100 font-mono text-lg">{f.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.formulaStep === 'INPUT' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                    <span className="text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase">{state.activeFormula?.name}</span>
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                       <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Entry: {state.activeFormula?.parameters[state.currentParamIndex]}</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-4 grid-rows-5 gap-0 p-2 sm:p-4">
                    <CalcButton label="C" onClick={() => setState(p => ({...p, display: ''}))} variant="secondary" />
                    <CalcButton label="BACK" onClick={() => setState(p => ({...p, formulaStep: 'FORMULA'}))} variant="secondary" />
                    <CalcButton label="⌫" onClick={() => setState(p => ({...p, display: p.display.slice(0, -1)}))} variant="secondary" />
                    <CalcButton label="√x" onClick={() => handleScientific('sqrt')} variant="accent" />

                    <CalcButton label="7" onClick={() => handleDigit('7')} />
                    <CalcButton label="8" onClick={() => handleDigit('8')} />
                    <CalcButton label="9" onClick={() => handleDigit('9')} />
                    <CalcButton label="x²" onClick={() => handleScientific('sq')} variant="accent" />
                    
                    <CalcButton label="4" onClick={() => handleDigit('4')} />
                    <CalcButton label="5" onClick={() => handleDigit('5')} />
                    <CalcButton label="6" onClick={() => handleDigit('6')} />
                    <CalcButton label="±" onClick={toggleSign} variant="accent" />
                    
                    <CalcButton label="1" onClick={() => handleDigit('1')} />
                    <CalcButton label="2" onClick={() => handleDigit('2')} />
                    <CalcButton label="3" onClick={() => handleDigit('3')} />
                    <CalcButton label="π" onClick={() => handleScientific('pi')} variant="accent" />
                    
                    <CalcButton label="0" onClick={() => handleDigit('0')} className="col-span-2" />
                    <CalcButton label="." onClick={() => handleDigit('.')} />
                    <CalcButton 
                      label={state.currentParamIndex === (state.activeFormula?.parameters.length ?? 0) - 1 ? "SOLVE" : "NEXT"} 
                      onClick={handleEqual} 
                      variant="accent" 
                    />
                  </div>
                </div>
              )}

              {state.formulaStep === 'RESULT' && (
                <div className="flex-1 flex flex-col gap-6 p-4 sm:p-6">
                  <div className="p-10 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-900 text-center flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Solution</div>
                    <div className="text-4xl sm:text-5xl font-mono text-emerald-400 break-all leading-relaxed">{state.display}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CalcButton label="Subjects" onClick={reset} variant="accent" className="min-h-[70px]" />
                    <CalcButton label="Explain" onClick={getExplanation} variant="formula" className="min-h-[70px]" />
                  </div>
                  
                  {state.explanation && (
                    <div className="flex-1 p-8 bg-zinc-900/20 rounded-[2.5rem] border border-zinc-900/50 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
                      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Processing Log
                      </div>
                      <pre className="text-zinc-300 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed opacity-90">
                        {state.explanation}
                      </pre>
                    </div>
                  )}
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
