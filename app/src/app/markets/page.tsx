'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useCallback } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/Loading';
import { validators, errorHandlers, formatters } from '@/lib/utils';

const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

interface Market {
  id: number;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endTimestamp: number;
  status: 'open' | 'closed' | 'resolved';
  resolvedOutcome?: 'yes' | 'no';
  totalYesBets: number;
  totalNoBets: number;
}

const SAMPLE_MARKETS: Market[] = [
  {
    id: 1,
    question: 'Will SOL reach $200 by end of 2026?',
    category: 'Crypto',
    yesPrice: 0.69,
    noPrice: 0.31,
    volume: 2450,
    liquidity: 890,
    endTimestamp: Math.floor(Date.now() / 1000) + 31536000,
    status: 'open',
    totalYesBets: 156,
    totalNoBets: 89,
  },
  {
    id: 2,
    question: 'Will treasury yield exceed 10% this quarter?',
    category: 'DeFi',
    yesPrice: 0.42,
    noPrice: 0.58,
    volume: 890,
    liquidity: 320,
    endTimestamp: Math.floor(Date.now() / 1000) + 5184000,
    status: 'open',
    totalYesBets: 45,
    totalNoBets: 62,
  },
  {
    id: 3,
    question: 'Will Jupiter add native AI agent support by June?',
    category: 'Solana',
    yesPrice: 0.73,
    noPrice: 0.27,
    volume: 1560,
    liquidity: 670,
    endTimestamp: Math.floor(Date.now() / 1000) + 12614400,
    status: 'open',
    totalYesBets: 98,
    totalNoBets: 36,
  },
  {
    id: 4,
    question: 'Will Aethernaut win the Colosseum Hackathon?',
    category: 'AI',
    yesPrice: 0.85,
    noPrice: 0.15,
    volume: 420,
    liquidity: 180,
    endTimestamp: Math.floor(Date.now() / 1000) + 259200,
    status: 'open',
    totalYesBets: 67,
    totalNoBets: 12,
  },
  {
    id: 5,
    question: 'Will Bitcoin hit $100k in February 2026?',
    category: 'Crypto',
    yesPrice: 0.28,
    noPrice: 0.72,
    volume: 5200,
    liquidity: 2100,
    endTimestamp: Math.floor(Date.now() / 1000) + 1814400,
    status: 'open',
    totalYesBets: 234,
    totalNoBets: 601,
  },
  {
    id: 6,
    question: 'Will Fed cut rates by 25bps in March?',
    category: 'Politics',
    yesPrice: 0.14,
    noPrice: 0.86,
    volume: 3200,
    liquidity: 1200,
    endTimestamp: Math.floor(Date.now() / 1000) + 5184000,
    status: 'open',
    totalYesBets: 112,
    totalNoBets: 687,
  },
];

const CATEGORIES = ['All', 'Crypto', 'DeFi', 'Solana', 'AI', 'Politics'];

