// Settlement service for prediction markets
// Handles market resolution and winner payouts

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const MARKET_PROGRAM_ID = new PublicKey('FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX');

export interface Market {
  address: string;
  question: string;
  yesPool: number;
  noPool: number;
  resolved: boolean;
  winningOutcome?: boolean;
  endTime: number;
}

export interface UserBet {
  marketAddress: string;
  position: 'yes' | 'no';
  amount: number;
  claimed: boolean;
}

export class SettlementService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Resolve a market (only callable by authority)
  async resolveMarket(
    marketAddress: PublicKey,
    outcome: boolean, // true = YES won, false = NO won
    authorityWallet: anchor.Wallet
  ): Promise<string> {
    try {
      // In production, this would call the actual Anchor program
      // await program.methods
      //   .resolveMarket(outcome)
      //   .accounts({
      //     market: marketAddress,
      //     authority: authorityWallet.publicKey,
      //   })
      //   .rpc();

      console.log(`Market ${marketAddress.toString()} resolved: ${outcome ? 'YES' : 'NO'}`);
      
      // Return mock signature
      return 'mock-signature-' + Date.now();
    } catch (error) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }

  // Calculate winnings for a user
  calculateWinnings(
    userBet: UserBet,
    market: Market
  ): number {
    if (!market.resolved) {
      throw new Error('Market not yet resolved');
    }

    if (market.winningOutcome === undefined) {
      throw new Error('Winning outcome not set');
    }

    // Check if user bet on winning side
    const userWon = 
      (market.winningOutcome && userBet.position === 'yes') ||
      (!market.winningOutcome && userBet.position === 'no');

    if (!userWon) {
      return 0; // User lost their bet
    }

    // Calculate proportional share
    const totalPool = market.yesPool + market.noPool;
    const winningPool = market.winningOutcome ? market.yesPool : market.noPool;
    
    const userShare = userBet.amount / winningPool;
    const winnings = totalPool * userShare;

    return winnings;
  }

  // Claim winnings (user calls this)
  async claimWinnings(
    marketAddress: PublicKey,
    userWallet: anchor.Wallet
  ): Promise<string> {
    try {
      // In production:
      // await program.methods
      //   .claimWinnings()
      //   .accounts({
      //     market: marketAddress,
      //     user: userWallet.publicKey,
      //   })
      //   .rpc();

      console.log(`User ${userWallet.publicKey.toString()} claimed winnings from ${marketAddress.toString()}`);
      
      return 'mock-claim-signature-' + Date.now();
    } catch (error) {
      console.error('Error claiming winnings:', error);
      throw error;
    }
  }

  // Batch resolve multiple markets (for cron job)
  async batchResolveMarkets(
    markets: Array<{ address: PublicKey; outcome: boolean }>,
    authorityWallet: anchor.Wallet
  ): Promise<string[]> {
    const signatures: string[] = [];

    for (const { address, outcome } of markets) {
      try {
        const sig = await this.resolveMarket(address, outcome, authorityWallet);
        signatures.push(sig);
      } catch (error) {
        console.error(`Failed to resolve market ${address.toString()}:`, error);
      }
    }

    return signatures;
  }

  // Check if market should be auto-resolved (cron job)
  shouldAutoResolve(market: Market): boolean {
    if (market.resolved) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return now >= market.endTime;
  }

  // Get all markets ready for resolution
  async getMarketsForResolution(): Promise<Market[]> {
    // In production, fetch from program and filter
    const mockMarkets: Market[] = [
      {
        address: 'mock-market-1',
        question: 'Will SOL reach $200?',
        yesPool: 150,
        noPool: 75,
        resolved: false,
        endTime: Date.now() / 1000 - 3600, // Ended 1 hour ago
      },
    ];

    return mockMarkets.filter(m => this.shouldAutoResolve(m));
  }
}

// Auto-resolution cron job logic
export async function runAutoResolution(
  connection: Connection,
  authorityWallet: anchor.Wallet
): Promise<void> {
  const settlementService = new SettlementService(connection);
  
  console.log('Running auto-resolution check...');
  
  const marketsForResolution = await settlementService.getMarketsForResolution();
  
  if (marketsForResolution.length === 0) {
    console.log('No markets ready for resolution');
    return;
  }

  console.log(`Found ${marketsForResolution.length} markets to resolve`);

  // For each market, determine outcome (in production, this would use oracle/data source)
  const resolutions = marketsForResolution.map(market => {
    // Mock: Random outcome for demonstration
    const outcome = Math.random() > 0.5;
    return {
      address: new PublicKey(market.address),
      outcome,
    };
  });

  const signatures = await settlementService.batchResolveMarkets(
    resolutions,
    authorityWallet
  );

  console.log(`Resolved ${signatures.length} markets`);
}

// Fee calculation
export function calculateFees(
  amount: number,
  platformFeeBps: number = 250 // 2.5% default
): { platformFee: number; netAmount: number } {
  const platformFee = (amount * platformFeeBps) / 10000;
  const netAmount = amount - platformFee;
  
  return { platformFee, netAmount };
}

// Helper to format payout display
export function formatPayout(
  betAmount: number,
  currentPrice: number
): string {
  const potentialReturn = betAmount / currentPrice;
  return potentialReturn.toFixed(4);
}
