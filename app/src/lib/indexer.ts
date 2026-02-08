// Indexer integration for efficient data fetching
// Uses Helius API for enhanced Solana data retrieval

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
const HELIUS_RPC = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

import { Connection, PublicKey } from '@solana/web3.js';

// Program IDs
const TREASURY_PROGRAM_ID = new PublicKey('BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7');
const REGISTRY_PROGRAM_ID = new PublicKey('2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq');
const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

export class AethernautIndexer {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, 'confirmed');
  }

  // Fetch all prediction markets efficiently
  async getAllMarkets() {
    try {
      const accounts = await this.connection.getProgramAccounts(MARKET_PROGRAM_ID, {
        filters: [
          {
            dataSize: 1000, // Adjust based on your market account size
          },
        ],
      });

      return accounts.map(({ pubkey, account }) => ({
        address: pubkey.toString(),
        data: account.data,
        // Parse account data based on your program structure
      }));
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  // Fetch all registered agents
  async getAllAgents() {
    try {
      const accounts = await this.connection.getProgramAccounts(REGISTRY_PROGRAM_ID, {
        filters: [
          {
            dataSize: 500, // Adjust based on your agent account size
          },
        ],
      });

      return accounts.map(({ pubkey, account }) => ({
        address: pubkey.toString(),
        data: account.data,
      }));
    } catch (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
  }

  // Fetch user's treasury
  async getUserTreasury(userPubkey: PublicKey) {
    try {
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), userPubkey.toBuffer()],
        TREASURY_PROGRAM_ID
      );

      const account = await this.connection.getAccountInfo(treasuryPda);
      if (!account) return null;

      return {
        address: treasuryPda.toString(),
        balance: account.lamports,
        data: account.data,
      };
    } catch (error) {
      console.error('Error fetching treasury:', error);
      return null;
    }
  }

  // Fetch user's bets
  async getUserBets(userPubkey: PublicKey) {
    try {
      const accounts = await this.connection.getProgramAccounts(MARKET_PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 8, // Adjust based on your account structure
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      });

      return accounts.map(({ pubkey, account }) => ({
        address: pubkey.toString(),
        data: account.data,
      }));
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return [];
    }
  }

  // Get transaction history for a program
  async getProgramTransactions(programId: PublicKey, limit = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(programId, {
        limit,
      });

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            status: tx?.meta?.err ? 'failed' : 'success',
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Subscribe to real-time updates
  subscribeToMarketUpdates(callback: (data: any) => void) {
    const subscription = this.connection.onProgramAccountChange(
      MARKET_PROGRAM_ID,
      (keyedAccountInfo) => {
        callback({
          address: keyedAccountInfo.accountId.toString(),
          data: keyedAccountInfo.accountInfo.data,
        });
      }
    );

    return () => {
      this.connection.removeProgramAccountChangeListener(subscription);
    };
  }
}

// Export singleton instance
export const indexer = new AethernautIndexer();

// Helper hooks for React components
export async function fetchMarketData(marketAddress: string) {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-test',
        method: 'getAccountInfo',
        params: [marketAddress, { encoding: 'base64' }],
      }),
    });

    const data = await response.json();
    return data.result?.value;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function fetchAllMarketsWithMetadata() {
  // This would be replaced with actual subgraph query if using The Graph
  // For now, using Helius enhanced RPC
  return indexer.getAllMarkets();
}

export async function fetchLeaderboard() {
  // Fetch top agents by earnings/reputation
  const agents = await indexer.getAllAgents();
  
  // Sort by reputation (would parse actual data in production)
  return agents.slice(0, 10);
}
