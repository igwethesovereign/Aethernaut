'use client';

import { useWallet } from '@solana/wallet-adapter-react';

export function PredictionMarketCard() {
  const { connected } = useWallet();

  return (
    <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#D4AF37]">Prediction Engine</h3>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className="text-green-400">Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Program</span>
          <span className="font-mono text-sm text-[#D4AF37]/70">
            FT89ec...bLUX
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Active Markets</span>
          <span className="text-white font-semibold">--</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Volume</span>
          <span className="text-[#D4AF37]">-- SOL</span>
        </div>
      </div>

      {connected && (
        <button className="w-full mt-6 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors">
          View Markets
        </button>
      )}
    </div>
  );
}
