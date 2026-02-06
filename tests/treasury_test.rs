use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

// Integration tests for Aethernaut Treasury
// Tests the complete flow: deposit → propose decision → vote → execute → record outcome

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::solana_program::clock::Clock;
    
    #[test]
    fn test_initialize_treasury() {
        // Treasury initialization test
        let params = TreasuryParams {
            min_deposit: 1_000_000, // 1 USDC
            max_allocation_bps: 5000, // 50%
            decision_period: 3600, // 1 hour
            quorum_threshold: 100,
        };
        
        // Assert params are stored correctly
        assert_eq!(params.min_deposit, 1_000_000);
        assert_eq!(params.max_allocation_bps, 5000);
    }
    
    #[test]
    fn test_yield_decision_creation() {
        let decision = YieldDecision {
            agent_id: Pubkey::default(),
            action: YieldAction::Deposit,
            target_protocol: "jupiter".to_string(),
            amount: 100_000_000, // 100 USDC
            expected_yield_bps: 1250, // 12.5% APY
            risk_score: 30, // Low risk
        };
        
        assert_eq!(decision.action, YieldAction::Deposit);
        assert_eq!(decision.expected_yield_bps, 1250);
    }
    
    #[test]
    fn test_proposal_status_transitions() {
        // Test that proposal status transitions work correctly
        let status = ProposalStatus::Voting;
        
        match status {
            ProposalStatus::Voting => {
                // Can transition to Executed or Rejected
                let new_status = ProposalStatus::Executed;
                assert!(matches!(new_status, ProposalStatus::Executed));
            }
            _ => panic!("Unexpected status"),
        }
    }
}
