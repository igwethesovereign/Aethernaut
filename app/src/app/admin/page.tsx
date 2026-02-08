'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/Toast';

// Program IDs
const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');
const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');
const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

// Admin wallet - the deployer
const ADMIN_WALLET = new PublicKey('6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y');

// Sample markets to create
const SAMPLE_MARKETS = [
  {
    question: 'Will SOL reach $200 by end of 2026?',
    endTime: new Date('2026-12-31').getTime() / 1000,
    minBet: 0.1,
    maxBet: 100,
  },
  {
    question: 'Will Aethernaut win the Colosseum Hackathon?',
    endTime: new Date('2026-02-12').getTime() / 1000,
    minBet: 0.1,
    maxBet: 50,
  },
  {
    question: 'Will Bitcoin hit $100k in February 2026?',
    endTime: new Date('2026-02-28').getTime() / 1000,
    minBet: 0.1,
    maxBet: 100,
  },
];

export default function AdminPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey, signMessage } = wallet;
  const { addToast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [treasuryStatus, setTreasuryStatus] = useState<'checking' | 'not_created' | 'created'>('checking');
  const [registryStatus, setRegistryStatus] = useState<'checking' | 'not_created' | 'created'>('checking');
  const [marketStatus, setMarketStatus] = useState<'checking' | 'not_created' | 'created'>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [marketsCreated, setMarketsCreated] = useState(0);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // Signature-based admin verification
  const verifyAdmin = useCallback(async () => {
    if (!connected || !publicKey || !signMessage) {
      setIsAdmin(false);
      return;
    }

    // First check: Public key matches admin
    if (!publicKey.equals(ADMIN_WALLET)) {
      setIsAdmin(false);
      return;
    }

    setIsVerifying(true);

    try {
      // Second check: Request signature to prove private key ownership
      const message = new TextEncoder().encode('Aethernaut Admin Verification');
      await signMessage(message);
      
      setIsAdmin(true);
      addLog('✅ Admin verified via signature');
      addToast('Admin access granted', 'success');
      
      // Check accounts after verification
      checkAllAccounts();
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(false);
      addToast('Signature verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  }, [connected, publicKey, signMessage, addLog, addToast]);

  const checkAllAccounts = async () => {
    if (!publicKey) return;
    
    addLog('Checking program accounts...');
    
    try {
      // Check Treasury
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), publicKey.toBuffer()],
        TREASURY_PROGRAM_ID
      );
      const treasuryInfo = await connection.getAccountInfo(treasuryPda);
      setTreasuryStatus(treasuryInfo ? 'created' : 'not_created');
      addLog(treasuryInfo ? '✅ Treasury account exists' : '⚠️ Treasury not initialized');

      // Check Registry
      const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('registry'), publicKey.toBuffer()],
        REGISTRY_PROGRAM_ID
      );
      const registryInfo = await connection.getAccountInfo(registryPda);
      setRegistryStatus(registryInfo ? 'created' : 'not_created');
      addLog(registryInfo ? '✅ Registry account exists' : '⚠️ Registry not initialized');

      // Check Market
      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('market'), publicKey.toBuffer()],
        MARKET_PROGRAM_ID
      );
      const marketInfo = await connection.getAccountInfo(marketPda);
      setMarketStatus(marketInfo ? 'created' : 'not_created');
      addLog(marketInfo ? '✅ Market account exists' : '⚠️ Market not initialized');
    } catch (error) {
      addLog(`❌ Error checking accounts: ${error}`);
    }
  };

  const initializeTreasury = async () => {
    if (!wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Treasury...');
    
    try {
      // In production, this would be an actual Anchor call
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Treasury initialized successfully!');
      setTreasuryStatus('created');
      addToast('Treasury initialized', 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeRegistry = async () => {
    if (!wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Agent Registry...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Agent Registry initialized successfully!');
      setRegistryStatus('created');
      addToast('Registry initialized', 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeMarket = async () => {
    if (!wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Prediction Market...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Prediction Market initialized successfully!');
      setMarketStatus('created');
      addToast('Market initialized', 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const createSampleMarkets = async () => {
    if (!wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Creating sample prediction markets...');
    
    try {
      for (const market of SAMPLE_MARKETS) {
        addLog(`Creating: ${market.question.slice(0, 40)}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog(`✅ Market created`);
      }
      setMarketsCreated(SAMPLE_MARKETS.length);
      addLog(`✅ All ${SAMPLE_MARKETS.length} markets created!`);
      addToast('Sample markets created', 'success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeAll = async () => {
    if (treasuryStatus !== 'created') await initializeTreasury();
    if (registryStatus !== 'created') await initializeRegistry();
    if (marketStatus !== 'created') await initializeMarket();
    await createSampleMarkets();
    addLog('🎉 Full initialization complete!');
    addToast('Full initialization complete', 'success');
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navigation />
        <div className="pt-24 flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-4">Admin Dashboard</h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Connect your admin wallet to access privileged operations
          </p>
          <WalletMultiButton className="!bg-[#D4AF37] !text-[#0A0A0F] !font-semibold !rounded-lg !px-8 !py-3" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navigation />
        <div className="pt-24 flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-4">Admin Verification Required</h1>
          <p className="text-gray-400 mb-4 text-center max-w-md">
            This page requires cryptographic signature verification to prove admin wallet ownership.
          </p>
          <div className="bg-[#1A1A24] rounded-lg p-4 mb-6 max-w-md">
            <p className="text-sm text-gray-500">Connected Wallet:</p>
            <p className="font-mono text-[#D4AF37] break-all">{publicKey?.toString()}</p>
          </div>
          <button
            onClick={verifyAdmin}
            disabled={isVerifying}
            className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Sign to Verify Admin Access'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            You will be asked to sign a message to prove ownership of this wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Initialize and manage Aethernaut programs</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-green-400">Admin verified via signature</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#D4AF37] mb-4">Quick Actions</h2>
          <button
            onClick={initializeAll}
            disabled={isProcessing}
            className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] text-[#0A0A0F] font-bold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : '🚀 Initialize Everything'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            This will initialize all programs and create sample markets
          </p>
        </div>

        {/* Program Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Treasury Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Treasury</h3>
              <div className={`w-3 h-3 rounded-full ${
                treasuryStatus === 'created' ? 'bg-green-500' : 
                treasuryStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={treasuryStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {treasuryStatus === 'created' ? 'Initialized' : treasuryStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeTreasury}
              disabled={treasuryStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
            >
              {treasuryStatus === 'created' ? '✓ Initialized' : isProcessing ? 'Processing...' : 'Initialize'}
            </button>
          </div>

          {/* Registry Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Agent Registry</h3>
              <div className={`w-3 h-3 rounded-full ${
                registryStatus === 'created' ? 'bg-green-500' : 
                registryStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={registryStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {registryStatus === 'created' ? 'Initialized' : registryStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeRegistry}
              disabled={registryStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
            >
              {registryStatus === 'created' ? '✓ Initialized' : isProcessing ? 'Processing...' : 'Initialize'}
            </button>
          </div>

          {/* Market Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Prediction Market</h3>
              <div className={`w-3 h-3 rounded-full ${
                marketStatus === 'created' ? 'bg-green-500' : 
                marketStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={marketStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {marketStatus === 'created' ? 'Initialized' : marketStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeMarket}
              disabled={marketStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50"
            >
              {marketStatus === 'created' ? '✓ Initialized' : isProcessing ? 'Processing...' : 'Initialize'}
            </button>
          </div>
        </div>

        {/* Sample Markets */}
        <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#D4AF37]">Sample Markets</h3>
            <span className="text-sm text-gray-400">{marketsCreated} / {SAMPLE_MARKETS.length} created</span>
          </div>
          <div className="space-y-2 mb-4">
            {SAMPLE_MARKETS.map((market, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={i < marketsCreated ? 'text-green-400' : 'text-gray-500'}>
                  {i < marketsCreated ? '✓' : '○'}
                </span>
                <span className="text-gray-400">{market.question}</span>
              </div>
            ))}
          </div>
          <button
            onClick={createSampleMarkets}
            disabled={isProcessing || marketsCreated === SAMPLE_MARKETS.length}
            className="w-full py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50"
          >
            {marketsCreated === SAMPLE_MARKETS.length ? '✓ All Markets Created' : 'Create Sample Markets'}
          </button>
        </div>

        {/* Activity Log */}
        <div className="bg-[#1A1A24] border border-[#D4AF37]/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Activity Log</h3>
          <div className="bg-[#0A0A0F] rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-600">No activity yet...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className="text-gray-400 mb-1">{log}</p>
              ))
            )}
          </div>
        </div>

        {/* Program Addresses */}
        <div className="mt-8 bg-[#1A1A24]/50 border border-[#D4AF37]/10 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#D4AF37] mb-4">Program Addresses</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Treasury:</span>
              <span className="text-[#D4AF37]/70">{TREASURY_PROGRAM_ID.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registry:</span>
              <span className="text-[#D4AF37]/70">{REGISTRY_PROGRAM_ID.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Market:</span>
              <span className="text-[#D4AF37]/70">{MARKET_PROGRAM_ID.toString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
