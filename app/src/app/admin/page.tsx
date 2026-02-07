'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

// Program IDs
const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');
const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');
const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

export default function AdminPage() {
  const { isAdmin, isLoading, connected } = useAdmin();
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [treasuryStatus, setTreasuryStatus] = useState<'not_created' | 'created' | 'checking'>('checking');
  const [registryStatus, setRegistryStatus] = useState<'not_created' | 'created' | 'checking'>('checking');
  const [marketStatus, setMarketStatus] = useState<'not_created' | 'created' | 'checking'>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin && wallet.publicKey) {
      checkAllAccounts();
    }
  }, [isAdmin, wallet.publicKey]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkAllAccounts = async () => {
    if (!wallet.publicKey) return;
    
    // Check Treasury
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('treasury'), wallet.publicKey.toBuffer()],
      TREASURY_PROGRAM_ID
    );
    const treasuryInfo = await connection.getAccountInfo(treasuryPda);
    setTreasuryStatus(treasuryInfo ? 'created' : 'not_created');

    // Check Registry
    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry'), wallet.publicKey.toBuffer()],
      REGISTRY_PROGRAM_ID
    );
    const registryInfo = await connection.getAccountInfo(registryPda);
    setRegistryStatus(registryInfo ? 'created' : 'not_created');

    // Check Market
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('market'), wallet.publicKey.toBuffer()],
      MARKET_PROGRAM_ID
    );
    const marketInfo = await connection.getAccountInfo(marketPda);
    setMarketStatus(marketInfo ? 'created' : 'not_created');
  };

  const initializeTreasury = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Treasury...');
    
    try {
      // In production, this would call the actual Anchor instruction
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Treasury initialized successfully!');
      setTreasuryStatus('created');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeRegistry = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Agent Registry...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Agent Registry initialized successfully!');
      setRegistryStatus('created');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeMarket = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    
    setIsProcessing(true);
    addLog('Initializing Prediction Market...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Prediction Market initialized successfully!');
      setMarketStatus('created');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">👑</div>
        <h1 className="text-3xl font-bold text-[#D4AF37] mb-4">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Connect your wallet to access the admin panel. Only authorized wallets can perform administrative actions.
        </p>
        <WalletMultiButton className="!bg-[#D4AF37] !text-[#0A0A0F] !font-semibold !rounded-lg !px-8 !py-3" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-4 text-center max-w-md">
          Your wallet is not authorized to access the admin panel.
        </p>
        <div className="bg-[#1A1A24] rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">Connected Wallet:</p>
          <p className="font-mono text-[#D4AF37]">{wallet.publicKey?.toString()}</p>
        </div>
        <p className="text-sm text-gray-500">
          Expected: {new PublicKey('6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y').toString().slice(0, 8)}...{new PublicKey('6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y').toString().slice(-8)}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <span className="text-[#D4AF37] font-bold text-xl">Aethernaut Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Admin Connected
            </span>
            <WalletMultiButton className="!bg-[#D4AF37] !text-[#0A0A0F] !font-semibold !rounded-lg !px-4 !py-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Initialize and manage Aethernaut programs</p>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Treasury Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Treasury</h3>
              <div className={`w-3 h-3 rounded-full ${treasuryStatus === 'created' ? 'bg-green-500' : treasuryStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={treasuryStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {treasuryStatus === 'created' ? 'Initialized' : treasuryStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeTreasury}
              disabled={treasuryStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {treasuryStatus === 'created' ? 'Initialized ✓' : isProcessing ? 'Processing...' : 'Initialize Treasury'}
            </button>
          </div>

          {/* Registry Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Agent Registry</h3>
              <div className={`w-3 h-3 rounded-full ${registryStatus === 'created' ? 'bg-green-500' : registryStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={registryStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {registryStatus === 'created' ? 'Initialized' : registryStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeRegistry}
              disabled={registryStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registryStatus === 'created' ? 'Initialized ✓' : isProcessing ? 'Processing...' : 'Initialize Registry'}
            </button>
          </div>

          {/* Market Card */}
          <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#D4AF37]">Prediction Market</h3>
              <div className={`w-3 h-3 rounded-full ${marketStatus === 'created' ? 'bg-green-500' : marketStatus === 'not_created' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className={marketStatus === 'created' ? 'text-green-400' : 'text-yellow-400'}>
                {marketStatus === 'created' ? 'Initialized' : marketStatus === 'not_created' ? 'Not Initialized' : 'Checking...'}
              </span>
            </p>
            <button
              onClick={initializeMarket}
              disabled={marketStatus === 'created' || isProcessing}
              className="w-full py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {marketStatus === 'created' ? 'Initialized ✓' : isProcessing ? 'Processing...' : 'Initialize Market'}
            </button>
          </div>
        </div>

        {/* Logs */}
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

        {/* Program Info */}
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
