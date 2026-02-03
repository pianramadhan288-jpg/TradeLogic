
import React, { useState, useCallback, useRef } from 'react';
import { StockAnalysisInput, AppConfig, CapitalTier, ImageAsset } from '../types';
import { ChevronRight, Zap, Shield, Terminal, Image as ImageIcon, Trash2, Plus, Eye, Wallet, ShieldCheck, Lock, BrainCircuit, UploadCloud } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: StockAnalysisInput) => void;
  loading: boolean;
  defaultConfig?: AppConfig;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loading, defaultConfig }) => {
  const [ticker, setTicker] = useState('');
  const [capital, setCapital] = useState('');
  const [tier, setTier] = useState<CapitalTier>(defaultConfig?.defaultTier || 'RETAIL');
  const [rawText, setRawText] = useState('');
  const [images, setImages] = useState<ImageAsset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        const newImage: ImageAsset = {
          id: crypto.randomUUID(),
          base64: base64String,
          mimeType: file.type,
          preview: reader.result as string
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) processFiles(files);
  }, [processFiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi: Harus ada Ticker, Capital, DAN (RawText ATAU Images)
    if (!ticker || !capital || (!rawText && images.length === 0)) return;

    const input: StockAnalysisInput = {
      ticker: ticker.toUpperCase(),
      price: "0",
      capital,
      capitalTier: tier,
      riskProfile: defaultConfig?.riskProfile || 'BALANCED',
      images: images,
      rawIntelligenceData: rawText
    };

    onSubmit(input);
  };

  const tiers: { id: CapitalTier; label: string; range: string; icon: any; strategy: string }[] = [
    { 
        id: 'MICRO', 
        label: 'MICRO', 
        range: '< 100 Juta', 
        icon: <Zap size={14} />,
        strategy: 'MODE: GUERRILLA. AI akan sangat protektif terhadap fee transaksi & potensi nyangkut.'
    },
    { 
        id: 'RETAIL', 
        label: 'RETAIL', 
        range: '100Jt - 1M', 
        icon: <Wallet size={14} />,
        strategy: 'MODE: GROWTH. Standar analisis trend & fundamental klasik.'
    },
    { 
        id: 'HIGH_NET', 
        label: 'HIGH NET', 
        range: '1M - 10M', 
        icon: <ShieldCheck size={14} />,
        strategy: 'MODE: WEALTH. Fokus pada preservasi aset & dividen.'
    },
    { 
        id: 'INSTITUTIONAL', 
        label: 'WHALE', 
        range: '> 10 Miliar', 
        icon: <Lock size={14} />,
        strategy: 'MODE: MARKET MAKER. Fokus pada Likuiditas (Bid/Offer).'
    }
  ];

  const activeTierInfo = tiers.find(t => t.id === tier);
  const isSubmitDisabled = loading || !ticker || !capital || (!rawText && images.length === 0);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* TIER SELECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tiers.map((t) => (
              <button 
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group ${tier === t.id ? 'bg-white border-white text-black' : 'bg-[#0a0a0a] border-[#222] text-slate-500 hover:border-slate-600'}`}
              >
                  <div className="flex items-center gap-2">
                      {t.icon}
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                  </div>
              </button>
          ))}
      </div>

      {/* MANDATE HEADER */}
      <div className="bg-[#0a0a0a] border border-[#151515] rounded-3xl p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                  <Shield size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Target Mandate</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="TICKER (E.G. BBCA)" 
                    value={ticker} 
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="bg-transparent border-b border-[#222] py-2 text-2xl font-black text-white focus:border-white outline-none transition-all placeholder:text-slate-800"
                  />
                  <input 
                    type="number" 
                    placeholder="CAPITAL (IDR)" 
                    value={capital} 
                    onChange={(e) => setCapital(e.target.value)}
                    className="bg-transparent border-b border-[#222] py-2 text-xl font-mono text-white focus:border-white outline-none transition-all placeholder:text-slate-800"
                  />
              </div>
          </div>
          <div className="w-px bg-[#151515] hidden md:block"></div>
          <div className="md:w-64 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-2">Current Logic</span>
              <p className="text-[10px] text-indigo-400 leading-tight italic">
                  "{activeTierInfo?.strategy}"
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
          
          {/* LEFT: TEXT TERMINAL */}
          <div className="md:col-span-7 flex flex-col bg-[#050505] border border-[#151515] rounded-[32px] overflow-hidden shadow-2xl relative">
              <div className="h-12 bg-[#0a0a0a] border-b border-[#151515] px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                      <Terminal size={12} className="text-emerald-500"/>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Data Terminal (Text)
                      </span>
                  </div>
                  <button type="button" onClick={() => setRawText('')} className="text-[9px] font-bold text-slate-600 hover:text-rose-500 uppercase tracking-widest">Clear</button>
              </div>
              <textarea 
                placeholder="OPSI A: Paste data teks fundamental/broker summary disini..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                onPaste={handlePaste}
                className="flex-1 w-full bg-transparent p-6 text-emerald-500/90 font-mono text-[11px] leading-relaxed outline-none resize-none placeholder:text-slate-800"
              />
              {!rawText && images.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-emerald-900/40 font-mono text-xs uppercase tracking-widest">Using Image Data Only</p>
                </div>
              )}
          </div>

          {/* RIGHT: IMAGE UPLOAD */}
          <div className="md:col-span-5 flex flex-col bg-[#0a0a0a] border border-[#151515] rounded-[32px] overflow-hidden">
             <div className="h-12 bg-[#0a0a0a] border-b border-[#151515] px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                      <ImageIcon size={12} className="text-indigo-500"/>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Visual Evidence
                      </span>
                  </div>
                  <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                  >
                      <UploadCloud size={10} /> Upload
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                 {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {images.map((img) => (
                            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#222] group">
                                <img src={img.preview} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                     <button type="button" className="p-2 bg-black/50 rounded-full text-white"><Eye size={16}/></button>
                                     <button type="button" onClick={() => handleRemoveImage(img.id)} className="p-2 bg-rose-900/80 rounded-full text-white"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border border-dashed border-[#333] hover:border-indigo-500 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-indigo-400 transition-all"
                        >
                            <Plus size={24} />
                            <span className="text-[10px] font-bold uppercase">Add More</span>
                        </button>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 border-2 border-dashed border-[#151515] rounded-2xl bg-[#080808]">
                        <ImageIcon size={48} className="opacity-20" />
                        <div className="text-center px-6">
                            <p className="text-xs font-bold text-slate-500 mb-1">OPSI B: Upload Screenshot</p>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                                Broker Summary, Financial Reports, atau Chart Teknikal. AI akan membaca data angka dari foto.
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-[#151515] hover:bg-[#222] text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                        >
                            Select Files
                        </button>
                    </div>
                 )}
              </div>
          </div>

      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-center pt-4">
        <button 
          type="submit" 
          disabled={isSubmitDisabled}
          className={`w-full max-w-md px-12 py-5 rounded-2xl font-black text-xs flex items-center justify-center gap-4 transition-all tracking-[0.2em] shadow-2xl ${isSubmitDisabled ? 'bg-[#151515] text-slate-600 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200 hover:-translate-y-1 active:translate-y-0'}`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              PROCESSING DATA...
            </>
          ) : (
            <>
              EXECUTE DATA AUDIT
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
