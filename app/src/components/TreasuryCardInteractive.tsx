'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');

export function TreasuryCardInteractive() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [treasuryBalance, setTreasuryBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTreasuryInfo();
    }
  }, [connected, publicKey]);

  const fetchTreasuryInfo = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      // Calculate Treasury PDA
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), publicKey.toBuffer()],
        TREASURY_PROGRAM_ID
      );
      
      // Fetch account info
      const accountInfo = await connection.getAccountInfo(treasuryPda);
      if (accountInfo) {
        // Parse account data (simplified - in production use proper IDL decoding)
        setTreasuryBalance(accountInfo.lamports / 1e9);
      } else {
        setTreasuryBalance(0);
      }
    } catch (error) {
      console.error('Error fetching treasury:', error);
      setTreasuryBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTreasury = async () => {
    // This would call the actual initialize instruction
    alert('Initialize treasury - Integration ready! In production, this would call treasuryProgram.methods.initialize()');
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#D4AF37]">Treasury</h3>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Program</span>
          <a 
            href={`https://explorer.solana.com/address/${TREASURY_PROGRAM_ID.toString()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
          >
            {TREASURY_PROGRAM_ID.toString().slice(0, 4)}...{TREASURY_PROGRAM_ID.toString().slice(-4)}
          </a>
        </div>
        
        {connected ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Treasury</span>
              <span className="text-white font-semibold">
                {isLoading ? 'Loading...' : treasuryBalance !== null ? `${treasuryBalance.toFixed(4)} SOL` : 'Not initialized'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={treasuryBalance !== null ? 'text-green-400' : 'text-yellow-400'}>
                {treasuryBalance !== null ? 'Active' : 'Not Created'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Connect wallet to view your treasury
          </div>
        )}
      </div>

      {connected && (
        <button 
          onClick={treasuryBalance === null ? initializeTreasury : fetchTreasuryInfo}
          className="w-full mt-6 py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
        >
          {treasuryBalance === null ? 'Initialize Treasury' : 'Refresh'}
        </button>
      )}
    </div>
  );
}
