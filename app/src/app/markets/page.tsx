'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';

const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

interface Market {
  id: number;
  question: string;
  createdBy: string;
  yesPool: number;
  noPool: number;
  endTime: string;
  status: 'active' | 'resolved' | 'closed';
  userBet?: 'yes' | 'no';
}

const SAMPLE_MARKETS: Market[] = [
  {
    id: 1,
    question: 'Will SOL reach $200 by end of 2026?',
    createdBy: 'Alpha Scout',
    yesPool: 150.5,
    noPool: 75.2,
    endTime: '2026-12-31',
    status: 'active',
  },
  {
    id: 2,
    question: 'Will treasury yield exceed 10% this quarter?',
    createdBy: 'Guardian Sentinel',
    yesPool: 200.0,
    noPool: 50.0,
    endTime: '2026-03-31',
    status: 'active',
  },
  {
    id: 3,
    question: 'Will Jupiter add native AI agent support?',
    createdBy: 'Justice Arbiter',
    yesPool: 89.3,
    noPool: 120.7,
    endTime: '2026-06-30',
    status: 'active',
  },
];

export default function MarketsPage() {
  const { connected } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const calculateOdds = (yes: number, no: number) => {
    const total = yes + no;
    if (total === 0) return { yes: 50, no: 50 };
    return {
      yes: ((yes / total) * 100).toFixed(1),
      no: ((no / total) * 100).toFixed(1),
    };
  };

  const placeBet = (position: 'yes' | 'no') => {
    alert(`Placing ${betAmount} SOL on ${position.toUpperCase()} for "${selectedMarket?.question}"`);
    setSelectedMarket(null);
    setBetAmount('');
  };

  const createMarket = () => {
    alert(`Creating market: "${newQuestion}" ending ${newEndTime}`);
    setShowCreateModal(false);
    setNewQuestion('');
    setNewEndTime('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Prediction Markets</h1>
            <p className="text-gray-400">Market-based validation of treasury decisions</p>
          </div>
          {connected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
            >
              Create Market
            </button>
          )}
        </div>

        {!connected ? (
          <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">🔮</div>
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect to view markets and place predictions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {SAMPLE_MARKETS.map((market) => {
              const odds = calculateOdds(market.yesPool, market.noPool);
              const totalVolume = market.yesPool + market.noPool;
              
              return (
                <div key={market.id} className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Market Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{market.question}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Created by: <span className="text-[#D4AF37]">{market.createdBy}</span></span>
                        <span>Ends: {market.endTime}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          market.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {market.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{odds.yes}%</p>
                        <p className="text-xs text-gray-500">YES</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{odds.no}%</p>
                        <p className="text-xs text-gray-500">NO</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-[#D4AF37]">{totalVolume.toFixed(1)} SOL</p>
                        <p className="text-xs text-gray-500">Volume</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMarket(market)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Bet YES
                      </button>
                      <button
                        onClick={() => setSelectedMarket(market)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Bet NO
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-[#D4AF37]"
                        style={{ width: `${odds.yes}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>YES Pool: {market.yesPool} SOL</span>
                      <span>NO Pool: {market.noPool} SOL</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Place Bet Modal */}
        {selectedMarket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Place Bet</h2>
              <p className="text-gray-400 mb-6">{selectedMarket.question}</p>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedMarket(null)}
                  className="flex-1 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => placeBet('yes')}
                  className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Bet YES
                </button>
                <button
                  onClick={() => placeBet('no')}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Bet NO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Market Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Create Prediction Market</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Question</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Will...?"
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createMarket}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
                >
                  Create Market
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
