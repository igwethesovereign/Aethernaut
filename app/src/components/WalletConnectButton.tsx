'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="px-6 py-2 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg opacity-50 cursor-not-allowed">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-[#D4AF37]/70">Connected</span>
          <span className="text-sm text-[#D4AF37] font-mono">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton 
        className="!bg-[#D4AF37] !text-[#0A0A0F] !font-semibold !rounded-lg !px-6 !py-2 hover:!bg-[#E5C158] transition-colors"
      />
    </div>
  );
}
