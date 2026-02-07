'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

interface Market {
  id: number;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string;
  status: 'open' | 'closed' | 'resolved';
  image?: string;
}

const MARKETS: Market[] = [
  {
    id: 1,
    question: 'Will SOL reach $200 by end of 2026?',
    category: 'Crypto',
    yesPrice: 0.69,
    noPrice: 0.31,
    volume: 2450000,
    liquidity: 890000,
    endDate: 'Dec 31, 2026',
    status: 'open',
  },
  {
    id: 2,
    question: 'Will treasury yield exceed 10% this quarter?',
    category: 'DeFi',
    yesPrice: 0.42,
    noPrice: 0.58,
    volume: 890000,
    liquidity: 320000,
    endDate: 'Mar 31, 2026',
    status: 'open',
  },
  {
    id: 3,
    question: 'Will Jupiter add native AI agent support by June?',
    category: 'Solana',
    yesPrice: 0.73,
    noPrice: 0.27,
    volume: 1560000,
    liquidity: 670000,
    endDate: 'Jun 30, 2026',
    status: 'open',
  },
  {
    id: 4,
    question: 'Will Aethernaut win the Colosseum Hackathon?',
    category: 'AI',
    yesPrice: 0.85,
    noPrice: 0.15,
    volume: 420000,
    liquidity: 180000,
    endDate: 'Feb 12, 2026',
    status: 'open',
  },
  {
    id: 5,
    question: 'Will Bitcoin hit $100k in February 2026?',
    category: 'Crypto',
    yesPrice: 0.28,
    noPrice: 0.72,
    volume: 5200000,
    liquidity: 2100000,
    endDate: 'Feb 28, 2026',
    status: 'open',
  },
  {
    id: 6,
    question: 'Will Fed cut rates by 25bps in March?',
    category: 'Politics',
    yesPrice: 0.14,
    noPrice: 0.86,
    volume: 3200000,
    liquidity: 1200000,
    endDate: 'Mar 15, 2026',
    status: 'open',
  },
];

const CATEGORIES = ['All', 'Crypto', 'DeFi', 'Solana', 'AI', 'Politics'];

export default function MarketsPage() {
  const { connected } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betPosition, setBetPosition] = useState<'yes' | 'no'>('yes');

  const filteredMarkets = selectedCategory === 'All' 
    ? MARKETS 
    : MARKETS.filter(m => m.category === selectedCategory);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}k`;
    return `$${vol}`;
  };

  const placeBet = () => {
    alert(`Placing ${betAmount} SOL on ${betPosition.toUpperCase()} for "${selectedMarket?.question}"`);
    setSelectedMarket(null);
    setBetAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#1A1A24] to-[#0A0A0F] border-b border-[#D4AF37]/10 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#D4AF37] mb-2">Prediction Markets</h1>
                <p className="text-gray-400 text-lg">Trade on the outcome of real-world events</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">$12.4M</p>
                  <p className="text-sm text-gray-500">Total Volume</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#D4AF37]">6</p>
                  <p className="text-sm text-gray-500">Active Markets</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-[#D4AF37]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-[#0A0A0F]'
                    : 'bg-[#1A1A24] text-gray-400 hover:text-[#D4AF37] border border-[#D4AF37]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Markets Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {!connected && (
              <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/20 rounded-2xl p-8 text-center mb-8">
                <div className="text-5xl mb-4">🔮</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400">Connect to start trading on prediction markets</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map((market) => (
                <div 
                  key={market.id}
                  onClick={() => setSelectedMarket(market)}
                  className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-5 hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
                >
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{market.category}</span>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Live</span>
                  </div>

                  {/* Question */}
                  <h3 className="text-white font-medium mb-4 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                    {market.question}
                  </h3>

                  {/* Price Display */}
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex-1 bg-[#0A0A0F] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Yes</p>
                      <p className="text-xl font-bold text-green-400">{Math.round(market.yesPrice * 100)}%</p>
                    </div>
                    <div className="flex-1 bg-[#0A0A0F] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">No</p>
                      <p className="text-xl font-bold text-red-400">{Math.round(market.noPrice * 100)}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400"
                      style={{ width: `${market.yesPrice * 100}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Vol: {formatVolume(market.volume)}</span>
                    <span>Liq: {formatVolume(market.liquidity)}</span>
                  </div>

                  {/* End Date */}
                  <div className="mt-3 pt-3 border-t border-[#D4AF37]/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Ends {market.endDate}</span>
                    <span className="text-xs text-[#D4AF37]">Trade →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Modal */}
        {selectedMarket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#D4AF37]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase">{selectedMarket.category}</span>
                  <button 
                    onClick={() => setSelectedMarket(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="text-lg font-semibold text-white">{selectedMarket.question}</h2>
              </div>

              {/* Price Info */}
              <div className="p-6 border-b border-[#D4AF37]/10">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBetPosition('yes')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      betPosition === 'yes' 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-transparent bg-[#0A0A0F] hover:border-green-500/30'
                    }`}
                  >
                    <p className="text-sm text-gray-400 mb-1">Yes</p>
                    <p className="text-3xl font-bold text-green-400">{Math.round(selectedMarket.yesPrice * 100)}%</p>
                    <p className="text-xs text-gray-500 mt-1">${(selectedMarket.yesPrice).toFixed(2)}</p>
                  </button>
                  <button
                    onClick={() => setBetPosition('no')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      betPosition === 'no' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-transparent bg-[#0A0A0F] hover:border-red-500/30'
                    }`}
                  >
                    <p className="text-sm text-gray-400 mb-1">No</p>
                    <p className="text-3xl font-bold text-red-400">{Math.round(selectedMarket.noPrice * 100)}%</p>
                    <p className="text-xs text-gray-500 mt-1">${(selectedMarket.noPrice).toFixed(2)}</p>
                  </button>
                </div>
              </div>

              {/* Trade Form */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">SOL</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                  <span>Potential Return</span>
                  <span className="text-[#D4AF37]">
                    {betAmount ? (parseFloat(betAmount) / (betPosition === 'yes' ? selectedMarket.yesPrice : selectedMarket.noPrice)).toFixed(4) : '0'} SOL
                  </span>
                </div>

                <button
                  onClick={placeBet}
                  disabled={!betAmount || !connected}
                  className="w-full py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!connected ? 'Connect Wallet' : `Buy ${betPosition.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
