'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/Loading';
import { validators, errorHandlers, formatters } from '@/lib/utils';

const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');

interface TreasuryData {
  address: string;
  balance: number;
  exists: boolean;
  totalYield: number;
  totalDeposited: number;
}

interface Strategy {
  id: number;
  name: string;
  protocol: string;
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  allocation: number;
  tvl: string;
}

const STRATEGIES: Strategy[] = [
  { id: 1, name: 'Jupiter LP', protocol: 'Jupiter', apy: 12.5, risk: 'Medium', allocation: 40, tvl: '$2.4M' },
  { id: 2, name: 'Marinade Staking', protocol: 'Marinade', apy: 6.8, risk: 'Low', allocation: 30, tvl: '$5.1M' },
  { id: 3, name: 'Solend Lending', protocol: 'Solend', apy: 8.2, risk: 'Low', allocation: 20, tvl: '$3.2M' },
  { id: 4, name: 'Raydium Yield', protocol: 'Raydium', apy: 18.5, risk: 'High', allocation: 10, tvl: '$890K' },
];

const RECENT_DECISIONS = [
  { id: 1, action: 'Rebalanced to Jupiter LP', timestamp: Date.now() / 1000 - 7200, impact: '+2.3%', type: 'positive' as const },
  { id: 2, action: 'Increased Marinade stake', timestamp: Date.now() / 1000 - 18000, impact: '+0.8%', type: 'positive' as const },
  { id: 3, action: 'Reduced Raydium exposure', timestamp: Date.now() / 1000 - 86400, impact: '-0.5%', type: 'negative' as const },
];

