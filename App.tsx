import React, { useState, useEffect } from 'react';
import { Loader2, Zap, FolderOpen, Settings, Info, Menu, X, Activity, Search, ChevronRight, BrainCircuit, ShieldAlert, Lock, LogOut, AlertTriangle, CheckCircle, Copy, Archive } from 'lucide-react';
import { analyzeStock, runConsistencyCheck } from './services/geminiService';
import { AnalysisResult, StockAnalysisInput, ConsistencyResult, AppConfig } from './types';
import AnalysisCard from './components/AnalysisCard';
import InputForm from './components/InputForm';
import CaseVault from './components/CaseVault';
import ConfigPanel from './components/ConfigPanel';

const DEFAULT_CONFIG: AppConfig = {
    defaultTier: 'RETAIL',
    riskProfile: 'BALANCED',
    userName: 'Trader Pro'
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'LAB' | 'VAULT' | 'CONFIG'>('LAB');
  const [vaultCases, setVaultCases] = useState<AnalysisResult[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showManifesto, setShowManifesto] = useState(false);

  useEffect(() => {
    const savedVault = localStorage.getItem('tradeLogic_cases');
    if (savedVault) {
      try {
        setVaultCases(JSON.parse(savedVault));
      } catch (e) { console.error("Failed to load vault", e); }
    }
    const savedConfig = localStorage.getItem('tradeLogic_config');
    if (savedConfig) {
        try { setAppConfig(JSON.parse(savedConfig)); } catch (e) { console.error("Failed to load config", e); }
    }
  }, []);

  const handleSaveConfig = (newConfig: AppConfig) => {
      setAppConfig(newConfig);
      localStorage.setItem('tradeLogic_config', JSON.stringify(newConfig));
      setView('LAB');
  };

  const saveToVault = (result: AnalysisResult) => {
    const newCases = [result, ...vaultCases];
    setVaultCases(newCases);
    localStorage.setItem('tradeLogic_cases', JSON.stringify(newCases));
  };

  const removeFromVault = (id: string) => {
    const newCases = vaultCases.filter(c => c.id !== id);
    setVaultCases(newCases);
    localStorage.setItem('tradeLogic_cases', JSON.stringify(newCases));
  };

  const handleAnalysisSubmit = async (data: StockAnalysisInput) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeStock(data);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error during audit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-slate-300 overflow-hidden font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#080808] border-r border-[#151515] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#151515]">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Zap size={16} className="text-black fill-current" />
               </div>
               <span className="text-xl font-bold text-white">TradeLogic</span>
           </div>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={20} /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 pt-8">
           <button onClick={() => { setView('LAB'); setAnalysis(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'LAB' && !analysis ? 'bg-white text-black font-bold' : 'text-slate-500 hover:bg-[#111] hover:text-white'}`}>
             <Activity size={18} /> Forensic Lab
           </button>
           <button onClick={() => setView('VAULT')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'VAULT' ? 'bg-white text-black font-bold' : 'text-slate-500 hover:bg-[#111] hover:text-white'}`}>
             <FolderOpen size={18} /> Case Vault
           </button>
           <button onClick={() => setView('CONFIG')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'CONFIG' ? 'bg-white text-black font-bold' : 'text-slate-500 hover:bg-[#111] hover:text-white'}`}>
             <Settings size={18} /> Mandate
           </button>
        </nav>

        <div className="p-4 border-t border-[#151515]">
           <div className="p-3 bg-[#111] rounded-xl flex items-center gap-3 border border-[#222]">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">{appConfig.userName.charAt(0)}</div>
              <div className="flex-1 overflow-hidden">
                 <div className="text-xs font-bold text-white truncate">{appConfig.userName}</div>
                 <div className="text-[10px] text-slate-500 uppercase">{appConfig.riskProfile}</div>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col relative bg-black">
         <header className="h-20 px-8 flex items-center justify-between z-10 sticky top-0 bg-black/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
                <h2 className="text-xl font-bold text-white">
                    {view === 'LAB' ? 'Intelligence Lab' : view === 'VAULT' ? 'Archives' : 'Protocol'}
                </h2>
            </div>
            <button onClick={() => setShowManifesto(true)} className="p-2 text-slate-500 hover:text-white"><Info size={20} /></button>
         </header>

         <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10">
            {view === 'CONFIG' && <ConfigPanel config={appConfig} onSave={handleSaveConfig} />}
            {view === 'VAULT' && <CaseVault cases={vaultCases} onDeleteCase={removeFromVault} onLoadCase={(d) => { setAnalysis(d); setView('LAB'); }} onExport={()=>{}} onImport={()=>{}} onRunConsistency={()=>{}} />}
            
            {view === 'LAB' && (
                <>
                    {!analysis && !loading && (
                        <div className="max-w-5xl mx-auto pt-8">
                            <div className="mb-12">
                                <h1 className="text-5xl font-extrabold text-white tracking-tighter mb-2">Terminal Audit</h1>
                                <p className="text-slate-500 text-lg">Input raw quant data. Get cold, hard truth.</p>
                            </div>
                            <InputForm onSubmit={handleAnalysisSubmit} loading={loading} defaultConfig={appConfig} />
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center pb-20">
                             <div className="w-24 h-24 mb-6 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                             <h3 className="text-2xl font-bold text-white">Auditing Quant Data...</h3>
                             <p className="text-slate-500 mt-2 font-mono text-sm tracking-widest uppercase">Cross-Referencing Flow vs Valuation</p>
                        </div>
                    )}

                    {error && (
                        <div className="max-w-xl mx-auto mt-10 p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-center">
                            <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
                            <h3 className="text-rose-400 font-bold mb-2">System Interrupted</h3>
                            <p className="text-rose-200/70 text-sm mb-6 leading-relaxed font-mono bg-black/30 p-4 rounded-lg border border-rose-900/30">
                                {error}
                            </p>
                            <button onClick={() => setError(null)} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm">Clear Error & Retry</button>
                        </div>
                    )}

                    {analysis && !loading && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                             <div className="mb-6">
                                <button onClick={() => setAnalysis(null)} className="text-slate-500 hover:text-white text-sm font-bold flex items-center gap-2">
                                    <ChevronRight size={16} className="rotate-180" /> NEW AUDIT
                                </button>
                             </div>
                             <AnalysisCard data={analysis} onSave={saveToVault} />
                        </div>
                    )}
                </>
            )}
         </div>
      </main>

      {showManifesto && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowManifesto(false)}>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-[40px] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-[#111]">
                    <div className="flex items-center gap-3 text-rose-500 mb-4">
                        <ShieldAlert size={24} />
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">Mandatory Warning</span>
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight">QUANT OVER STORY.</h2>
                </div>
                <div className="p-10 space-y-6">
                    <p className="text-slate-400 leading-relaxed italic">"TradeLogic dirancang untuk membedah data mentah tanpa emosi. Kami mengutamakan Cash Flow dan Bandarmology di atas narasi media."</p>
                </div>
                <div className="p-8 flex justify-end">
                    <button onClick={() => setShowManifesto(false)} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-colors">UNDERSTOOD</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
