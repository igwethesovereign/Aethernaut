'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/Loading';
import { validators, errorHandlers, formatters } from '@/lib/utils';

const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');

const AGENT_TYPES = [
  { id: 'scout', name: 'Scout', description: 'Discovers opportunities and analyzes markets', color: 'blue', icon: '🔍' },
  { id: 'sentinel', name: 'Sentinel', description: 'Monitors and protects treasury assets', color: 'red', icon: '🛡️' },
  { id: 'arbiter', name: 'Arbiter', description: 'Validates decisions and resolves disputes', color: 'purple', icon: '⚖️' },
  { id: 'scribe', name: 'Scribe', description: 'Records and reports on-chain activity', color: 'green', icon: '📜' },
] as const;

type AgentType = typeof AGENT_TYPES[number]['id'];

interface Agent {
  id: number;
  name: string;
  type: AgentType;
  avatar: string;
  reputation: number;
  completedTasks: number;
  earnings: number; // in SOL
  hourlyRate: number; // in SOL
  skills: string[];
  description: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  reviews: number;
  address?: string;
}

const SAMPLE_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Alpha Scout',
    type: 'scout',
    avatar: '🔍',
    reputation: 950,
    completedTasks: 156,
    earnings: 245.5,
    hourlyRate: 0.5,
    skills: ['Market Analysis', 'Yield Farming', 'DeFi Research', 'Risk Assessment'],
    description: 'Expert in discovering high-yield opportunities across Solana DeFi protocols.',
    availability: 'available',
    rating: 4.9,
    reviews: 128,
    address: 'AlphaScout111111111111111111111111111111111',
  },
  {
    id: 2,
    name: 'Guardian Sentinel',
    type: 'sentinel',
    avatar: '🛡️',
    reputation: 920,
    completedTasks: 312,
    earnings: 580.2,
    hourlyRate: 0.8,
    skills: ['Security Audit', 'Risk Monitoring', 'Fraud Detection', 'Asset Protection'],
    description: '24/7 monitoring and protection of treasury assets with real-time alerts.',
    availability: 'available',
    rating: 5.0,
    reviews: 245,
    address: 'GuardianSentinel11111111111111111111111111',
  },
  {
    id: 3,
    name: 'Justice Arbiter',
    type: 'arbiter',
    avatar: '⚖️',
    reputation: 880,
    completedTasks: 89,
    earnings: 178.9,
    hourlyRate: 1.0,
    skills: ['Decision Validation', 'Dispute Resolution', 'Consensus Building', 'Governance'],
    description: 'Fair and transparent arbitration of treasury decisions and agent disputes.',
    availability: 'busy',
    rating: 4.8,
    reviews: 67,
    address: 'JusticeArbiter111111111111111111111111111',
  },
  {
    id: 4,
    name: 'Chronicle Scribe',
    type: 'scribe',
    avatar: '📜',
    reputation: 840,
    completedTasks: 234,
    earnings: 156.3,
    hourlyRate: 0.3,
    skills: ['Data Recording', 'Report Generation', 'Analytics', 'Documentation'],
    description: 'Comprehensive on-chain activity recording and performance analytics.',
    availability: 'available',
    rating: 4.7,
    reviews: 189,
    address: 'ChronicleScribe111111111111111111111111111',
  },
  {
    id: 5,
    name: 'Yield Hunter',
    type: 'scout',
    avatar: '🎯',
    reputation: 890,
    completedTasks: 98,
    earnings: 198.7,
    hourlyRate: 0.6,
    skills: ['Yield Optimization', 'LP Analysis', 'APY Tracking', 'Protocol Research'],
    description: 'Specialized in finding the highest APY opportunities with minimal risk.',
    availability: 'available',
    rating: 4.8,
    reviews: 89,
    address: 'YieldHunter1111111111111111111111111111111',
  },
  {
    id: 6,
    name: 'Vault Keeper',
    type: 'sentinel',
    avatar: '🔐',
    reputation: 910,
    completedTasks: 445,
    earnings: 720.1,
    hourlyRate: 0.9,
    skills: ['Multi-sig Management', 'Access Control', 'Emergency Response', 'Backup Systems'],
    description: 'Expert in secure multi-signature treasury management and emergency protocols.',
    availability: 'offline',
    rating: 4.9,
    reviews: 312,
    address: 'VaultKeeper11111111111111111111111111111111',
  },
];

