
import React, { useState, useCallback } from 'react';
import { AppPhase, Competitor, SeoAnalysisResults } from './types';
import { geminiService } from './services/geminiService';
import { MetricCard } from './components/MetricCard';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('INPUT');
  const [brandUrl, setBrandUrl] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [analysisResults, setAnalysisResults] = useState<SeoAnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetApp = () => {
    setPhase('INPUT');
    setBrandUrl('');
    setCompetitors([]);
    setCustomUrl('');
    setAnalysisResults(null);
    setError(null);
    setIsLoading(false);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandUrl) return;

    setIsLoading(true);
    setError(null);
    try {
      const discovered = await geminiService.discoverCompetitors(brandUrl);
      setCompetitors(discovered);
      setPhase('COMPETITOR_SELECTION');
    } catch (err) {
      setError("Failed to discover competitors. Please check the URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomCompetitor = () => {
    if (!customUrl || competitors.length >= 5) return;
    try {
      const name = new URL(customUrl).hostname;
      setCompetitors(prev => [...prev, { name, url: customUrl, isCustom: true }]);
      setCustomUrl('');
    } catch (e) {
      setError("Invalid URL format for custom competitor.");
    }
  };

  const removeCompetitor = (url: string) => {
    setCompetitors(prev => prev.filter(c => c.url !== url));
  };

  const startAnalysis = async () => {
    setPhase('ANALYSIS_LOADING');
    setIsLoading(true);
    try {
      const results = await geminiService.performDeepAudit(brandUrl, competitors);
      setAnalysisResults(results);
      setPhase('DASHBOARD');
    } catch (err) {
      setError("An error occurred during analysis.");
      setPhase('COMPETITOR_SELECTION');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={resetApp}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
          <h1 className="text-xl font-bold tracking-tight">SEO<span className="text-indigo-500">INTEL</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs text-slate-500 font-medium uppercase tracking-widest">
            {phase.replace('_', ' ')}
          </div>
          {phase !== 'INPUT' && (
            <button 
              onClick={resetApp}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
            >
              <svg className="w-3.h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              New Audit
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl">
        {phase === 'INPUT' && (
          <div className="flex flex-col items-center text-center mt-20 space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white">Automate Competitor Intelligence</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">Enter your brand URL to map your organic competitive landscape and discover high-impact ranking opportunities.</p>
            </div>
            <form onSubmit={handleInitialSubmit} className="w-full max-w-lg flex flex-col md:flex-row gap-2">
              <input 
                type="url" 
                placeholder="https://yourbrand.com"
                required
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Scanning...' : 'Start Audit'}
              </button>
            </form>
          </div>
        )}

        {phase === 'COMPETITOR_SELECTION' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Confirm Competitors</h2>
                <p className="text-slate-400">We found these top organic rivals for <span className="text-indigo-400 underline">{brandUrl}</span>. Add up to {5 - competitors.length} more or refine the list.</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="Custom competitor URL"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <button 
                  onClick={addCustomCompetitor}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {competitors.map((comp) => (
                <div key={comp.url} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between group">
                  <div>
                    <h4 className="font-bold text-slate-100">{comp.name}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{comp.url}</p>
                  </div>
                  <button 
                    onClick={() => removeCompetitor(comp.url)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={startAnalysis}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-105"
              >
                Perform Deep Dual-Metric Audit
              </button>
            </div>
          </div>
        )}

        {phase === 'ANALYSIS_LOADING' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Deep Crawling Sites...</h3>
              <p className="text-slate-500 italic">"Simulating Market Alignment and Authority Power metrics..."</p>
            </div>
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-2 uppercase">
                <span>Current Task</span>
                <span>Generating Roadmap</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[60%] animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {phase === 'DASHBOARD' && analysisResults && (
          <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Phase 2: Dual Metric Audit */}
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-4">Comparative Audit Framework</h2>
                <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">Normalized Logarithmic Scale Applied</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisResults.metrics.map((m) => (
                  <MetricCard 
                    key={m.url} 
                    metrics={m} 
                    isMainBrand={m.url.includes(brandUrl) || brandUrl.includes(m.url)}
                  />
                ))}
              </div>
            </section>

            {/* Phase 3: Opportunity Gap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <section className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold border-l-4 border-emerald-500 pl-4">The "Opportunity Gap" Analysis</h2>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Keyword</th>
                        <th className="px-6 py-4">Vol</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4">Rank Likelihood</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {analysisResults.keywordSuggestions.map((kw, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-100">{kw.keyword}</td>
                          <td className="px-6 py-4 text-slate-400">{kw.volume}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-800 h-1.5 rounded-full">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${kw.difficulty}%` }}></div>
                              </div>
                              <span className="text-[10px]">{kw.difficulty}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${kw.likelihoodToRank > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                              {kw.likelihoodToRank}% SWEET SPOT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold border-l-4 border-slate-500 pl-4">Content Clusters</h2>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Missing Clusters</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.contentGaps.map((gap, i) => (
                        <span key={i} className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-full text-slate-300">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-indigo-400">Roadmap: Technical Wins</h4>
                    <ul className="space-y-3">
                      {analysisResults.technicalWins.map((win, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300 items-start">
                          <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            {/* Phase 4: Detailed Recommendations */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-500 pl-4">Priority Content Briefs</h2>
                <button 
                  onClick={resetApp}
                  className="bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Start New Audit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysisResults.contentBriefs.map((brief, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded uppercase">Keyword: {brief.keyword}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Recommended H1</p>
                        <p className="text-sm font-semibold text-slate-100 italic">"{brief.h1}"</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Subheadings (H2s)</p>
                        <ul className="space-y-2">
                          {brief.h2s.map((h, j) => (
                            <li key={j} className="text-xs text-slate-400 border-l border-slate-700 pl-3 py-1">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-4 z-50">
          <p className="font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Error
          </p>
          <p className="text-sm opacity-90">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs underline uppercase tracking-widest font-bold">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default App;
