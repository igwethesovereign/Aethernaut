use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// Aethernaut Treasury Program
// Core vault management with autonomous yield optimization

declare_id!("EYpZP5URZyGy32ZaHewPRe3S2BBXBAbtqNfyA5GxphUA");

#[program]
pub mod treasury {
    use super::*;

    /// Initialize the treasury with governance parameters
    pub fn initialize(ctx: Context<Initialize>, params: TreasuryParams) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.params = params;
        treasury.total_value_locked = 0;
        treasury.current_epoch = 0;
        treasury.last_rebalance = Clock::get()?.unix_timestamp;
        treasury.decision_count = 0;
        
        emit!(TreasuryInitialized {
            treasury: treasury.key(),
            authority: treasury.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Deposit funds into the treasury
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;
        
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_value_locked = treasury.total_value_locked.checked_add(amount).unwrap();
        
        emit!(DepositEvent {
            treasury: treasury.key(),
            user: ctx.accounts.user.key(),
            amount,
            new_tvl: treasury.total_value_locked,
        });
        
        Ok(())
    }

    /// AI agent submits a yield optimization decision with reasoning
    pub fn submit_decision(
        ctx: Context<SubmitDecision>,
        decision: YieldDecision,
        reasoning_hash: [u8; 32],
    ) -> Result<()> {
        let treasury = &ctx.accounts.treasury;
        let proposal = &mut ctx.accounts.proposal;
        
        proposal.decision = decision.clone();
        proposal.reasoning_hash = reasoning_hash;
        proposal.submitted_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = proposal.submitted_at + treasury.params.decision_period;
        proposal.status = ProposalStatus::Voting;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        
        emit!(DecisionProposed {
            proposal: proposal.key(),
            agent: decision.agent_id,
            action: decision.action,
            target_protocol: decision.target_protocol.clone(),
            amount: decision.amount,
            reasoning_hash,
        });
        
        Ok(())
    }

    /// Execute an approved decision after voting period
    /// SECURITY: Only treasury authority can execute decisions
    pub fn execute_decision(ctx: Context<ExecuteDecision>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let treasury = &mut ctx.accounts.treasury;
        let clock = Clock::get()?;
        
        // CRITICAL: Verify executor is treasury authority
        require!(
            ctx.accounts.executor.key() == treasury.authority,
            TreasuryError::UnauthorizedExecutor
        );
        
        require!(
            clock.unix_timestamp >= proposal.voting_ends_at,
            TreasuryError::VotingPeriodActive
        );
        require!(
            matches!(proposal.status, ProposalStatus::Voting),
            TreasuryError::InvalidProposalStatus
        );
        
        // Check if decision passed (more votes for than against)
        let passed = proposal.votes_for > proposal.votes_against;
        
        if passed {
            // Execute the yield optimization action
            // This would integrate with Jupiter/Kamino/Marinade
            proposal.status = ProposalStatus::Executed;
            treasury.decision_count = treasury.decision_count.checked_add(1).unwrap();
            treasury.last_rebalance = clock.unix_timestamp;
            
            emit!(DecisionExecuted {
                proposal: proposal.key(),
                decision: proposal.decision.clone(),
                execution_time: clock.unix_timestamp,
            });
        } else {
            proposal.status = ProposalStatus::Rejected;
            
            emit!(DecisionRejected {
                proposal: proposal.key(),
                votes_for: proposal.votes_for,
                votes_against: proposal.votes_against,
            });
        }
        
        Ok(())
    }

    /// Record the result of an executed decision for learning
    pub fn record_outcome(
        ctx: Context<RecordOutcome>,
        actual_yield_bps: u16,
        success: bool,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(
            matches!(proposal.status, ProposalStatus::Executed),
            TreasuryError::DecisionNotExecuted
        );
        
        proposal.outcome = Some(Outcome {
            actual_yield_bps,
            success,
            recorded_at: Clock::get()?.unix_timestamp,
        });
        
        emit!(OutcomeRecorded {
            proposal: proposal.key(),
            agent: proposal.decision.agent_id,
            predicted_yield_bps: proposal.decision.expected_yield_bps,
            actual_yield_bps,
            success,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = Treasury::SIZE)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SubmitDecision<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        init,
        payer = agent,
        space = 1024,
        seeds = [b"proposal", treasury.key().as_ref(), agent.key().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub agent: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteDecision<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordOutcome<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub recorder: Signer<'info>,
}

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub params: TreasuryParams,
    pub total_value_locked: u64,
    pub current_epoch: u64,
    pub last_rebalance: i64,
    pub decision_count: u64,
}

impl Treasury {
    pub const SIZE: usize = 8 + // discriminator
        32 + // authority
        TreasuryParams::SIZE +
        8 + // tvl
        8 + // epoch
        8 + // last_rebalance
        8; // decision_count
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TreasuryParams {
    pub min_deposit: u64,
    pub max_allocation_bps: u16, // Basis points
    pub decision_period: i64,     // Seconds for voting
    pub quorum_threshold: u64,    // Minimum votes required
}

impl TreasuryParams {
    pub const SIZE: usize = 8 + 2 + 8 + 8;
}

#[account]
pub struct Proposal {
    pub decision: YieldDecision,
    pub reasoning_hash: [u8; 32], // Hash of AI reasoning stored off-chain
    pub submitted_at: i64,
    pub voting_ends_at: i64,
    pub status: ProposalStatus,
    pub votes_for: u64,
    pub votes_against: u64,
    pub outcome: Option<Outcome>,
}

impl Proposal {
    pub const SIZE: usize = 8 + // discriminator
        YieldDecision::SIZE +
        32 + // reasoning_hash
        8 + // submitted_at
        8 + // voting_ends_at
        1 + // status
        8 + // votes_for
        8 + // votes_against
        1 + Outcome::SIZE; // outcome Option (1 byte discriminant + data)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct YieldDecision {
    pub agent_id: Pubkey,
    pub action: YieldAction,
    pub target_protocol: String, // "jupiter", "kamino", "marinade", etc.
    pub amount: u64,
    pub expected_yield_bps: u16, // Expected APY in basis points
    pub risk_score: u8,          // 0-100 risk assessment
}

impl YieldDecision {
    pub const SIZE: usize = 32 + 1 + (4 + 40) + 8 + 2 + 1; // String: 4 bytes len + 40 chars max
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum YieldAction {
    Deposit,
    Withdraw,
    Rebalance,
    Hedge,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ProposalStatus {
    Voting,
    Executed,
    Rejected,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Outcome {
    pub actual_yield_bps: u16,
    pub success: bool,
    pub recorded_at: i64,
}

impl Outcome {
    pub const SIZE: usize = 2 + 1 + 8;
}

#[error_code]
pub enum TreasuryError {
    #[msg("Agent is not registered")]
    UnregisteredAgent,
    #[msg("Voting period is still active")]
    VotingPeriodActive,
    #[msg("Invalid proposal status")]
    InvalidProposalStatus,
    #[msg("Decision has not been executed")]
    DecisionNotExecuted,
    #[msg("Unauthorized executor")]
    UnauthorizedExecutor,
}

// Events
#[event]
pub struct TreasuryInitialized {
    pub treasury: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DepositEvent {
    pub treasury: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub new_tvl: u64,
}

#[event]
pub struct DecisionProposed {
    pub proposal: Pubkey,
    pub agent: Pubkey,
    pub action: YieldAction,
    pub target_protocol: String,
    pub amount: u64,
    pub reasoning_hash: [u8; 32],
}

#[event]
pub struct DecisionExecuted {
    pub proposal: Pubkey,
    pub decision: YieldDecision,
    pub execution_time: i64,
}

#[event]
pub struct DecisionRejected {
    pub proposal: Pubkey,
    pub votes_for: u64,
    pub votes_against: u64,
}

#[event]
pub struct OutcomeRecorded {
    pub proposal: Pubkey,
    pub agent: Pubkey,
    pub predicted_yield_bps: u16,
    pub actual_yield_bps: u16,
    pub success: bool,
}
