'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export function TreasuryCard() {
  const { connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#D4AF37]">Treasury</h3>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className="text-green-400">Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Program</span>
          <span className="font-mono text-sm text-[#D4AF37]/70">
            Bovzoa...jST7
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">TVL</span>
          <span className="text-white font-semibold">-- SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Yield Strategy</span>
          <span className="text-[#D4AF37]">AI-Optimized</span>
        </div>
      </div>

      {connected && (
        <button className="w-full mt-6 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors">
          View Treasury
        </button>
      )}
    </div>
  );
}
