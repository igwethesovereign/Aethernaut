'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

// Admin wallet address (the deployer)
const ADMIN_WALLET = new PublicKey('6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y');

export function useAdmin() {
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      setIsAdmin(publicKey.equals(ADMIN_WALLET));
      setIsLoading(false);
    } else {
      setIsAdmin(false);
      setIsLoading(true);
    }
  }, [connected, publicKey]);

  return { isAdmin, isLoading, connected };
}
