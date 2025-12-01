import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, Download, Share2, 
  Moon, Sun, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, ArrowRight, Save, History, Copy, Twitter, Linkedin, MessageCircle,
  BookOpen, X, Target, Zap, Shield, BarChart3
} from 'lucide-react';
import { SliderControl, SelectControl } from './components/Controls';
import { ResultCharts } from './components/Visualizations';
import { calculateSIP, formatCurrency, downloadCSV } from './utils';
import { SIPInputs, Currency, CalculationResult, ChartDataPoint } from './types';

const App: React.FC = () => {
  // --- State ---
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [darkMode, setDarkMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [history, setHistory] = useState<{date: string, result: string, value: number}[]>([]);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const defaultInputs: SIPInputs = {
    monthlyInvestment: 500,
    expectedReturn: 12,
    timePeriod: 10,
    stepUpPercentage: 0,
    inflationRate: 6,
    initialLumpsum: 0,
    expenseRatio: 0,
    taxRate: 0,
    targetAmount: 0
  };

  const [inputs, setInputs] = useState<SIPInputs>(defaultInputs);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load history from local storage on mount
  useEffect(() => {
      const saved = localStorage.getItem('sip_history');
      if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to local storage
  useEffect(() => {
      localStorage.setItem('sip_history', JSON.stringify(history));
  }, [history]);

  // Initial calculation
  useEffect(() => {
    const res = calculateSIP(inputs);
    setResult(res);
  }, [inputs]);

  // --- Handlers ---
  const handleCalculate = () => {
    setIsCalculating(true);
    setProgress(0);
    setShowResults(false);

    // Simulation of processing
    const duration = 1200; 
    const interval = 40;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    setTimeout(() => {
      const res = calculateSIP(inputs);
      setResult(res);
      setIsCalculating(false);
      setShowResults(true);
      
      // Add to history
      const newEntry = {
          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          result: `Inv: ${res.totalInvested} | Val: ${res.totalValue}`,
          value: res.totalValue
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, duration);
  };

  const loadFromParams = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('monthlyInvestment')) {
        const newInputs = { ...defaultInputs };
        Object.keys(defaultInputs).forEach(key => {
            const val = params.get(key);
            if (val) newInputs[key as keyof SIPInputs] = Number(val);
        });
        setInputs(newInputs);
        setShowResults(true);
    }
  };

  useEffect(() => {
    loadFromParams();
  }, []);

  const resetInputs = () => {
      setInputs(defaultInputs);
      setShowResults(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyPreset = (type: 'conservative' | 'moderate' | 'aggressive') => {
      const rates = { conservative: 8, moderate: 12, aggressive: 15 };
      setInputs(prev => ({...prev, expectedReturn: rates[type]}));
  };

  const copyTable = () => {
      if (!result) return;
      const text = result.breakdown.map(r => `${r.year}\t${r.investedAmount}\t${r.interestEarned}\t${r.totalValue}`).join('\n');
      navigator.clipboard.writeText(`Year\tInvested\tInterest\tTotal\n${text}`);
      alert('Table data copied!');
  };

  // --- Render Helpers ---
  const growthData: ChartDataPoint[] = result ? result.breakdown.map(b => ({
    year: `Y${b.year}`,
    Invested: b.investedAmount,
    Wealth: b.totalValue
  })) : [];

  return (
    <div className="min-h-screen pb-10 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2.5 rounded-xl text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">SIP Calculator</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Smart Wealth Planner</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowDocs(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                 <BookOpen size={18} />
                 <span>Documentation</span>
             </button>

             <SelectControl 
                value={currency} 
                options={Object.values(Currency).map(c => ({ value: c, label: c }))}
                onChange={(v) => setCurrency(v as Currency)}
             />
             <button 
               onClick={() => setDarkMode(!darkMode)}
               className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
             >
                 <History size={18} />
                 <span className="hidden sm:inline">History</span>
                 {history.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
          </div>
        </div>
      </header>
      
      {/* Documentation Modal */}
      {showDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDocs(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <BookOpen className="text-primary-600" /> User Guide
               </h2>
               <button onClick={() => setShowDocs(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X size={24} className="text-slate-500" />
               </button>
            </div>
            <div className="p-6 space-y-8">
               
               <section>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                   <Target className="text-emerald-500" size={20}/>
                   What is this tool?
                 </h3>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                   This advanced <strong>SIP (Systematic Investment Plan) Calculator</strong> helps you plan your financial future by simulating investment growth over time. Unlike basic calculators, it considers real-world factors like inflation, taxes, fees, and increasing investments (Step-up).
                 </p>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                   <Zap className="text-amber-500" size={20}/>
                   Key Features
                 </h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">📈 Step-up SIP</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400">Model annual increases in your monthly investment as your income grows.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">💰 Inflation Adjustment</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400">See the "Real Value" of your wealth in today's purchasing power.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">🏛️ Tax & Fees</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400">Deduct Expense Ratios and Capital Gains Tax to see net-in-hand returns.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                       <h4 className="font-bold text-slate-900 dark:text-white mb-1">🎯 Goal Tracking</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400">Set a target amount and see a progress bar indicating how close you are.</p>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                   <BarChart3 className="text-primary-500" size={20}/>
                   How to Use
                 </h3>
                 <ol className="space-y-3 list-decimal list-inside text-slate-600 dark:text-slate-300">
                    <li className="pl-2"><span className="font-semibold">Configure Inputs:</span> Enter your monthly investment amount and expected duration.</li>
                    <li className="pl-2"><span className="font-semibold">Set Return Rate:</span> Use the slider or presets (Conservative/Moderate/Aggressive) to estimate growth.</li>
                    <li className="pl-2"><span className="font-semibold">Advanced Settings:</span> Click "Advanced Settings" to add step-up %, lump sum, or tax details.</li>
                    <li className="pl-2"><span className="font-semibold">Analyze:</span> Click "Calculate & Analyze" to generate charts and detailed metrics.</li>
                    <li className="pl-2"><span className="font-semibold">Review:</span> Check the charts, "Cost of Delay", and "Wealth Milestones".</li>
                 </ol>
               </section>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
               <button onClick={() => setShowDocs(false)} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors">
                 Got it, Let's Plan!
               </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
              <div className="w-80 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                      <h3 className="font-bold text-lg dark:text-white">Recent Calculations</h3>
                      <button onClick={() => setShowHistory(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                           <History size={32} className="opacity-20"/>
                           <p className="text-sm">No history yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-900 transition-colors cursor-default">
                                    <div className="flex justify-between items-start mb-1">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.date.split(' ')[0]}</p>
                                      <p className="text-[10px] text-slate-400">{item.date.split(' ')[1] + ' ' + item.date.split(' ')[2]}</p>
                                    </div>
                                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(item.value, currency)}</p>
                                    <p className="text-xs text-slate-500 truncate">{item.result}</p>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>

                  {history.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                       <button onClick={() => setHistory([])} className="w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium">
                          Clear All History
                       </button>
                    </div>
                  )}
              </div>
          </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <DollarSign className="text-primary-500" size={20} />
                    Configuration
                  </h2>
                  <button onClick={resetInputs} className="text-xs font-medium text-slate-400 hover:text-primary-500 flex items-center gap-1 transition-colors">
                      <RefreshCw size={12}/> Reset
                  </button>
              </div>
              
              <SliderControl 
                label="Monthly Investment" 
                value={inputs.monthlyInvestment} 
                min={100} max={100000} step={100} 
                unit={currency === Currency.INR ? '₹' : '$'}
                onChange={(v) => setInputs(prev => ({...prev, monthlyInvestment: v}))}
              />
              
              <div className="mb-6">
                 <SliderControl 
                    label="Expected Return Rate (p.a)" 
                    value={inputs.expectedReturn} 
                    min={1} max={30} step={0.1} unit="%"
                    tooltip="Annual return rate expected from your mutual fund or investment."
                    onChange={(v) => setInputs(prev => ({...prev, expectedReturn: v}))}
                 />
                 {/* Strategy Presets */}
                 <div className="flex gap-2 justify-center mt-[-15px]">
                     {['Conservative', 'Moderate', 'Aggressive'].map((type) => (
                         <button 
                            key={type}
                            onClick={() => applyPreset(type.toLowerCase() as any)}
                            className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                         >
                             {type}
                         </button>
                     ))}
                 </div>
              </div>

              <SliderControl 
                label="Time Period" 
                value={inputs.timePeriod} 
                min={1} max={40} step={1} unit="Yr"
                onChange={(v) => setInputs(prev => ({...prev, timePeriod: v}))}
              />

              {/* Advanced Toggle */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors w-full justify-between bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg"
                >
                  <span>Advanced Settings</span>
                  {showAdvanced ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
                
                {showAdvanced && (
                   <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <SliderControl 
                        label="Step-up (Yearly %)" 
                        value={inputs.stepUpPercentage} 
                        min={0} max={50} step={1} unit="%"
                        tooltip="Increase your SIP amount annually to match income growth."
                        onChange={(v) => setInputs(prev => ({...prev, stepUpPercentage: v}))}
                      />
                      <SliderControl 
                        label="Initial Lumpsum" 
                        value={inputs.initialLumpsum} 
                        min={0} max={1000000} step={1000} 
                        unit={currency === Currency.INR ? '₹' : '$'}
                        onChange={(v) => setInputs(prev => ({...prev, initialLumpsum: v}))}
                      />
                       <SliderControl 
                        label="Expense Ratio" 
                        value={inputs.expenseRatio} 
                        min={0} max={5} step={0.1} unit="%"
                        tooltip="Fund management fees that reduce your returns."
                        onChange={(v) => setInputs(prev => ({...prev, expenseRatio: v}))}
                      />
                      <SliderControl 
                        label="Tax Rate (LTCG)" 
                        value={inputs.taxRate} 
                        min={0} max={30} step={1} unit="%"
                        tooltip="Tax on your gains at withdrawal."
                        onChange={(v) => setInputs(prev => ({...prev, taxRate: v}))}
                      />
                      <SliderControl 
                        label="Target Goal Amount" 
                        value={inputs.targetAmount} 
                        min={0} max={50000000} step={50000} 
                        unit={currency === Currency.INR ? '₹' : '$'}
                        tooltip="Set a financial goal to see completion progress."
                        onChange={(v) => setInputs(prev => ({...prev, targetAmount: v}))}
                      />
                   </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              {isCalculating ? 'Analyzing...' : 'Calculate & Analyze'}
              {!isCalculating && <TrendingUp size={20} className="group-hover:scale-110 transition-transform" />}
            </button>
          </div>

          {/* RIGHT COLUMN: Results - Re-architected for No Overlap */}
          <div className="lg:col-span-8 min-h-[500px]">
            
            {isCalculating ? (
              /* Loading State */
              <div className="h-full w-full flex flex-col items-center justify-center min-h-[500px] bg-white dark:bg-slate-800 rounded-3xl">
                 <div className="w-64">
                    <div className="flex justify-between mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <span>Analyzing Market Scenarios</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-100 ease-out rounded-full"
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                    <p className="mt-4 text-center text-slate-500 text-sm animate-pulse">Calculating compound interest & taxes...</p>
                 </div>
              </div>
            ) : showResults && result ? (
              /* Results State */
              <div ref={resultsRef} className="animate-in fade-in zoom-in-95 duration-500">
                  {/* Goal Progress Bar */}
                  {inputs.targetAmount > 0 && (
                      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Goal Progress: {formatCurrency(inputs.targetAmount, currency)}</h4>
                              <span className="text-xs font-semibold px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-md">
                                  {result.goalAchievedPercentage.toFixed(1)}% Achieved
                              </span>
                          </div>
                          <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                  className={`h-full ${result.goalAchievedPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary-500'}`} 
                                  style={{ width: `${result.goalAchievedPercentage}%` }}
                              />
                          </div>
                          {result.goalAchievedPercentage < 100 && (
                              <p className="text-xs text-slate-500 mt-2">
                                  Shortfall: {formatCurrency(inputs.targetAmount - result.postTaxValue, currency)}
                              </p>
                          )}
                      </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-primary-600 p-4 rounded-xl shadow-sm">
                       <p className="text-blue-100 text-xs font-medium mb-1">Total Invested</p>
                       <p className="text-lg md:text-xl font-bold text-white">
                         {formatCurrency(result.totalInvested, currency)}
                       </p>
                       <p className="text-[10px] text-blue-200 mt-1">Duration: {inputs.timePeriod} Yrs</p>
                    </div>
                    <div className="bg-primary-600 p-4 rounded-xl shadow-sm">
                       <p className="text-blue-100 text-xs font-medium mb-1">Est. Returns</p>
                       <p className="text-lg md:text-xl font-bold text-white">
                         {formatCurrency(result.totalReturns, currency)}
                       </p>
                       <p className="text-[10px] text-blue-200 mt-1">+{result.absoluteReturnPercentage.toFixed(0)}% Abs</p>
                    </div>
                     <div className="bg-primary-600 p-4 rounded-xl shadow-sm">
                       <p className="text-blue-100 text-xs font-medium mb-1">Post-Tax Value</p>
                       <p className="text-lg md:text-xl font-bold text-white">
                         {formatCurrency(result.postTaxValue, currency)}
                       </p>
                       <p className="text-[10px] text-blue-200 mt-1">Tax: {inputs.taxRate}%</p>
                    </div>
                    <div className="bg-primary-600 p-4 rounded-xl shadow-sm">
                       <p className="text-blue-100 text-xs font-medium mb-1">Maturity Value</p>
                       <p className="text-xl md:text-2xl font-bold text-white">
                         {formatCurrency(result.totalValue, currency)}
                       </p>
                       <p className="text-[10px] text-blue-200 mt-1">{result.wealthMultiplier.toFixed(1)}x Growth</p>
                    </div>
                  </div>

                  {/* Visualizations */}
                  <ResultCharts 
                    invested={result.totalInvested}
                    returns={result.totalReturns}
                    growthData={growthData}
                  />

                  {/* Insights Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Cost of Delay */}
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-6 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg">
                           <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-rose-900 dark:text-rose-100 mb-1">The Cost of Waiting</h4>
                          <p className="text-xs text-rose-800 dark:text-rose-200 mb-3 leading-relaxed">
                            Delaying your SIP by just <strong>1 year</strong> could cost you:
                          </p>
                          <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(result.costOfDelay, currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Real Value Insight */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-2xl">
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                             <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">Real Purchasing Power</h4>
                             <p className="text-xs text-indigo-800 dark:text-indigo-200 mb-3 leading-relaxed">
                                Adjusted for <strong>{inputs.inflationRate}% inflation</strong>, your money's future worth is:
                             </p>
                             <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(result.realValue, currency)}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-4 justify-end no-print bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl">
                     <button 
                       onClick={() => downloadCSV(result.breakdown)}
                       className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
                     >
                       <Download size={18} />
                       Download CSV
                     </button>
                  </div>
              </div>
            ) : (
              /* Empty State */
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 opacity-50 select-none">
                 <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <ArrowRight size={32} className="text-slate-400" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-400">Ready to Plan Your Wealth?</h3>
                 <p className="text-slate-400 max-w-sm mt-2">Adjust the investment details on the left and click "Calculate & Analyze" to see your future net worth.</p>
              </div>
            )}
            
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        {showResults && result && (
           <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yearly Breakdown</h3>
                 <button onClick={copyTable} className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold">
                     <Copy size={14}/> Copy Data
                 </button>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                 <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 backdrop-blur-md">
                       <tr>
                         <th className="px-6 py-4">Year</th>
                         <th className="px-6 py-4 text-right">Investment Amount</th>
                         <th className="px-6 py-4 text-right">Total Invested</th>
                         <th className="px-6 py-4 text-right">Returns Generated</th>
                         <th className="px-6 py-4 text-right text-primary-600">Total Value</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                       {result.breakdown.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                             <td className="px-6 py-4 font-medium text-slate-400">Y{row.year}</td>
                             <td className="px-6 py-4 text-right">{formatCurrency(row.monthlyInvestment, currency)}/mo</td>
                             <td className="px-6 py-4 text-right">{formatCurrency(row.investedAmount, currency)}</td>
                             <td className="px-6 py-4 text-right text-emerald-600">+{formatCurrency(row.interestEarned, currency)}</td>
                             <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(row.totalValue, currency)}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-400 text-sm">
      </footer>
    </div>
  );
};

export default App;