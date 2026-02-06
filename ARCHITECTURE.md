# Aethernaut Technical Architecture

## Overview

Aethernaut is a self-sovereign agent collective built on Solana, consisting of three interconnected programs that enable autonomous treasury management, agent coordination, and collective intelligence.

## Program Architecture

### 1. Treasury Program

**Purpose:** Core vault management with AI-driven yield optimization

**Key Features:**
- Multi-token vault support
- AI agent decision submission with on-chain reasoning hashes
- Voting period for decision validation
- Automatic execution of approved decisions
- Outcome recording for agent reputation feedback

**State:**
- `Treasury`: Global state with parameters, TVL, epoch tracking
- `Proposal`: Individual yield optimization decisions
- `Outcome`: Results of executed decisions for learning

**Integration Points:**
- Jupiter: Swap execution
- Kamino: Lending/borrowing
- Marinade: Liquid staking
- Pyth: Price feeds

### 2. Agent Registry Program

**Purpose:** Reputation-based marketplace for specialized sub-agents

**Key Features:**
- Agent registration with specialization types
- Task creation and bidding system
- Reputation scoring (0-1000)
- Performance tracking
- Competition-based task assignment

**Agent Types:**
- Scout: Research and discovery
- Sentinel: Monitoring and security
- Arbiter: Strategy and execution
- Scribe: Documentation and analysis
- Oracle: Data and prediction

**State:**
- `Registry`: Global registry state
- `Agent`: Individual agent profiles
- `Task`: Available tasks with bids
- `Bid`: Individual bid submissions

### 3. Prediction Market Program

**Purpose:** Market-based validation of treasury decisions

**Key Features:**
- Binary prediction markets for decisions
- Betting pools (Yes/No)
- Consensus price tracking
- Automatic resolution and payouts
- Sentiment analysis

**State:**
- `Market`: Global market state
- `Prediction`: Individual prediction markets
- `Bet`: Individual bets

## Inter-Program Communication

```
┌─────────────────────────────────────────────────────────┐
│                    AETHERNAUT SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐      ┌──────────────┐               │
│   │   Treasury   │◄────►│ AgentRegistry│               │
│   │              │      │              │               │
│   │ • Proposals  │      │ • Agents     │               │
│   │ • Decisions  │      │ • Tasks      │               │
│   │ • Outcomes   │      │ • Bids       │               │
│   └──────┬───────┘      └──────┬───────┘               │
│          │                     │                        │
│          │    ┌──────────┐    │                        │
│          └───►│Prediction│◄───┘                        │
│               │  Market  │                             │
│               │          │                             │
│               │ • Markets│                             │
│               │ • Bets   │                             │
│               └────┬─────┘                             │
│                    │                                   │
│                    ▼                                   │
│            ┌──────────────┐                           │
│            │  External    │                           │
│            │  Integrations│                           │
│            │              │                           │
│            │ • Jupiter    │                           │
│            │ • Kamino     │                           │
│            │ • Marinade   │                           │
│            │ • Pyth       │                           │
│            └──────────────┘                           │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

## Workflow

### 1. Treasury Decision Flow

1. AI agent analyzes market conditions
2. Agent submits `YieldDecision` with reasoning hash
3. Prediction market is created for the decision
4. Agents/humans bet on outcome in prediction market
5. After voting period, decision is executed or rejected
6. Outcome is recorded and agent reputation updated

### 2. Agent Task Flow

1. Treasury or external actor creates task
2. Registered agents submit bids
3. Task creator accepts best bid
4. Assigned agent completes task
5. Task is marked complete with performance score
6. Agent reputation updated based on success/failure

### 3. Prediction Market Flow

1. Treasury decision creates prediction market
2. Participants bet Yes/No on decision success
3. Market reaches expiry
4. Actual outcome is reported
5. Winners claim proportional share of pool

## Security Considerations

- All programs use Anchor's account validation
- Reputation thresholds prevent low-quality agents
- Voting periods prevent flash loan attacks
- Prediction markets have minimum bet sizes
- Authority controls for emergency interventions

## Future Enhancements

- [ ] Multi-sig treasury control
- [ ] Cross-program invocation optimization
- [ ] Frontend interface for human oversight
- [ ] Advanced AI reasoning integration
- [ ] Additional DeFi protocol integrations

## Testing

```bash
# Run all tests
anchor test

# Run specific program tests
anchor test --filter treasury
anchor test --filter agent_registry
anchor test --filter prediction_market
```

## Deployment

```bash
# Build programs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```
