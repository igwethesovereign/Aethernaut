'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';

const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');

export default function TreasuryPage() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [treasuryData, setTreasuryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    if (connected && publicKey) {
      fetchTreasuryData();
    }
  }, [connected, publicKey]);

  const fetchTreasuryData = async () => {
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
          exists: true
        });
      } else {
        setTreasuryData({ exists: false });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTreasury = async () => {
    alert('Initialize Treasury - This would call the Anchor program instruction');
  };

  const deposit = async () => {
    alert(`Deposit ${depositAmount} SOL - This would call the deposit instruction`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Treasury</h1>
          <p className="text-gray-400">Self-governing capital with AI-driven yield optimization</p>
        </div>

        {!connected ? (
          <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">🏛️</div>
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">Connect your wallet to view and manage your treasury</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Treasury Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-[#D4AF37]">Your Treasury</h2>
                  <div className={`px-3 py-1 rounded-full text-sm ${treasuryData?.exists ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {treasuryData?.exists ? 'Active' : 'Not Created'}
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : treasuryData?.exists ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0A0A0F] rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Balance</p>
                        <p className="text-3xl font-bold text-[#D4AF37]">{treasuryData.balance.toFixed(4)} SOL</p>
                      </div>
                      <div className="bg-[#0A0A0F] rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Yield Earned</p>
                        <p className="text-3xl font-bold text-green-400">0.00 SOL</p>
                      </div>
                    </div>
                    <div className="bg-[#0A0A0F] rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Treasury Address</p>
                      <p className="font-mono text-sm text-[#D4AF37] break-all">{treasuryData.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">You don&apos;t have a treasury yet</p>
                    <button
                      onClick={initializeTreasury}
                      className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
                    >
                      Initialize Treasury
                    </button>
                  </div>
                )}
              </div>

              {/* Deposit Section */}
              {treasuryData?.exists && (
                <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#D4AF37] mb-4">Deposit Funds</h3>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Amount in SOL"
                      className="flex-1 bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={deposit}
                      className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Program Info */}
              <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Program Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Program ID</p>
                    <a 
                      href={`https://explorer.solana.com/address/${TREASURY_PROGRAM_ID.toString()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#D4AF37] hover:underline break-all"
                    >
                      {TREASURY_PROGRAM_ID.toString()}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-400">Network</p>
                    <p className="text-white">Devnet</p>
                  </div>
                </div>
              </div>

              {/* Strategy Info */}
              <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">AI Strategy</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="text-yellow-400">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected APY</span>
                    <span className="text-green-400">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rebalance</span>
                    <span className="text-white">Daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
