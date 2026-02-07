'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';

const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');

const AGENT_TYPES = [
  { id: 'scout', name: 'Scout', description: 'Discovers opportunities and analyzes markets', color: 'blue' },
  { id: 'sentinel', name: 'Sentinel', description: 'Monitors and protects treasury assets', color: 'red' },
  { id: 'arbiter', name: 'Arbiter', description: 'Validates decisions and resolves disputes', color: 'purple' },
  { id: 'scribe', name: 'Scribe', description: 'Records and reports on-chain activity', color: 'green' },
];

const SAMPLE_AGENTS = [
  { id: 1, name: 'Alpha Scout', type: 'Scout', reputation: 850, tasks: 42, earnings: '125.5 SOL' },
  { id: 2, name: 'Guardian Sentinel', type: 'Sentinel', reputation: 920, tasks: 156, earnings: '340.2 SOL' },
  { id: 3, name: 'Justice Arbiter', type: 'Arbiter', reputation: 780, tasks: 23, earnings: '89.3 SOL' },
];

export default function AgentsPage() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('scout');
  const [agentName, setAgentName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      checkRegistration();
    }
  }, [connected, publicKey]);

  const checkRegistration = async () => {
    // Check if user has an agent
    setIsRegistered(false); // Placeholder
  };

  const createAgent = async () => {
    alert(`Creating ${agentName} as ${selectedType} - This would call the program`);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Agent Nexus</h1>
            <p className="text-gray-400">Reputation-based marketplace for specialized AI agents</p>
          </div>
          {connected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
            >
              Create Agent
            </button>
          )}
        </div>

        {!connected ? (
          <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect to register as an agent or hire agents</p>
          </div>
        ) : (
          <>
            {/* Agent Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {AGENT_TYPES.map((type) => (
                <div key={type.id} className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
                  <div className={`w-12 h-12 rounded-lg bg-${type.color}-500/20 flex items-center justify-center mb-4`}>
                    <span className="text-2xl">
                      {type.id === 'scout' && '🔍'}
                      {type.id === 'sentinel' && '🛡️'}
                      {type.id === 'arbiter' && '⚖️'}
                      {type.id === 'scribe' && '📜'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </div>
              ))}
            </div>

            {/* Active Agents */}
            <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#D4AF37]/20">
                <h2 className="text-xl font-semibold text-[#D4AF37]">Active Agents</h2>
              </div>
              <div className="divide-y divide-[#D4AF37]/10">
                {SAMPLE_AGENTS.map((agent) => (
                  <div key={agent.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#D4AF37]/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <span className="text-[#D4AF37]">{agent.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="text-[#D4AF37] font-semibold">{agent.reputation}</p>
                        <p className="text-gray-500">Reputation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">{agent.tasks}</p>
                        <p className="text-gray-500">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-green-400 font-semibold">{agent.earnings}</p>
                        <p className="text-gray-500">Earned</p>
                      </div>
                      <button className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors">
                        Hire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Create Your Agent</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AGENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedType === type.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20'
                            : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <p className="font-semibold text-[#D4AF37]">{type.name}</p>
                        <p className="text-xs text-gray-400">{type.description.slice(0, 30)}...</p>
                      </button>
                    ))}
                  </div>
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
                  onClick={createAgent}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
