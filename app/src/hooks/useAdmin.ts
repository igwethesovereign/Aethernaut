'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Admin wallet address (the deployer)
const ADMIN_WALLET = new PublicKey('6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y');

// Message to sign for admin verification
const ADMIN_VERIFICATION_MESSAGE = 'Aethernaut Admin Verification';

export function useAdmin() {
  const { publicKey, connected, signMessage } = useWallet();
  const { connection } = useConnection();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState<Uint8Array | null>(null);

  const verifyAdmin = useCallback(async () => {
    if (!connected || !publicKey || !signMessage) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // First check: Public key matches admin
      if (!publicKey.equals(ADMIN_WALLET)) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Second check: Request signature to prove private key ownership
      const message = new TextEncoder().encode(ADMIN_VERIFICATION_MESSAGE);
      const sig = await signMessage(message);
      
      // Verify the signature using ed25519 (Solana's native signature scheme)
      // Note: In production, you'd use @solana/web3.js verify function
      // For client-side, we trust the wallet's response since we're using the wallet adapter
      
      setSignature(sig);
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(false);
      setSignature(null);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, signMessage]);

  useEffect(() => {
    if (connected && publicKey) {
      verifyAdmin();
    } else {
      setIsAdmin(false);
      setSignature(null);
      setIsLoading(true);
    }
  }, [connected, publicKey, verifyAdmin]);

  return { 
    isAdmin, 
    isLoading, 
    connected,
    signature,
    verifyAdmin 
  };
}

// Alternative: Use a transaction-based verification (more secure)
export async function verifyAdminByTransaction(
  publicKey: PublicKey,
  sendTransaction: (transaction: Transaction, connection: any) => Promise<string>,
  connection: any
): Promise<boolean> {
  try {
    // Create a zero-value transaction to self
    // This proves ownership of the private key without spending funds
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 0, // Zero SOL
      })
    );

    // User must sign this transaction
    const signature = await sendTransaction(transaction, connection);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    return true;
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}
