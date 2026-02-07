'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');

export function AgentRegistryCardInteractive() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      checkRegistration();
    }
  }, [connected, publicKey]);

  const checkRegistration = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      // Check if user has an agent account
      const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('agent'), publicKey.toBuffer()],
        REGISTRY_PROGRAM_ID
      );
      
      const accountInfo = await connection.getAccountInfo(agentPda);
      setIsRegistered(!!accountInfo);
      setAgentCount(accountInfo ? 1 : 0);
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerAgent = async () => {
    alert('Register as Agent - Integration ready! In production, this would call registryProgram.methods.registerAgent()');
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#D4AF37]">Agent Nexus</h3>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Program</span>
          <a 
            href={`https://explorer.solana.com/address/${REGISTRY_PROGRAM_ID.toString()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
          >
            {REGISTRY_PROGRAM_ID.toString().slice(0, 4)}...{REGISTRY_PROGRAM_ID.toString().slice(-4)}
          </a>
        </div>
        
        {connected ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Status</span>
              <span className={isRegistered ? 'text-green-400' : 'text-yellow-400'}>
                {isLoading ? 'Checking...' : isRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Agent Type</span>
              <span className="text-[#D4AF37]">Scout</span>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Connect wallet to view agent status
          </div>
        )}
      </div>

      {connected && (
        <button 
          onClick={isRegistered ? checkRegistration : registerAgent}
          className="w-full mt-6 py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
        >
          {isRegistered ? 'View Profile' : 'Register as Agent'}
        </button>
      )}
    </div>
  );
}
