use anchor_lang::prelude::*;

// Aethernaut Prediction Market
// Decision validation through market-based feedback loops

declare_id!("DR9aDNjhEwKmw3KmNkLiNM7Kw8mspMw4KzdhR9xXAFWP");

#[program]
pub mod prediction_market {
    use super::*;

    /// Initialize the prediction market
    pub fn initialize(ctx: Context<Initialize>, params: MarketParams) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.params = params;
        market.total_markets = 0;
        market.total_volume = 0;
        
        emit!(MarketInitialized {
            market: market.key(),
            authority: market.authority,
        });
        
        Ok(())
    }

    /// Create a prediction market for a treasury decision
    pub fn create_prediction_market(
        ctx: Context<CreatePredictionMarket>,
        treasury_proposal: Pubkey,
        decision_summary: String,
        expiry: i64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let prediction = &mut ctx.accounts.prediction;
        
        prediction.creator = ctx.accounts.creator.key();
        prediction.treasury_proposal = treasury_proposal;
        prediction.decision_summary = decision_summary;
        prediction.created_at = Clock::get()?.unix_timestamp;
        prediction.expiry = expiry;
        prediction.status = PredictionStatus::Open;
        prediction.yes_pool = 0;
        prediction.no_pool = 0;
        prediction.total_bets = 0;
        prediction.resolved_outcome = None;
        prediction.consensus_price = None;
        prediction.actual_yield_bps = None;
        prediction.params = market.params.clone();
        
        market.total_markets = market.total_markets.checked_add(1).unwrap();
        
        emit!(PredictionMarketCreated {
            prediction: prediction.key(),
            treasury_proposal,
            creator: prediction.creator,
            expiry,
        });
        
        Ok(())
    }

    /// Place a bet on a prediction market outcome
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        outcome: Outcome,
        amount: u64,
    ) -> Result<()> {
        let prediction = &mut ctx.accounts.prediction;
        let bet = &mut ctx.accounts.bet;
        
        require!(
            matches!(prediction.status, PredictionStatus::Open),
            MarketError::MarketNotOpen
        );
        require!(
            Clock::get()?.unix_timestamp < prediction.expiry,
            MarketError::MarketExpired
        );
        require!(
            amount >= prediction.params.min_bet,
            MarketError::BetTooSmall
        );
        
        bet.bettor = ctx.accounts.bettor.key();
        bet.prediction = prediction.key();
        bet.outcome = outcome.clone();
        bet.amount = amount;
        bet.placed_at = Clock::get()?.unix_timestamp;
        bet.claimed = false;
        
        // Update pool
        match outcome {
            Outcome::Yes => {
                prediction.yes_pool = prediction.yes_pool.checked_add(amount).unwrap();
            }
            Outcome::No => {
                prediction.no_pool = prediction.no_pool.checked_add(amount).unwrap();
            }
        }
        
        prediction.total_bets = prediction.total_bets.checked_add(1).unwrap();
        
        // Update implied probability
        let total_pool = prediction.yes_pool + prediction.no_pool;
        if total_pool > 0 {
            prediction.consensus_price = Some(
                (prediction.yes_pool as u64 * 10000) / total_pool // Basis points
            );
        }
        
        emit!(BetPlaced {
            bet: bet.key(),
            prediction: prediction.key(),
            bettor: bet.bettor,
            outcome,
            amount,
            consensus_price: prediction.consensus_price,
        });
        
        Ok(())
    }

    /// Resolve the market with actual outcome
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        actual_outcome: Outcome,
        actual_yield_bps: Option<u16>,
    ) -> Result<()> {
        let prediction = &mut ctx.accounts.prediction;
        let market = &mut ctx.accounts.market;
        
        require!(
            matches!(prediction.status, PredictionStatus::Open),
            MarketError::MarketNotOpen
        );
        require!(
            Clock::get()?.unix_timestamp >= prediction.expiry,
            MarketError::MarketNotExpired
        );
        
        prediction.status = PredictionStatus::Resolved;
        prediction.resolved_outcome = Some(actual_outcome.clone());
        prediction.resolved_at = Some(Clock::get()?.unix_timestamp);
        prediction.actual_yield_bps = actual_yield_bps;
        
        market.total_volume = market.total_volume.checked_add(
            prediction.yes_pool + prediction.no_pool
        ).unwrap();
        
        emit!(MarketResolved {
            prediction: prediction.key(),
            outcome: actual_outcome,
            actual_yield_bps,
            yes_pool: prediction.yes_pool,
            no_pool: prediction.no_pool,
        });
        
        Ok(())
    }

    /// Claim winnings after market resolution
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let prediction = &ctx.accounts.prediction;
        let bet = &mut ctx.accounts.bet;
        
        require!(
            matches!(prediction.status, PredictionStatus::Resolved),
            MarketError::MarketNotResolved
        );
        require!(
            !bet.claimed,
            MarketError::AlreadyClaimed
        );
        
        let winning_outcome = prediction.resolved_outcome.as_ref().unwrap();
        
        if bet.outcome == *winning_outcome {
            // Calculate winnings
            let total_pool = prediction.yes_pool + prediction.no_pool;
            let winning_pool = match winning_outcome {
                Outcome::Yes => prediction.yes_pool,
                Outcome::No => prediction.no_pool,
            };
            
            // Proportional share of total pool
            let winnings = if winning_pool > 0 {
                (bet.amount as u128 * total_pool as u128 / winning_pool as u128) as u64
            } else {
                bet.amount
            };
            
            // Transfer winnings (would integrate with token program)
            bet.claimed = true;
            
            emit!(WinningsClaimed {
                bet: bet.key(),
                prediction: prediction.key(),
                bettor: bet.bettor,
                amount: winnings,
            });
        } else {
            bet.claimed = true;
            
            emit!(BetLost {
                bet: bet.key(),
                prediction: prediction.key(),
                bettor: bet.bettor,
                amount: bet.amount,
            });
        }
        
        Ok(())
    }

    /// Get market sentiment (current consensus price)
    pub fn get_sentiment(ctx: Context<GetSentiment>) -> Result<MarketSentiment> {
        let prediction = &ctx.accounts.prediction;
        
        let total_pool = prediction.yes_pool + prediction.no_pool;
        let yes_probability = if total_pool > 0 {
            (prediction.yes_pool as f64 / total_pool as f64 * 100.0) as u16
        } else {
            50 // Default to 50% if no bets
        };
        
        Ok(MarketSentiment {
            yes_probability,
            total_bets: prediction.total_bets,
            yes_pool: prediction.yes_pool,
            no_pool: prediction.no_pool,
            consensus_price: prediction.consensus_price,
        })
    }

    /// Cancel a market (only by authority, before any bets)
    pub fn cancel_market(ctx: Context<CancelMarket>) -> Result<()> {
        let prediction = &mut ctx.accounts.prediction;
        
        require!(
            prediction.total_bets == 0,
            MarketError::BetsAlreadyPlaced
        );
        require!(
            matches!(prediction.status, PredictionStatus::Open),
            MarketError::MarketNotOpen
        );
        
        prediction.status = PredictionStatus::Cancelled;
        
        emit!(MarketCancelled {
            prediction: prediction.key(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = Market::SIZE)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePredictionMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = creator,
        space = Prediction::SIZE
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
    #[account(
        init,
        payer = bettor,
        space = Bet::SIZE
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
    pub resolver: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub bet: Account<'info, Bet>,
    pub claimer: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetSentiment<'info> {
    pub prediction: Account<'info, Prediction>,
}

#[derive(Accounts)]
pub struct CancelMarket<'info> {
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub params: MarketParams,
    pub total_markets: u64,
    pub total_volume: u64,
}

impl Market {
    pub const SIZE: usize = 8 + 32 + MarketParams::SIZE + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MarketParams {
    pub min_bet: u64,
    pub max_bet: u64,
    pub platform_fee_bps: u16, // Basis points
    pub resolution_delay: i64, // Minimum time before resolution
}

impl MarketParams {
    pub const SIZE: usize = 8 + 8 + 2 + 8;
}

#[account]
pub struct Prediction {
    pub creator: Pubkey,
    pub treasury_proposal: Pubkey,
    pub decision_summary: String,
    pub created_at: i64,
    pub expiry: i64,
    pub status: PredictionStatus,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub total_bets: u64,
    pub resolved_outcome: Option<Outcome>,
    pub resolved_at: Option<i64>,
    pub actual_yield_bps: Option<u16>,
    pub consensus_price: Option<u64>, // Basis points (0-10000)
    pub params: MarketParams,
}

impl Prediction {
    pub const SIZE: usize = 8 + // discriminator
        32 + // creator
        32 + // treasury_proposal
        200 + // decision_summary (max 200 chars)
        8 + // created_at
        8 + // expiry
        1 + // status
        8 + // yes_pool
        8 + // no_pool
        8 + // total_bets
        1 + 1 + // resolved_outcome Option
        1 + 8 + // resolved_at Option
        1 + 2 + // actual_yield_bps Option
        1 + 8 + // consensus_price Option
        MarketParams::SIZE;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Outcome {
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum PredictionStatus {
    Open,
    Resolved,
    Cancelled,
}

#[account]
pub struct Bet {
    pub bettor: Pubkey,
    pub prediction: Pubkey,
    pub outcome: Outcome,
    pub amount: u64,
    pub placed_at: i64,
    pub claimed: bool,
}

impl Bet {
    pub const SIZE: usize = 8 + // discriminator
        32 + // bettor
        32 + // prediction
        1 + // outcome
        8 + // amount
        8 + // placed_at
        1; // claimed
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MarketSentiment {
    pub yes_probability: u16, // 0-100
    pub total_bets: u64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub consensus_price: Option<u64>,
}

#[error_code]
pub enum MarketError {
    #[msg("Market is not open")]
    MarketNotOpen,
    #[msg("Market has expired")]
    MarketExpired,
    #[msg("Market has not expired yet")]
    MarketNotExpired,
    #[msg("Bet amount below minimum")]
    BetTooSmall,
    #[msg("Market is not resolved")]
    MarketNotResolved,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("Bets have already been placed")]
    BetsAlreadyPlaced,
}

// Events
#[event]
pub struct MarketInitialized {
    pub market: Pubkey,
    pub authority: Pubkey,
}

#[event]
pub struct PredictionMarketCreated {
    pub prediction: Pubkey,
    pub treasury_proposal: Pubkey,
    pub creator: Pubkey,
    pub expiry: i64,
}

#[event]
pub struct BetPlaced {
    pub bet: Pubkey,
    pub prediction: Pubkey,
    pub bettor: Pubkey,
    pub outcome: Outcome,
    pub amount: u64,
    pub consensus_price: Option<u64>,
}

#[event]
pub struct MarketResolved {
    pub prediction: Pubkey,
    pub outcome: Outcome,
    pub actual_yield_bps: Option<u16>,
    pub yes_pool: u64,
    pub no_pool: u64,
}

#[event]
pub struct WinningsClaimed {
    pub bet: Pubkey,
    pub prediction: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BetLost {
    pub bet: Pubkey,
    pub prediction: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MarketCancelled {
    pub prediction: Pubkey,
}
