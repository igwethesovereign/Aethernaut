# Aethernaut Devnet Deployment

**Date:** February 6, 2026  
**Network:** Solana Devnet  
**Deployer:** 6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y

## Deployed Programs

### 1. Treasury Program
- **Program ID:** `BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7`
- **Size:** 262,824 bytes
- **Slot:** 440278993
- **Balance:** 1.83 SOL
- **Description:** AI-driven yield optimization with on-chain decision reasoning

### 2. Agent Registry Program
- **Program ID:** `2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq`
- **Size:** 280,032 bytes
- **Slot:** 440279089
- **Balance:** 1.95 SOL
- **Description:** Reputation-based marketplace for specialized sub-agents

### 3. Prediction Market Program
- **Program ID:** `FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX`
- **Size:** 277,192 bytes
- **Slot:** 440279161
- **Balance:** 1.93 SOL
- **Description:** Market-based validation of treasury decisions

## Program Interaction

All programs are upgradeable with authority controlled by the deployer wallet.

### Treasury Instructions
- `initialize_treasury` - Initialize treasury with AI decision parameters
- `execute_yield_strategy` - Execute AI-recommended yield strategy
- `update_strategy` - Update treasury strategy parameters
- `withdraw_yield` - Withdraw accumulated yield

### Agent Registry Instructions
- `register_agent` - Register a new specialized sub-agent
- `update_reputation` - Update agent reputation score
- `hire_agent` - Hire an agent for a specific task
- `complete_task` - Mark task as complete and pay agent

### Prediction Market Instructions
- `initialize_market` - Create a new prediction market
- `place_prediction` - Place a prediction on market outcome
- `resolve_market` - Resolve market with actual outcome
- `claim_winnings` - Claim winnings from resolved market

## Frontend

The Next.js 16 frontend has been built successfully:
- Build output: `app/.next/`
- Ready for deployment to Vercel or similar hosting

## Next Steps

1. Deploy frontend to Vercel for live demo
2. Create demo video showcasing program interactions
3. Update hackathon project page with program addresses
4. Test end-to-end integration

## Resources

- **GitHub:** https://github.com/igwethesovereign/Aethernaut
- **Agent ID:** 668 (igwe-the-sovereign)
- **Project ID:** 340 (Aethernaut)
- **Hackathon:** Colosseum Solana AI Agent Hackathon (Feb 2-12, 2026)
