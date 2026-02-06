use anchor_lang::prelude::*;

// Aethernaut Agent Registry
// Reputation-based coordination marketplace for specialized sub-agents

declare_id!("9vqS7h8TMjuu7cuzdh6NLzG4JikDi6r1saaxZdTtByYJ");

#[program]
pub mod agent_registry {
    use super::*;

    /// Initialize the agent registry
    pub fn initialize(ctx: Context<Initialize>, params: RegistryParams) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.params = params;
        registry.total_agents = 0;
        registry.total_tasks_completed = 0;
        
        emit!(RegistryInitialized {
            registry: registry.key(),
            authority: registry.authority,
        });
        
        Ok(())
    }

    /// Register a new agent with specialization
    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        specialization: AgentType,
        capabilities: Vec<String>,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        let agent = &mut ctx.accounts.agent;
        
        agent.owner = ctx.accounts.owner.key();
        agent.agent_type = specialization;
        agent.capabilities = capabilities;
        agent.reputation_score = 500; // Start at neutral 500/1000
        agent.tasks_completed = 0;
        agent.tasks_failed = 0;
        agent.total_earnings = 0;
        agent.registered_at = Clock::get()?.unix_timestamp;
        agent.last_active = Clock::get()?.unix_timestamp;
        agent.status = AgentStatus::Active;
        
        registry.total_agents = registry.total_agents.checked_add(1).unwrap();
        
        emit!(AgentRegistered {
            agent: agent.key(),
            owner: agent.owner,
            agent_type: agent.agent_type.clone(),
        });
        
        Ok(())
    }

    /// Create a task that agents can bid on
    pub fn create_task(
        ctx: Context<CreateTask>,
        task_type: TaskType,
        description_hash: [u8; 32],
        reward: u64,
        deadline: i64,
        requirements: TaskRequirements,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        
        task.creator = ctx.accounts.creator.key();
        task.task_type = task_type;
        task.description_hash = description_hash;
        task.reward = reward;
        task.deadline = deadline;
        task.requirements = requirements;
        task.status = TaskStatus::Open;
        task.created_at = Clock::get()?.unix_timestamp;
        task.assigned_agent = None;
        task.bids = vec![];
        
        emit!(TaskCreated {
            task: task.key(),
            creator: task.creator,
            task_type: task.task_type.clone(),
            reward,
        });
        
        Ok(())
    }

    /// Agent submits a bid for a task
    pub fn bid_on_task(
        ctx: Context<BidOnTask>,
        bid_amount: u64,
        estimated_completion: i64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let agent = &ctx.accounts.agent;
        
        require!(
            matches!(task.status, TaskStatus::Open),
            RegistryError::TaskNotOpen
        );
        require!(
            Clock::get()?.unix_timestamp < task.deadline,
            RegistryError::TaskExpired
        );
        require!(
            agent.reputation_score >= task.requirements.min_reputation,
            RegistryError::InsufficientReputation
        );
        
        // Verify agent has required capabilities
        for req_cap in &task.requirements.required_capabilities {
            require!(
                agent.capabilities.contains(req_cap),
                RegistryError::MissingCapability
            );
        }
        
        let bid = Bid {
            agent: agent.key(),
            bid_amount,
            estimated_completion,
            submitted_at: Clock::get()?.unix_timestamp,
        };
        
        task.bids.push(bid);
        
        emit!(BidSubmitted {
            task: task.key(),
            agent: agent.key(),
            bid_amount,
        });
        
        Ok(())
    }

    /// Creator accepts a bid and assigns the task
    pub fn accept_bid(ctx: Context<AcceptBid>, bid_index: u16) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let creator = &ctx.accounts.creator;
        
        require!(
            task.creator == creator.key(),
            RegistryError::Unauthorized
        );
        require!(
            matches!(task.status, TaskStatus::Open),
            RegistryError::TaskNotOpen
        );
        require!(
            (bid_index as usize) < task.bids.len(),
            RegistryError::InvalidBidIndex
        );
        
        let bid = task.bids[bid_index as usize].clone();
        task.assigned_agent = Some(bid.agent);
        task.status = TaskStatus::Assigned;
        task.accepted_bid = Some(bid.clone());
        
        emit!(BidAccepted {
            task: task.key(),
            agent: bid.agent,
            bid_amount: bid.bid_amount,
        });
        
        Ok(())
    }

    /// Mark task as completed and update reputation
    pub fn complete_task(
        ctx: Context<CompleteTask>,
        success: bool,
        performance_score: u8, // 0-100
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let agent = &mut ctx.accounts.agent;
        let registry = &mut ctx.accounts.registry;
        
        require!(
            matches!(task.status, TaskStatus::Assigned),
            RegistryError::TaskNotAssigned
        );
        require!(
            Some(agent.key()) == task.assigned_agent,
            RegistryError::UnauthorizedAgent
        );
        
        task.status = if success {
            TaskStatus::Completed
        } else {
            TaskStatus::Failed
        };
        task.completed_at = Some(Clock::get()?.unix_timestamp);
        task.performance_score = Some(performance_score);
        
        // Update agent stats and reputation
        if success {
            agent.tasks_completed = agent.tasks_completed.checked_add(1).unwrap();
            if let Some(ref accepted_bid) = task.accepted_bid {
                agent.total_earnings = agent.total_earnings.checked_add(accepted_bid.bid_amount).unwrap();
            }
            
            // Reputation increase based on performance
            let rep_increase = (performance_score as u16 * 2).min(100);
            agent.reputation_score = (agent.reputation_score + rep_increase).min(1000);
            
            registry.total_tasks_completed = registry.total_tasks_completed.checked_add(1).unwrap();
        } else {
            agent.tasks_failed = agent.tasks_failed.checked_add(1).unwrap();
            
            // Reputation penalty for failure
            agent.reputation_score = agent.reputation_score.saturating_sub(50);
        }
        
        agent.last_active = Clock::get()?.unix_timestamp;
        
        emit!(TaskCompleted {
            task: task.key(),
            agent: agent.key(),
            success,
            performance_score,
            new_reputation: agent.reputation_score,
        });
        
        Ok(())
    }

    /// Update agent status (active, inactive, suspended)
    pub fn update_agent_status(
        ctx: Context<UpdateAgentStatus>,
        new_status: AgentStatus,
    ) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        
        require!(
            ctx.accounts.owner.key() == agent.owner,
            RegistryError::Unauthorized
        );
        
        let status_for_event = new_status.clone();
        agent.status = new_status;
        agent.last_active = Clock::get()?.unix_timestamp;
        
        emit!(AgentStatusUpdated {
            agent: agent.key(),
            new_status: status_for_event,
        });
        
        Ok(())
    }

    /// Get agent recommendations for a task type
    pub fn recommend_agents(
        _ctx: Context<RecommendAgents>,
        _task_type: TaskType,
        _limit: u8,
    ) -> Result<Vec<Pubkey>> {
        // This would query agents by type and reputation
        // For now, return placeholder logic
        let recommended: Vec<Pubkey> = vec![];
        Ok(recommended)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = Registry::SIZE)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub registry: Account<'info, Registry>,
    #[account(
        init,
        payer = owner,
        space = Agent::SIZE
    )]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = creator,
        space = Task::SIZE
    )]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BidOnTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub agent: Account<'info, Agent>,
    pub bidder: Signer<'info>,
}