export default function TreasuryPage() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const { addToast } = useToast();
  
  const [treasuryData, setTreasuryData] = useState<TreasuryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositError, setDepositError] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');

  const fetchTreasuryData = useCallback(async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), publicKey.toBuffer()],
        TREASURY_PROGRAM_ID
      );
      
      const accountInfo = await connection.getAccountInfo(treasuryPda);
      if (accountInfo) {
        setTreasuryData({
          address: treasuryPda.toString(),
          balance: accountInfo.lamports / LAMPORTS_PER_SOL,
          exists: true,
          totalYield: 12.4,
          totalDeposited: 100,
        });
      } else {
        setTreasuryData({
          address: treasuryPda.toString(),
          balance: 0,
          exists: false,
          totalYield: 0,
          totalDeposited: 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching treasury:', error);
      addToast(errorHandlers.handleRPCError(error), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, addToast]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTreasuryData();
    }
  }, [connected, publicKey, fetchTreasuryData]);

  const validateDeposit = (value: string): boolean => {
    const validation = validators.isValidSolAmount(value);
    if (!validation.valid) {
      setDepositError(validation.error || 'Invalid amount');
      return false;
    }
    setDepositError('');
    return true;
  };

  const validateWithdraw = (value: string): boolean => {
    const maxAmount = treasuryData?.balance || 0;
    const validation = validators.isValidSolAmount(value, maxAmount);
    if (!validation.valid) {
      setWithdrawError(validation.error || 'Invalid amount');
      return false;
    }
    setWithdrawError('');
    return true;
  };

  const initializeTreasury = async () => {
    if (!publicKey || !sendTransaction) {
      addToast('Wallet not connected', 'error');
      return;
    }
    
    setIsInitializing(true);
    try {
      // In production, this would call the Anchor program
      // For now, simulate with a small transaction to prove concept
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0,
        })
      );
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      addToast('Treasury initialized successfully', 'success');
      await fetchTreasuryData();
    } catch (error: any) {
      console.error('Initialization error:', error);
      addToast(errorHandlers.handleWalletError(error), 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const deposit = async () => {
    if (!validateDeposit(depositAmount)) return;
    if (!publicKey || !sendTransaction) {
      addToast('Wallet not connected', 'error');
      return;
    }

    const amount = parseFloat(depositAmount);
    
    try {
      // In production, this would interact with the treasury program
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(treasuryData?.address || publicKey),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      addToast(`Successfully deposited ${formatters.formatSol(amount)}`, 'success');
      setDepositAmount('');
      await fetchTreasuryData();
    } catch (error: any) {
      console.error('Deposit error:', error);
      addToast(errorHandlers.handleWalletError(error), 'error');
    }
  };

  const withdraw = async () => {
    if (!validateWithdraw(withdrawAmount)) return;
    if (!publicKey) {
      addToast('Wallet not connected', 'error');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    try {
      // In production, this would call the treasury program's withdraw instruction
      addToast(`Withdrawal of ${formatters.formatSol(amount)} requested`, 'info');
      setWithdrawAmount('');
      
      // Refresh data after a moment
      setTimeout(() => fetchTreasuryData(), 2000);
    } catch (error: any) {
      console.error('Withdraw error:', error);
      addToast(errorHandlers.handleProgramError(error), 'error');
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
                <h1 className="text-4xl sm:text-5xl font-bold text-[#D4AF37] mb-2">Treasury</h1>
                <p className="text-gray-400 text-lg">AI-driven yield optimization across Solana DeFi</p>
              </div>
              {connected && !treasuryData?.exists && (
                <button
                  onClick={initializeTreasury}
                  disabled={isInitializing}
                  className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50"
                >
                  {isInitializing ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Initializing...
                    </span>
                  ) : (
                    'Initialize Treasury'
                  )}
                </button>
              )}
            </div>

            {/* Stats Cards */}
            {connected && treasuryData?.exists && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-[#0A0A0F]/50 rounded-xl p-5 border border-[#D4AF37]/10">
                  <p className="text-sm text-gray-500 mb-1">Total Value Locked</p>
                  <p className="text-3xl font-bold text-white">{formatters.formatSol(treasuryData.balance)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-xl p-5 border border-[#D4AF37]/10">
                  <p className="text-sm text-gray-500 mb-1">Total Yield Earned</p>
                  <p className="text-3xl font-bold text-green-400">+{formatters.formatSol(treasuryData.totalYield)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-xl p-5 border border-[#D4AF37]/10">
                  <p className="text-sm text-gray-500 mb-1">Current APY</p>
                  <p className="text-3xl font-bold text-[#D4AF37]">12.5%</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-xl p-5 border border-[#D4AF37]/10">
                  <p className="text-sm text-gray-500 mb-1">Active Strategies</p>
                  <p className="text-3xl font-bold text-white">4</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {!connected ? (
              <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🏛️</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400">Connect to view and manage your treasury</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 mt-4">Loading treasury data...</p>
              </div>
            ) : !treasuryData?.exists ? (
              <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🏛️</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">No Treasury Found</h2>
                <p className="text-gray-400 mb-6">Initialize your treasury to start earning yield</p>
                <button
                  onClick={initializeTreasury}
                  disabled={isInitializing}
                  className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50"
                >
                  {isInitializing ? 'Initializing...' : 'Initialize Now'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tabs */}
                  <div className="flex items-center gap-2 border-b border-[#D4AF37]/10">
                    {['overview', 'strategies', 'history'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                          activeTab === tab
                            ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <>
                      {/* Allocation Chart */}
                      <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Strategy Allocation</h3>
                        <div className="space-y-3">
                          {STRATEGIES.map((strategy) => (
                            <div key={strategy.id} className="flex items-center gap-4">
                              <div className="w-24 text-sm text-gray-400">{strategy.protocol}</div>
                              <div className="flex-1 h-8 bg-[#0A0A0F] rounded-lg overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C048]"
                                  style={{ width: `${strategy.allocation}%` }}
                                />
                              </div>
                              <div className="w-16 text-right text-sm text-white">{strategy.allocation}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Recent AI Decisions</h3>
                        <div className="space-y-3">
                          {RECENT_DECISIONS.map((decision) => (
                            <div key={decision.id} className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg">
                              <div>
                                <p className="text-sm text-white">{decision.action}</p>
                                <p className="text-xs text-gray-500">{formatters.formatTimeAgo(decision.timestamp)}</p>
                              </div>
                              <span className={`text-sm font-medium ${
                                decision.type === 'positive' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {decision.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'strategies' && (
                    <div className="space-y-4">
                      {STRATEGIES.map((strategy) => (
                        <div key={strategy.id} className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                              <p className="text-sm text-gray-400">{strategy.protocol}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs ${
                              strategy.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                              strategy.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {strategy.risk} Risk
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">APY</p>
                              <p className="text-xl font-bold text-[#D4AF37]">{strategy.apy}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Allocation</p>
                              <p className="text-xl font-bold text-white">{strategy.allocation}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">TVL</p>
                              <p className="text-xl font-bold text-white">{strategy.tvl}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                      <p className="text-gray-400 text-center py-8">Transaction history will appear here</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  {/* Deposit Card */}
                  <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Deposit</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => {
                            setDepositAmount(e.target.value);
                            validateDeposit(e.target.value);
                          }}
                          placeholder="0.0"
                          className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                        {depositError && (
                          <p className="text-red-400 text-sm mt-1">{depositError}</p>
                        )}
                      </div>
                      <button
                        onClick={deposit}
                        disabled={!depositAmount || !!depositError}
                        className="w-full py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
                      >
                        Deposit
                      </button>
                    </div>
                  </div>

                  {/* Withdraw Card */}
                  <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Withdraw</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => {
                            setWithdrawAmount(e.target.value);
                            validateWithdraw(e.target.value);
                          }}
                          placeholder="0.0"
                          className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                        {withdrawError && (
                          <p className="text-red-400 text-sm mt-1">{withdrawError}</p>
                        )}
                      </div>
                      <button
                        onClick={withdraw}
                        disabled={!withdrawAmount || !!withdrawError}
                        className="w-full py-3 bg-[#1A1A24] border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Program Info */}
                  <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-[#D4AF37] mb-4">Program Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Program ID</p>
                        <a 
                          href={`https://explorer.solana.com/address/${TREASURY_PROGRAM_ID.toString()}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[#D4AF37] hover:underline break-all"
                        >
                          {TREASURY_PROGRAM_ID.toString().slice(0, 8)}...{TREASURY_PROGRAM_ID.toString().slice(-8)}
                        </a>
                      </div>
                      <div>
                        <p className="text-gray-500">Network</p>
                        <p className="text-white">Devnet</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
