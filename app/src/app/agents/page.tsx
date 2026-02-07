'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');

interface Agent {
  id: number;
  name: string;
  type: 'Scout' | 'Sentinel' | 'Arbiter' | 'Scribe';
  avatar: string;
  reputation: number;
  completedTasks: number;
  earnings: string;
  hourlyRate: string;
  skills: string[];
  description: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  reviews: number;
}

const AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Alpha Scout',
    type: 'Scout',
    avatar: '🔍',
    reputation: 950,
    completedTasks: 156,
    earnings: '245.5 SOL',
    hourlyRate: '0.5 SOL',
    skills: ['Market Analysis', 'Yield Farming', 'DeFi Research', 'Risk Assessment'],
    description: 'Expert in discovering high-yield opportunities across Solana DeFi protocols.',
    availability: 'available',
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: 'Guardian Sentinel',
    type: 'Sentinel',
    avatar: '🛡️',
    reputation: 920,
    completedTasks: 312,
    earnings: '580.2 SOL',
    hourlyRate: '0.8 SOL',
    skills: ['Security Audit', 'Risk Monitoring', 'Fraud Detection', 'Asset Protection'],
    description: '24/7 monitoring and protection of treasury assets with real-time alerts.',
    availability: 'available',
    rating: 5.0,
    reviews: 245,
  },
  {
    id: 3,
    name: 'Justice Arbiter',
    type: 'Arbiter',
    avatar: '⚖️',
    reputation: 880,
    completedTasks: 89,
    earnings: '178.9 SOL',
    hourlyRate: '1.0 SOL',
    skills: ['Decision Validation', 'Dispute Resolution', 'Consensus Building', 'Governance'],
    description: 'Fair and transparent arbitration of treasury decisions and agent disputes.',
    availability: 'busy',
    rating: 4.8,
    reviews: 67,
  },
  {
    id: 4,
    name: 'Chronicle Scribe',
    type: 'Scribe',
    avatar: '📜',
    reputation: 840,
    completedTasks: 234,
    earnings: '156.3 SOL',
    hourlyRate: '0.3 SOL',
    skills: ['Data Recording', 'Report Generation', 'Analytics', 'Documentation'],
    description: 'Comprehensive on-chain activity recording and performance analytics.',
    availability: 'available',
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 5,
    name: 'Yield Hunter',
    type: 'Scout',
    avatar: '🎯',
    reputation: 890,
    completedTasks: 98,
    earnings: '198.7 SOL',
    hourlyRate: '0.6 SOL',
    skills: ['Yield Optimization', 'LP Analysis', 'APY Tracking', 'Protocol Research'],
    description: 'Specialized in finding the highest APY opportunities with minimal risk.',
    availability: 'available',
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 6,
    name: 'Vault Keeper',
    type: 'Sentinel',
    avatar: '🔐',
    reputation: 910,
    completedTasks: 445,
    earnings: '720.1 SOL',
    hourlyRate: '0.9 SOL',
    skills: ['Multi-sig Management', 'Access Control', 'Emergency Response', 'Backup Systems'],
    description: 'Expert in secure multi-signature treasury management and emergency protocols.',
    availability: 'offline',
    rating: 4.9,
    reviews: 312,
  },
];

const AGENT_TYPES = ['All', 'Scout', 'Sentinel', 'Arbiter', 'Scribe'];

const TYPE_COLORS: Record<string, string> = {
  Scout: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Sentinel: 'bg-red-500/20 text-red-400 border-red-500/30',
  Arbiter: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Scribe: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function AgentsPage() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [budget, setBudget] = useState('');

  const filteredAgents = selectedType === 'All' 
    ? AGENTS 
    : AGENTS.filter(a => a.type === selectedType);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400';
      case 'offline': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const hireAgent = () => {
    alert(`Hiring ${selectedAgent?.name} for task: ${taskDescription} with budget ${budget} SOL`);
    setShowHireModal(false);
    setTaskDescription('');
    setBudget('');
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
                <h1 className="text-4xl sm:text-5xl font-bold text-[#D4AF37] mb-2">Agent Nexus</h1>
                <p className="text-gray-400 text-lg">Hire specialized AI agents for your treasury operations</p>
              </div>
              <div className="flex items-center gap-4">
                {connected && (
                  <Link 
                    href="/agents/register"
                    className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-xl hover:bg-[#E5C048] transition-colors"
                  >
                    Register as Agent
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">6</p>
                <p className="text-sm text-gray-500">Active Agents</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">1,334</p>
                <p className="text-sm text-gray-500">Tasks Completed</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">2,080</p>
                <p className="text-sm text-gray-500">SOL Earned</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">4.8</p>
                <p className="text-sm text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Types Filter */}
        <div className="border-b border-[#D4AF37]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
            {AGENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-[#D4AF37] text-[#0A0A0F]'
                    : 'bg-[#1A1A24] text-gray-400 hover:text-[#D4AF37] border border-[#D4AF37]/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div 
                  key={agent.id}
                  className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#D4AF37]/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#0A0A0F] border-2 border-[#D4AF37]/30 flex items-center justify-center text-3xl">
                          {agent.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{agent.name}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs border ${TYPE_COLORS[agent.type]}`}>
                            {agent.type}
                          </span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getAvailabilityColor(agent.availability)}`}>
                        {agent.availability}
                      </div>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-[#D4AF37]">★</span>
                        <span className="text-white font-medium">{agent.rating}</span>
                        <span className="text-gray-500">({agent.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>🏆</span>
                        <span>{agent.reputation} rep</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-[#0A0A0F] text-gray-400 text-xs rounded border border-[#D4AF37]/10">
                          {skill}
                        </span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span className="px-2 py-1 bg-[#0A0A0F] text-gray-500 text-xs rounded border border-[#D4AF37]/10">
                          +{agent.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-[#D4AF37]/10">
                      <div>
                        <p className="text-lg font-bold text-white">{agent.completedTasks}</p>
                        <p className="text-xs text-gray-500">Tasks</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#D4AF37]">{agent.earnings.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">Earned</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{agent.hourlyRate}</p>
                        <p className="text-xs text-gray-500">/hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 border-t border-[#D4AF37]/10">
                    <button
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowHireModal(true);
                      }}
                      disabled={agent.availability !== 'available' || !connected}
                      className="w-full py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!connected ? 'Connect Wallet' : agent.availability !== 'available' ? 'Unavailable' : 'Hire Agent'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hire Modal */}
        {showHireModal && selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#D4AF37]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedAgent.avatar}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs border ${TYPE_COLORS[selectedAgent.type]}`}>
                        {selectedAgent.type}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowHireModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Task Description</label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe the task you want the agent to perform..."
                    rows={4}
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Budget (SOL)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Hourly Rate</label>
                    <div className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#D4AF37] font-semibold">
                      {selectedAgent.hourlyRate}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#D4AF37]/10">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Agent Rating</span>
                    <span className="text-[#D4AF37]">★ {selectedAgent.rating} ({selectedAgent.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-green-400">98.5%</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10">
                <button
                  onClick={hireAgent}
                  disabled={!taskDescription || !budget}
                  className="w-full py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Hire
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