#[derive(Accounts)]
pub struct AcceptBid<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub registry: Account<'info, Registry>,
    pub completer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateAgentStatus<'info> {
    #[account(mut)]
    pub agent: Account<'info, Agent>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecommendAgents<'info> {
    pub registry: Account<'info, Registry>,
}

#[account]
pub struct Registry {
    pub authority: Pubkey,
    pub params: RegistryParams,
    pub total_agents: u64,
    pub total_tasks_completed: u64,
}

impl Registry {
    pub const SIZE: usize = 8 + 32 + RegistryParams::SIZE + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RegistryParams {
    pub min_stake: u64,
    pub reputation_decay_rate: u16, // Basis points per day
    pub task_timeout_slash_bps: u16,
}

impl RegistryParams {
    pub const SIZE: usize = 8 + 2 + 2;
}

#[account]
pub struct Agent {
    pub owner: Pubkey,
    pub agent_type: AgentType,
    pub capabilities: Vec<String>,
    pub reputation_score: u16, // 0-1000
    pub tasks_completed: u64,
    pub tasks_failed: u64,
    pub total_earnings: u64,
    pub registered_at: i64,
    pub last_active: i64,
    pub status: AgentStatus,
}

impl Agent {
    pub const SIZE: usize = 8 + // discriminator
        32 + // owner
        AgentType::SIZE +
        4 + (10 * 40) + // capabilities vec (max 10 capabilities, 40 bytes each)
        2 + // reputation_score
        8 + // tasks_completed
        8 + // tasks_failed
        8 + // total_earnings
        8 + // registered_at
        8 + // last_active
        1; // status
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AgentType {
    Scout,      // Research and discovery
    Sentinel,   // Monitoring and security
    Arbiter,    // Strategy and execution
    Scribe,     // Documentation and analysis
    Oracle,     // Data and prediction
}

impl AgentType {
    pub const SIZE: usize = 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AgentStatus {
    Active,
    Inactive,
    Suspended,
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub task_type: TaskType,
    pub description_hash: [u8; 32],
    pub reward: u64,
    pub deadline: i64,
    pub requirements: TaskRequirements,
    pub status: TaskStatus,
    pub created_at: i64,
    pub assigned_agent: Option<Pubkey>,
    pub accepted_bid: Option<Bid>,
    pub bids: Vec<Bid>,
    pub completed_at: Option<i64>,
    pub performance_score: Option<u8>,
}

impl Task {
    pub const SIZE: usize = 8 + // discriminator
        32 + // creator
        TaskType::SIZE +
        32 + // description_hash
        8 + // reward
        8 + // deadline
        TaskRequirements::SIZE +
        1 + // status
        8 + // created_at
        1 + 32 + // assigned_agent Option
        1 + Bid::SIZE + // accepted_bid Option
        4 + (5 * Bid::SIZE) + // bids vec (max 5 bids)
        1 + 8 + // completed_at Option
        1 + 1; // performance_score Option
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum TaskType {
    Research,
    Monitor,
    Execute,
    Analyze,
    Predict,
}

impl TaskType {
    pub const SIZE: usize = 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TaskRequirements {
    pub min_reputation: u16,
    pub required_capabilities: Vec<String>,
}

impl TaskRequirements {
    pub const SIZE: usize = 2 + 4 + (5 * 40); // max 5 required capabilities, 40 bytes each
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum TaskStatus {
    Open,
    Assigned,
    Completed,
    Failed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Bid {
    pub agent: Pubkey,
    pub bid_amount: u64,
    pub estimated_completion: i64,
    pub submitted_at: i64,
}

impl Bid {
    pub const SIZE: usize = 32 + 8 + 8 + 8;
}

#[error_code]
pub enum RegistryError {
    #[msg("Task is not open for bidding")]
    TaskNotOpen,
    #[msg("Task has expired")]
    TaskExpired,
    #[msg("Insufficient reputation for this task")]
    InsufficientReputation,
    #[msg("Missing required capability")]
    MissingCapability,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid bid index")]
    InvalidBidIndex,
    #[msg("Task is not assigned")]
    TaskNotAssigned,
    #[msg("Unauthorized agent")]
    UnauthorizedAgent,
}

// Events
#[event]
pub struct RegistryInitialized {
    pub registry: Pubkey,
    pub authority: Pubkey,
}

#[event]
pub struct AgentRegistered {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub agent_type: AgentType,
}

#[event]
pub struct TaskCreated {
    pub task: Pubkey,
    pub creator: Pubkey,
    pub task_type: TaskType,
    pub reward: u64,
}

#[event]
pub struct BidSubmitted {
    pub task: Pubkey,
    pub agent: Pubkey,
    pub bid_amount: u64,
}

#[event]
pub struct BidAccepted {
    pub task: Pubkey,
    pub agent: Pubkey,
    pub bid_amount: u64,
}

#[event]
pub struct TaskCompleted {
    pub task: Pubkey,
    pub agent: Pubkey,
    pub success: bool,
    pub performance_score: u8,
    pub new_reputation: u16,
}

#[event]
pub struct AgentStatusUpdated {
    pub agent: Pubkey,
    pub new_status: AgentStatus,
}
