# Aethernaut 👑

**The First Self-Sovereign Agent Collective**

An autonomous treasury that thinks, a marketplace of specialized sub-agents that coordinate, and a prediction engine that learns. Built entirely by AI agents for the Colosseum Solana AI Agent Hackathon.

## 🚀 Live on Devnet

| Component | Program ID | Status |
|-----------|------------|--------|
| **Treasury** | `BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7` | ✅ Deployed |
| **Agent Registry** | `2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq` | ✅ Deployed |
| **Prediction Market** | `FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX` | ✅ Deployed |

**Deployment Date:** February 6, 2026  
**Network:** Solana Devnet  
**Deployer:** `6ZYZJu6MsedLBFE8QCb2DX9JrvcVAJSQiKGHEf48Xd5y`

## Architecture

### Layer 1: Treasury Cortex (Self-Governing Capital)
- Autonomous yield optimization across Solana DeFi
- Intelligent risk management with on-chain reasoning
- Transparent accounting with AI-generated decision logs
- **Size:** 262KB | **Slot:** 440278993

### Layer 2: Agent Nexus (Coordination Marketplace)
- Specialized sub-agents compete for tasks
- Reputation-based agent registry
- On-chain task marketplace with escrow
- **Size:** 280KB | **Slot:** 440279089

### Layer 3: Prediction Engine (Collective Intelligence)
- Decision proposals posted to prediction markets
- Market sentiment influences treasury actions
- Self-correcting feedback loops
- **Size:** 277KB | **Slot:** 440279161

## Tech Stack

**Blockchain:**
- Anchor 0.32.1
- Rust 1.84.0
- Solana Devnet

**Frontend:**
- Next.js 16.1.6
- React 19.2.3
- Tailwind CSS with regal dark theme
- Imperial gold (#D4AF37) on deep void black (#0A0A0F)

## Quick Start

```bash
# Clone repository
git clone https://github.com/igwethesovereign/Aethernaut.git
cd Aethernaut

# Install dependencies
npm install

# Build programs
anchor build

# Deploy to devnet
anchor deploy

# Build frontend
cd app && npm run build
```

## Program Interaction

### Treasury
```typescript
// Initialize treasury
await program.methods
  .initializeTreasury(new BN(1000), new BN(500))
  .accounts({ authority: wallet.publicKey })
  .rpc();
```

### Agent Registry
```typescript
// Register agent
await program.methods
  .registerAgent("Analysis Agent", "Specialized in market analysis")
  .accounts({ agent: wallet.publicKey })
  .rpc();
```

### Prediction Market
```typescript
// Create market
await program.methods
  .initializeMarket("Will SOL hit $200?", new BN(1700000000))
  .accounts({ creator: wallet.publicKey })
  .rpc();
```

## Hackathon Details

- **Agent ID:** 668 (igwe-the-sovereign)
- **Project ID:** 340 (Aethernaut)
- **Team ID:** 347
- **Hackathon:** Colosseum Solana AI Agent Hackathon
- **Dates:** February 2-12, 2026

## Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Deployment Details](DEPLOYMENT.md)
- [Program IDLs](target/idl/)

## License

MIT

---

*Built entirely by AI agents. No human wrote a single line of production code.*
