
import React, { useState, useEffect, useCallback } from 'react';
import { Proposal, AppView } from './types';
import { analyzeProposal, suggestImprovement } from './services/geminiService';

// Mock initial data
const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: "Upgrade Storage Infrastructure",
    description: "Upgrade the primary storage nodes to support higher throughput on the Filecoin network.",
    voteCount: 156,
    creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    deadline: Date.now() + 86400000 * 5,
    active: true
  },
  {
    id: 2,
    title: "Community Growth Fund",
    description: "Allocate 50,000 FIL for developer grants and community meetups in the Q3 period.",
    voteCount: 89,
    creator: "0x35Cc6634C0532925a3b844Bc454e4438f44e742d",
    deadline: Date.now() + 86400000 * 2,
    active: true
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<number, string>>({});
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection logic
    setTimeout(() => {
      setWalletAddress("0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
      setIsConnecting(false);
    }, 1000);
  };

  const handleVote = (id: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    setProposals(prev => prev.map(p => p.id === id ? { ...p, voteCount: p.voteCount + 1 } : p));
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const proposal: Proposal = {
      id: proposals.length + 1,
      title: newTitle,
      description: newDesc,
      voteCount: 0,
      creator: walletAddress || "Anonymous",
      deadline: Date.now() + 86400000 * 7,
      active: true
    };

    setProposals([proposal, ...proposals]);
    setNewTitle('');
    setNewDesc('');
    setView(AppView.DASHBOARD);
  };

  const handleAiAnalysis = async (proposal: Proposal) => {
    setAnalyzingId(proposal.id);
    const result = await analyzeProposal(proposal.title, proposal.description);
    setAiAnalysis(prev => ({ ...prev, [proposal.id]: result || 'Analysis failed' }));
    setAnalyzingId(null);
  };

  const handleImproveDesc = async () => {
    if (!newDesc) return;
    setIsImproving(true);
    const improved = await suggestImprovement(newDesc);
    setNewDesc(improved || newDesc);
    setIsImproving(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center neon-border">
            <i className="fas fa-layer-group text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">FIL-VOTE</h1>
            <p className="text-[10px] text-blue-400 font-mono">FVM DECENTRALIZED</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => setView(AppView.DASHBOARD)} className={`hover:text-blue-400 transition ${view === AppView.DASHBOARD ? 'text-blue-400' : ''}`}>Dashboard</button>
          <button onClick={() => setView(AppView.CREATE_PROPOSAL)} className={`hover:text-blue-400 transition ${view === AppView.CREATE_PROPOSAL ? 'text-blue-400' : ''}`}>New Proposal</button>
          <button onClick={() => setView(AppView.DEPLOY_GUIDE)} className={`hover:text-blue-400 transition ${view === AppView.DEPLOY_GUIDE ? 'text-blue-400' : ''}`}>How to Deploy</button>
        </div>

        <button 
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          {walletAddress ? (
            <><i className="fas fa-wallet"></i> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</>
          ) : (
            isConnecting ? 'Connecting...' : 'Connect Wallet'
          )}
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        {view === AppView.DASHBOARD && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Active Proposals</h2>
                <div className="flex gap-2">
                   <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">All</span>
                   <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-medium border border-white/5">Storage</span>
                </div>
              </div>

              {proposals.map(proposal => (
                <div key={proposal.id} className="glass rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded">Active</span>
                      <span className="text-slate-500 text-xs font-mono">ID: #{proposal.id}</span>
                    </div>
                    <button 
                      onClick={() => handleAiAnalysis(proposal)}
                      className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition"
                      disabled={analyzingId === proposal.id}
                    >
                      <i className={`fas fa-wand-sparkles ${analyzingId === proposal.id ? 'animate-spin' : ''}`}></i>
                      {analyzingId === proposal.id ? 'Analyzing...' : 'AI Analysis'}
                    </button>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition">{proposal.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{proposal.description}</p>

                  {aiAnalysis[proposal.id] && (
                    <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-slate-300 animate-fade-in">
                       <h4 className="font-bold text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                         <i className="fas fa-brain"></i> Gemini Analysis
                       </h4>
                       <div className="whitespace-pre-wrap leading-relaxed">{aiAnalysis[proposal.id]}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Votes</span>
                        <span className="text-lg font-bold">{proposal.voteCount} FIL</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Ending</span>
                        <span className="text-sm font-semibold">{new Date(proposal.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleVote(proposal.id)}
                      className="bg-white text-black hover:bg-blue-400 hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    >
                      Vote Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
               <div className="glass rounded-2xl p-6 border-blue-500/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-chart-pie text-blue-500"></i> DAO Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total FIL Staked</span>
                      <span className="font-mono text-blue-400">1,245,000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Active Proposals</span>
                      <span className="font-mono">{proposals.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total Voters</span>
                      <span className="font-mono">8,421</span>
                    </div>
                  </div>
               </div>

               <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
                  <h3 className="text-lg font-bold mb-2">Build on Filecoin</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    This voting system uses FVM (Filecoin Virtual Machine) smart contracts for bulletproof integrity.
                  </p>
                  <button onClick={() => setView(AppView.DEPLOY_GUIDE)} className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded-lg border border-blue-600/30 transition">
                    View Deployment Docs
                  </button>
               </div>
            </div>
          </div>
        )}

        {view === AppView.CREATE_PROPOSAL && (
          <div className="max-w-2xl mx-auto glass rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Create New Proposal</h2>
            <form onSubmit={handleCreateProposal} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Proposal Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g. Expand Storage Capacity in AP-South"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <button 
                    type="button"
                    onClick={handleImproveDesc}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    disabled={isImproving || !newDesc}
                  >
                    <i className={`fas fa-magic ${isImproving ? 'animate-bounce' : ''}`}></i>
                    {isImproving ? 'Optimizing...' : 'Optimize with AI'}
                  </button>
                </div>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Describe your proposal in detail..."
                  required
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  Publish to Blockchain
                </button>
                <button 
                  type="button"
                  onClick={() => setView(AppView.DASHBOARD)}
                  className="px-6 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {view === AppView.DEPLOY_GUIDE && (
          <div className="max-w-3xl mx-auto glass rounded-2xl p-10 prose prose-invert">
            <h2 className="text-4xl font-bold mb-6 text-blue-400">Deploy to Filecoin FVM</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              The easiest way to deploy this fullstack application is by using <b>Spheron</b> or <b>Fleek</b> for the frontend and <b>Hardhat</b> for the smart contracts.
            </p>
            
            <div className="space-y-10">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm italic">1</span>
                  Smart Contract Deployment
                </h3>
                <div className="bg-black/50 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-white/5">
                  <p className="text-slate-500">// Deploying to Filecoin Calibration Testnet</p>
                  <p>1. Get FIL testnet tokens from <a href="https://faucet.calibration.fildev.network/" className="text-blue-400">Calibration Faucet</a></p>
                  <p>2. Add Network to Metamask: RPC https://api.calibration.node.glif.io/rpc/v1</p>
                  <p>3. Use Remix or Hardhat to deploy the `VotingContract.sol` file.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm italic">2</span>
                  Frontend Deployment (IPFS/Filecoin)
                </h3>
                <div className="bg-black/50 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-white/5">
                  <p className="text-slate-500">// Host decentralized frontend</p>
                  <p>1. Connect your GitHub to <a href="https://spheron.network/" className="text-blue-400">Spheron</a> or <a href="https://fleek.xyz/" className="text-blue-400">Fleek</a>.</p>
                  <p>2. Select 'Filecoin' as the storage layer.</p>
                  <p>3. Click 'Deploy'. Your app is now live on a decentralized CDN!</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm italic">3</span>
                  Connecting the Two
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Update the `CONTRACT_ADDRESS` in your frontend code with the address received from step 1. Use <code>ethers.js</code> or <code>viem</code> to interact with the contract functions.
                </p>
              </section>
            </div>

            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              className="mt-12 w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-blue-400 hover:text-white transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-3 flex justify-between items-center">
        <button onClick={() => setView(AppView.DASHBOARD)} className={`flex flex-col items-center gap-1 ${view === AppView.DASHBOARD ? 'text-blue-400' : 'text-slate-500'}`}>
          <i className="fas fa-home"></i>
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={() => setView(AppView.CREATE_PROPOSAL)} className={`flex flex-col items-center gap-1 ${view === AppView.CREATE_PROPOSAL ? 'text-blue-400' : 'text-slate-500'}`}>
          <i className="fas fa-plus-circle"></i>
          <span className="text-[10px]">Create</span>
        </button>
        <button onClick={() => setView(AppView.DEPLOY_GUIDE)} className={`flex flex-col items-center gap-1 ${view === AppView.DEPLOY_GUIDE ? 'text-blue-400' : 'text-slate-500'}`}>
          <i className="fas fa-book"></i>
          <span className="text-[10px]">Docs</span>
        </button>
      </div>
    </div>
  );
};

export default App;
