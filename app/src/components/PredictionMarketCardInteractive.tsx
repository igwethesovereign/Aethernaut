'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

// Sample prediction markets for demo
const DEMO_MARKETS = [
  { id: 1, question: 'Will SOL reach $200 by end of 2026?', yesVolume: 150, noVolume: 75 },
  { id: 2, question: 'Will treasury yield exceed 10%?', yesVolume: 200, noVolume: 50 },
];

export function PredictionMarketCardInteractive() {
  const { connected } = useWallet();
  const [activeMarkets, setActiveMarkets] = useState(DEMO_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);

  const createMarket = async () => {
    alert('Create Prediction Market - Integration ready! In production, this would call marketProgram.methods.createPredictionMarket()');
  };

  const placeBet = (marketId: number, position: 'yes' | 'no') => {
    alert(`Place ${position.toUpperCase()} bet on market ${marketId} - Integration ready!`);
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#D4AF37]">Prediction Engine</h3>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Program</span>
          <a 
            href={`https://explorer.solana.com/address/${MARKET_PROGRAM_ID.toString()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
          >
            {MARKET_PROGRAM_ID.toString().slice(0, 4)}...{MARKET_PROGRAM_ID.toString().slice(-4)}
          </a>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Active Markets</span>
          <span className="text-white font-semibold">{activeMarkets.length}</span>
        </div>
        
        {connected && activeMarkets.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400">Live Markets:</p>
            {activeMarkets.map((market) => (
              <div key={market.id} className="bg-[#0A0A0F] rounded-lg p-3 text-sm">
                <p className="text-[#D4AF37] mb-2">{market.question}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => placeBet(market.id, 'yes')}
                    className="flex-1 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                  >
                    YES {market.yesVolume} SOL
                  </button>
                  <button 
                    onClick={() => placeBet(market.id, 'no')}
                    className="flex-1 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    NO {market.noVolume} SOL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {connected && (
        <button 
          onClick={createMarket}
          className="w-full mt-6 py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
        >
          Create Market
        </button>
      )}
    </div>
  );
}