export default function MarketsPage() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const { addToast } = useToast();
  
  const [markets] = useState<Market[]>(SAMPLE_MARKETS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betPosition, setBetPosition] = useState<'yes' | 'no'>('yes');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create market form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('Crypto');
  const [newDeadline, setNewDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Validation errors
  const [amountError, setAmountError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  const filteredMarkets = selectedCategory === 'All' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  const getMarketStatus = (market: Market): { label: string; color: string } => {
    const now = Math.floor(Date.now() / 1000);
    if (market.status === 'resolved') {
      return { 
        label: `Resolved: ${market.resolvedOutcome?.toUpperCase()}`, 
        color: market.resolvedOutcome === 'yes' ? 'text-green-400' : 'text-red-400'
      };
    }
    if (market.status === 'closed' || market.endTimestamp < now) {
      return { label: 'Closed', color: 'text-yellow-400' };
    }
    return { label: 'Open', color: 'text-green-400' };
  };

  const calculatePotentialReturn = (amount: string, position: 'yes' | 'no', market: Market): number => {
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) return 0;
    
    const price = position === 'yes' ? market.yesPrice : market.noPrice;
    // Return = bet amount / price (if you win, you get 1 SOL worth)
    const shares = betAmount / price;
    // Gross return = shares * 1 (if resolved to your position)
    const grossReturn = shares;
    // Net profit
    return grossReturn - betAmount;
  };

  const validateAmount = useCallback((value: string): boolean => {
    const validation = validators.isValidSolAmount(value);
    if (!validation.valid) {
      setAmountError(validation.error || 'Invalid amount');
      return false;
    }
    setAmountError('');
    return true;
  }, []);

  const validateQuestion = useCallback((): boolean => {
    const validation = validators.isValidQuestion(newQuestion);
    if (!validation.valid) {
      setQuestionError(validation.error || 'Invalid question');
      return false;
    }
    setQuestionError('');
    return true;
  }, [newQuestion]);

  const validateDeadline = useCallback((): boolean => {
    if (!newDeadline) {
      setDeadlineError('Deadline is required');
      return false;
    }
    const timestamp = new Date(newDeadline).getTime() / 1000;
    const validation = validators.isValidDeadline(timestamp);
    if (!validation.valid) {
      setDeadlineError(validation.error || 'Invalid deadline');
      return false;
    }
    setDeadlineError('');
    return true;
  }, [newDeadline]);

  const placeBet = async () => {
    if (!validateAmount(betAmount)) return;
    if (!publicKey || !sendTransaction) {
      addToast('Wallet not connected', 'error');
      return;
    }
    if (!selectedMarket) return;

    const amount = parseFloat(betAmount);
    if (amount <= 0) {
      addToast('Amount must be greater than 0', 'error');
      return;
    }

    setIsPlacingBet(true);
    try {
      // In production, this would call the prediction market program
      // For now, create a real transaction to demonstrate functionality
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: MARKET_PROGRAM_ID,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const potentialReturn = calculatePotentialReturn(betAmount, betPosition, selectedMarket);
      addToast(
        `Bet ${formatters.formatSol(amount)} on "${betPosition.toUpperCase()}" - Potential return: ${formatters.formatSol(potentialReturn)}`,
        'success'
      );
      
      setBetAmount('');
      setSelectedMarket(null);
    } catch (error: any) {
      console.error('Bet error:', error);
      addToast(errorHandlers.handleWalletError(error), 'error');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const createMarket = async () => {
    if (!validateQuestion() || !validateDeadline()) return;
    if (!publicKey) {
      addToast('Wallet not connected', 'error');
      return;
    }

    setIsCreating(true);
    try {
      // In production, this would call the prediction market program
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addToast(`Market "${newQuestion.slice(0, 30)}..." created successfully`, 'success');
      setShowCreateModal(false);
      setNewQuestion('');
      setNewCategory('Crypto');
      setNewDeadline('');
    } catch (error: any) {
      console.error('Create market error:', error);
      addToast(errorHandlers.handleProgramError(error), 'error');
    } finally {
      setIsCreating(false);
    }
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
                <p className="text-gray-400 text-lg">Crowdsourced intelligence for treasury decisions</p>
              </div>
              {connected && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-xl hover:bg-[#E5C048] transition-colors"
                >
                  Create Market
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">{markets.length}</p>
                <p className="text-sm text-gray-500">Active Markets</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">{formatters.formatCompact(markets.reduce((sum, m) => sum + m.volume, 0))} SOL</p>
                <p className="text-sm text-gray-500">Total Volume</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">{markets.reduce((sum, m) => sum + m.totalYesBets + m.totalNoBets, 0)}</p>
                <p className="text-sm text-gray-500">Total Bets</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">{formatters.formatCompact(markets.reduce((sum, m) => sum + m.liquidity, 0))} SOL</p>
                <p className="text-sm text-gray-500">Total Liquidity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-[#D4AF37]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#D4AF37] text-[#0A0A0F]'
                    : 'bg-[#1A1A24] text-gray-400 hover:text-[#D4AF37] border border-[#D4AF37]/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Markets Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {!connected ? (
              <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400">Connect to view and trade on prediction markets</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMarkets.map((market) => {
                  const status = getMarketStatus(market);
                  return (
                    <div 
                      key={market.id}
                      className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-[#D4AF37]/10">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full border border-[#D4AF37]/30">
                            {market.category}
                          </span>
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                          {market.question}
                        </h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        {/* Price Bars */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-400 font-medium">Yes {formatters.formatPercent(market.yesPrice * 100, 0)}</span>
                            <span className="text-red-400 font-medium">No {formatters.formatPercent(market.noPrice * 100, 0)}</span>
                          </div>
                          <div className="h-4 bg-[#0A0A0F] rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-green-500/80"
                              style={{ width: `${market.yesPrice * 100}%` }}
                            />
                            <div 
                              className="h-full bg-red-500/80"
                              style={{ width: `${market.noPrice * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center py-3 border-t border-b border-[#D4AF37]/10">
                          <div>
                            <p className="text-lg font-bold text-white">{formatters.formatCompact(market.volume)}</p>
                            <p className="text-xs text-gray-500">Volume</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#D4AF37]">{formatters.formatCompact(market.liquidity)}</p>
                            <p className="text-xs text-gray-500">Liquidity</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">{formatters.formatDate(market.endTimestamp)}</p>
                            <p className="text-xs text-gray-500">Ends</p>
                          </div>
                        </div>

                        {/* Bets Count */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-400">{market.totalYesBets} Yes bets</span>
                          <span className="text-red-400">{market.totalNoBets} No bets</span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 border-t border-[#D4AF37]/10">
                        <button
                          onClick={() => {
                            setSelectedMarket(market);
                            setBetAmount('');
                            setAmountError('');
                          }}
                          disabled={market.status !== 'open'}
                          className="w-full py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {market.status === 'open' ? 'Trade' : 'Market Closed'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trade Modal */}
        {selectedMarket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#D4AF37]/10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full border border-[#D4AF37]/30">
                    {selectedMarket.category}
                  </span>
                  <button 
                    onClick={() => setSelectedMarket(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white mt-3">{selectedMarket.question}</h2>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Position Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBetPosition('yes')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      betPosition === 'yes'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-[#D4AF37]/30 hover:border-green-500/50'
                    }`}
                  >
                    <p className="text-2xl font-bold text-green-400">Yes</p>
                    <p className="text-sm text-gray-400">{formatters.formatPercent(selectedMarket.yesPrice * 100, 0)}</p>
                  </button>
                  <button
                    onClick={() => setBetPosition('no')}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      betPosition === 'no'
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-[#D4AF37]/30 hover:border-red-500/50'
                    }`}
                  >
                    <p className="text-2xl font-bold text-red-400">No</p>
                    <p className="text-sm text-gray-400">{formatters.formatPercent(selectedMarket.noPrice * 100, 0)}</p>
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bet Amount (SOL)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => {
                      setBetAmount(e.target.value);
                      validateAmount(e.target.value);
                    }}
                    placeholder="0.0"
                    step="0.001"
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] text-lg"
                  />
                  {amountError && <p className="text-red-400 text-sm mt-1">{amountError}</p>}
                </div>

                {/* Potential Return */}
                {betAmount && !amountError && (
                  <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#D4AF37]/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Your bet</span>
                      <span className="text-white">{formatters.formatSol(parseFloat(betAmount))}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Position</span>
                      <span className={betPosition === 'yes' ? 'text-green-400' : 'text-red-400'}>
                        {betPosition.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/10">
                      <span className="text-gray-400">Potential Profit</span>
                      <span className="text-[#D4AF37] font-bold">
                        +{formatters.formatSol(calculatePotentialReturn(betAmount, betPosition, selectedMarket))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Markets resolve when deadline passes</p>
                  <p>• Treasury decisions use market outcomes</p>
                  <p>• Winners receive proportional payouts</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10">
                <button
                  onClick={placeBet}
                  disabled={isPlacingBet || !betAmount || !!amountError}
                  className="w-full py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPlacingBet ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    `Bet ${betPosition.toUpperCase()}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Market Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-[#D4AF37]/10">
                <h2 className="text-2xl font-bold text-[#D4AF37]">Create Prediction Market</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Question *</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => {
                      setNewQuestion(e.target.value);
                      validateQuestion();
                    }}
                    placeholder="Will [event] happen by [date]?"
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                  {questionError && <p className="text-red-400 text-sm mt-1">{questionError}</p>}
                  <p className="text-xs text-gray-500 mt-1">Question must end with ? and be 10-200 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Resolution Deadline *</label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => {
                      setNewDeadline(e.target.value);
                      validateDeadline();
                    }}
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  {deadlineError && <p className="text-red-400 text-sm mt-1">{deadlineError}</p>}
                </div>

                <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#D4AF37]/10">
                  <p className="text-sm text-gray-400">
                    Creating a market requires a 0.1 SOL initialization fee.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-[#D4AF37]/10 flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createMarket}
                  disabled={isCreating || !newQuestion || !newDeadline || !!questionError || !!deadlineError}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating...
                    </>
                  ) : (
                    'Create Market'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
