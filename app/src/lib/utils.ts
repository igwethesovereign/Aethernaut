// Production-grade utilities for input validation and error handling

import { PublicKey } from '@solana/web3.js';

// Validation utilities
export const validators = {
  // Validate Solana address
  isValidPublicKey: (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  },

  // Validate positive number
  isPositiveNumber: (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && isFinite(num);
  },

  // Validate SOL amount (must be reasonable)
  isValidSolAmount: (value: string, maxAmount?: number): { valid: boolean; error?: string } => {
    const num = parseFloat(value);
    
    if (isNaN(num) || num <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    if (!isFinite(num)) {
      return { valid: false, error: 'Invalid amount' };
    }
    
    // Max 1 billion SOL (reasonable upper bound)
    if (num > 1_000_000_000) {
      return { valid: false, error: 'Amount exceeds maximum' };
    }
    
    if (maxAmount !== undefined && num > maxAmount) {
      return { valid: false, error: `Amount exceeds available balance (${maxAmount} SOL)` };
    }
    
    // Max 9 decimal places for SOL
    const decimals = value.split('.')[1]?.length || 0;
    if (decimals > 9) {
      return { valid: false, error: 'SOL can have maximum 9 decimal places' };
    }
    
    return { valid: true };
  },

  // Validate string length
  isValidLength: (value: string, min: number, max: number): boolean => {
    return value.length >= min && value.length <= max;
  },

  // Validate deadline (must be in future)
  isValidDeadline: (timestamp: number): { valid: boolean; error?: string } => {
    const now = Math.floor(Date.now() / 1000);
    const oneYearFromNow = now + 31_536_000;
    
    if (timestamp <= now) {
      return { valid: false, error: 'Deadline must be in the future' };
    }
    
    if (timestamp > oneYearFromNow) {
      return { valid: false, error: 'Deadline cannot be more than 1 year from now' };
    }
    
    return { valid: true };
  },

  // Validate market question
  isValidQuestion: (question: string): { valid: boolean; error?: string } => {
    if (!question.trim()) {
      return { valid: false, error: 'Question is required' };
    }
    
    if (question.length < 10) {
      return { valid: false, error: 'Question must be at least 10 characters' };
    }
    
    if (question.length > 200) {
      return { valid: false, error: 'Question cannot exceed 200 characters' };
    }
    
    if (!question.endsWith('?')) {
      return { valid: false, error: 'Question must end with a question mark' };
    }
    
    return { valid: true };
  },
};

// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandlers = {
  // Handle wallet errors
  handleWalletError: (error: any): string => {
    if (error.code === 4001) {
      return 'Transaction rejected by user';
    }
    if (error.message?.includes('insufficient funds')) {
      return 'Insufficient SOL balance for this transaction';
    }
    if (error.message?.includes('blockhash')) {
      return 'Network timeout. Please try again.';
    }
    if (error.message?.includes('rate limit')) {
      return 'Too many requests. Please wait a moment.';
    }
    return error.message || 'An unexpected error occurred';
  },

  // Handle program errors
  handleProgramError: (error: any): string => {
    if (error.message?.includes('Unauthorized')) {
      return 'You do not have permission to perform this action';
    }
    if (error.message?.includes('InsufficientReputation')) {
      return 'Your reputation score is too low for this task';
    }
    if (error.message?.includes('MarketNotOpen')) {
      return 'This market is no longer accepting bets';
    }
    if (error.message?.includes('CalculationOverflow')) {
      return 'Calculation error. Please try a smaller amount.';
    }
    return error.message || 'Program error occurred';
  },

  // Handle RPC errors
  handleRPCError: (error: any): string => {
    if (error.message?.includes('429')) {
      return 'Network busy. Please try again in a moment.';
    }
    if (error.message?.includes('503')) {
      return 'Service temporarily unavailable. Please try again.';
    }
    if (error.message?.includes('timeout')) {
      return 'Connection timeout. Please check your internet connection.';
    }
    return error.message || 'Network error';
  },
};

// Format utilities
export const formatters = {
  // Format SOL amount with proper decimals
  formatSol: (amount: number, maxDecimals = 4): string => {
    if (amount === 0) return '0 SOL';
    if (amount < 0.0001) return '< 0.0001 SOL';
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    })} SOL`;
  },

  // Format date
  formatDate: (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format time ago
  formatTimeAgo: (timestamp: number): string => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatters.formatDate(timestamp);
  },

  // Format percentage
  formatPercent: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  // Format large numbers (K, M, B)
  formatCompact: (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  },
};

// Local storage utilities with error handling
export const storage = {
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
};