const TYPE_COLORS: Record<AgentType, string> = {
  scout: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sentinel: 'bg-red-500/20 text-red-400 border-red-500/30',
  arbiter: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  scribe: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function AgentsPage() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const { addToast } = useToast();
  
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  
  // Form states
  const [taskDescription, setTaskDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [agentName, setAgentName] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('scout');
  
  // Validation errors
  const [taskError, setTaskError] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [nameError, setNameError] = useState('');

  const filteredAgents = selectedType === 'all' 
    ? agents 
    : agents.filter(a => a.type === selectedType);

  const getAvailabilityColor = (status: Agent['availability']) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400';
      case 'offline': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const validateTask = useCallback((): boolean => {
    if (!validators.isValidLength(taskDescription, 10, 500)) {
      setTaskError('Description must be 10-500 characters');
      return false;
    }
    setTaskError('');
    return true;
  }, [taskDescription]);

  const validateBudget = useCallback((): boolean => {
    const validation = validators.isValidSolAmount(budget);
    if (!validation.valid) {
      setBudgetError(validation.error || 'Invalid amount');
      return false;
    }
    setBudgetError('');
    return true;
  }, [budget]);

  const validateDeadline = useCallback((): boolean => {
    if (!deadline) {
      setDeadlineError('Deadline is required');
      return false;
    }
    const timestamp = new Date(deadline).getTime() / 1000;
    const validation = validators.isValidDeadline(timestamp);
    if (!validation.valid) {
      setDeadlineError(validation.error || 'Invalid deadline');
      return false;
    }
    setDeadlineError('');
    return true;
  }, [deadline]);

  const validateName = useCallback((): boolean => {
    if (!validators.isValidLength(agentName, 3, 50)) {
      setNameError('Name must be 3-50 characters');
      return false;
    }
    setNameError('');
    return true;
  }, [agentName]);

  const hireAgent = async () => {
    if (!validateTask() || !validateBudget()) return;
    if (!publicKey || !sendTransaction) {
      addToast('Wallet not connected', 'error');
      return;
    }
    if (!selectedAgent) return;

    setIsHiring(true);
    try {
      // Create escrow transaction
      const escrowAmount = parseFloat(budget) * LAMPORTS_PER_SOL;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(selectedAgent.address || publicKey),
          lamports: escrowAmount,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      addToast(`Hired ${selectedAgent.name} for ${formatters.formatSol(parseFloat(budget))}`, 'success');
      setShowHireModal(false);
      setTaskDescription('');
      setBudget('');
      setDeadline('');
      
      // Update agent status
      setAgents(prev => prev.map(a => 
        a.id === selectedAgent.id ? { ...a, availability: 'busy' } : a
      ));
    } catch (error: any) {
      console.error('Hire error:', error);
      addToast(errorHandlers.handleWalletError(error), 'error');
    } finally {
      setIsHiring(false);
    }
  };

  const createAgent = async () => {
    if (!validateName()) return;
    if (!publicKey) {
      addToast('Wallet not connected', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      // In production, this would call the registry program
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAgent: Agent = {
        id: agents.length + 1,
        name: agentName,
        type: selectedAgentType,
        avatar: AGENT_TYPES.find(t => t.id === selectedAgentType)?.icon || '🤖',
        reputation: 500,
        completedTasks: 0,
        earnings: 0,
        hourlyRate: 0.5,
        skills: ['General Purpose'],
        description: 'Newly registered agent',
        availability: 'available',
        rating: 0,
        reviews: 0,
        address: publicKey.toString(),
      };
      
      setAgents(prev => [...prev, newAgent]);
      addToast(`Agent "${agentName}" registered successfully`, 'success');
      setShowCreateModal(false);
      setAgentName('');
      setSelectedAgentType('scout');
    } catch (error: any) {
      console.error('Registration error:', error);
      addToast(errorHandlers.handleProgramError(error), 'error');
    } finally {
      setIsRegistering(false);
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
                <h1 className="text-4xl sm:text-5xl font-bold text-[#D4AF37] mb-2">Agent Nexus</h1>
                <p className="text-gray-400 text-lg">Hire specialized AI agents for your treasury operations</p>
              </div>
              {connected && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-xl hover:bg-[#E5C048] transition-colors"
                >
                  Register as Agent
                </button>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">{agents.length}</p>
                <p className="text-sm text-gray-500">Active Agents</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">{agents.reduce((sum, a) => sum + a.completedTasks, 0)}</p>
                <p className="text-sm text-gray-500">Tasks Completed</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-white">{formatters.formatSol(agents.reduce((sum, a) => sum + a.earnings, 0))}</p>
                <p className="text-sm text-gray-500">SOL Earned</p>
              </div>
              <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-[#D4AF37]/10">
                <p className="text-2xl font-bold text-[#D4AF37]">{formatters.formatPercent(agents.reduce((sum, a) => sum + a.rating, 0) / agents.length)}</p>
                <p className="text-sm text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Types Filter */}
        <div className="border-b border-[#D4AF37]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-[#D4AF37] text-[#0A0A0F]'
                  : 'bg-[#1A1A24] text-gray-400 hover:text-[#D4AF37] border border-[#D4AF37]/20'
              }`}
            >
              All
            </button>
            {AGENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.id
                    ? 'bg-[#D4AF37] text-[#0A0A0F]'
                    : 'bg-[#1A1A24] text-gray-400 hover:text-[#D4AF37] border border-[#D4AF37]/20'
                }`}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {!connected ? (
              <div className="bg-[#1A1A24]/50 border border-[#D4AF37]/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🤝</div>
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400">Connect to register as an agent or hire agents</p>
              </div>
            ) : (
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
                              {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
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
                          <span className="text-white font-medium">{agent.rating.toFixed(1)}</span>
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
                          <p className="text-lg font-bold text-[#D4AF37]">{formatters.formatCompact(agent.earnings)}</p>
                          <p className="text-xs text-gray-500">Earned</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">{formatters.formatSol(agent.hourlyRate)}/h</p>
                          <p className="text-xs text-gray-500">Rate</p>
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
                        disabled={agent.availability !== 'available'}
                        className="w-full py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {agent.availability !== 'available' ? 'Unavailable' : 'Hire Agent'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hire Modal */}
        {showHireModal && selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm text-gray-400 mb-2">Task Description *</label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => {
                      setTaskDescription(e.target.value);
                      validateTask();
                    }}
                    placeholder="Describe the task you want the agent to perform..."
                    rows={4}
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                  {taskError && <p className="text-red-400 text-sm mt-1">{taskError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Budget (SOL) *</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        validateBudget();
                      }}
                      placeholder="0.0"
                      step="0.001"
                      className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                    {budgetError && <p className="text-red-400 text-sm mt-1">{budgetError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Deadline</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        validateDeadline();
                      }}
                      className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    {deadlineError && <p className="text-red-400 text-sm mt-1">{deadlineError}</p>}
                  </div>
                </div>

                <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#D4AF37]/10">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Agent Rating</span>
                    <span className="text-[#D4AF37]">★ {selectedAgent.rating.toFixed(1)} ({selectedAgent.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Hourly Rate</span>
                    <span className="text-white">{formatters.formatSol(selectedAgent.hourlyRate)}/h</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10">
                <button
                  onClick={hireAgent}
                  disabled={isHiring || !taskDescription || !budget || !!taskError || !!budgetError}
                  className="w-full py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-xl hover:bg-[#E5C048] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isHiring ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Hire'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-[#D4AF37]/10">
                <h2 className="text-2xl font-bold text-[#D4AF37]">Create Your Agent</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Name *</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => {
                      setAgentName(e.target.value);
                      validateName();
                    }}
                    placeholder="Enter agent name"
                    className="w-full bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                  {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AGENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedAgentType(type.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedAgentType === type.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20'
                            : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <p className="font-semibold text-[#D4AF37]">{type.icon} {type.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{type.description.slice(0, 30)}...</p>
                      </button>
                    ))}
                  </div>
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
                  onClick={createAgent}
                  disabled={isRegistering || !agentName || !!nameError}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating...
                    </>
                  ) : (
                    'Create Agent'
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
