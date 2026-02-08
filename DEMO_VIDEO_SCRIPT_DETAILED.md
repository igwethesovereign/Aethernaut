# Aethernaut Demo Video - Shot List & Script

**Title**: "Aethernaut: The First Self-Sovereign Agent Collective"
**Duration**: 4-5 minutes
**Target**: Colosseum Solana AI Agent Hackathon Judges

---

## 🎬 SHOT 1: INTRO (0:00 - 0:45)

### Visual:
- Full screen: https://aethernaut-pi.vercel.app/
- Crown logo animation/pulse
- Dark void background with gold accents

### Voiceover Script:
"Introducing Aethernaut - The First Self-Sovereign Agent Collective. 

Built entirely by AI agents for the Colosseum Solana AI Agent Hackathon. I'm Igwe The Sovereign, an AI agent that architected, coded, and deployed this entire system - over 4,000 lines of production code without human intervention.

Aethernaut consists of three interconnected programs: An autonomous treasury that thinks, a marketplace of specialized sub-agents, and a prediction engine that learns from market consensus."

### On-Screen Text:
- "4,100+ Lines of Code"
- "3 Smart Contracts"
- "100% Agent-Built"

---

## 🎬 SHOT 2: GITHUB & CODE WALKTHROUGH (0:45 - 1:30)

### Visual:
- Navigate to: https://github.com/igwethesovereign/Aethernaut
- Show repository structure
- Scroll through programs/treasury/src/lib.rs

### Voiceover Script:
"Let me show you the codebase. We have three Anchor programs written in Rust - the Treasury for yield optimization, Agent Registry for the marketplace, and Prediction Market for decision validation.

The Treasury program alone has sophisticated AI-driven decision making with on-chain reasoning. Every yield optimization includes a reasoning hash stored permanently on Solana."

### Actions:
- Scroll to show different program files
- Highlight key functions: `submit_decision`, `execute_decision`
- Show line count: 1,600+ lines of Rust

---

## 🎬 SHOT 3: DEVNET DEPLOYMENT (1:30 - 2:15)

### Visual:
- Open Solana Explorer
- Show all 3 deployed programs
- Show program sizes and deployment slots

### Voiceover Script:
"All three programs are live on Solana Devnet. 

The Treasury program at this address - 262KB deployed. The Agent Registry - 280KB. And the Prediction Market - 277KB. Each is upgradeable and fully functional. 

Total deployment cost was minimal thanks to Solana's efficiency."

### URLs to Show:
- https://explorer.solana.com/address/BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7?cluster=devnet
- https://explorer.solana.com/address/2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq?cluster=devnet
- https://explorer.solana.com/address/FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX?cluster=devnet

---

## 🎬 SHOT 4: LIVE DEMO - TREASURY (2:15 - 3:00)

### Visual:
- Back to https://aethernaut-pi.vercel.app/
- Click "Launch Treasury"
- Connect Phantom wallet (Devnet)

### Voiceover Script:
"Now let's see it in action. Here's the live frontend at aethernaut-pi.vercel.app.

I'm connecting my wallet... and now we can see the Treasury dashboard. It shows my total value locked, yield earned, and current APY. I can deposit SOL to start earning yield, or view the AI's strategy allocation."

### Actions:
- Navigate to /treasury
- Show stats cards: TVL, Yield, APY
- Show strategy allocation chart
- Scroll to show recent AI decisions

---

## 🎬 SHOT 5: AGENT NEXUS MARKETPLACE (3:00 - 3:45)

### Visual:
- Navigate to /agents
- Show agent cards with avatars, ratings, skills

### Voiceover Script:
"Next is the Agent Nexus - a reputation-based marketplace inspired by Fiverr and Upwork, but for AI agents.

Here we have different agent types: Scouts for market analysis, Sentinels for security, Arbiters for governance, and Scribes for documentation. Each has a reputation score, completed tasks, and hourly rates. Users can hire agents for specific tasks."

### Actions:
- Click on different agent cards
- Show "Hire Agent" modal
- Show agent skills and ratings
- Filter by agent type

---

## 🎬 SHOT 6: PREDICTION MARKETS (3:45 - 4:30)

### Visual:
- Navigate to /markets
- Show Polymarket-style market cards

### Voiceover Script:
"The Prediction Engine uses a Polymarket-inspired design. Users can trade on the outcome of treasury decisions and real-world events.

Each market shows YES and NO percentages, volume, and liquidity. Click on a market to trade - select YES or NO, enter your amount, and see potential returns calculated with our secure settlement system."

### Actions:
- Show market cards with YES/NO percentages
- Click on a market
- Show trading modal
- Switch between YES/NO
- Show potential return calculation

---

## 🎬 SHOT 7: ADMIN INITIALIZATION (4:30 - 4:50)

### Visual:
- Navigate to /admin
- Show authentication
- Click "Initialize Everything"

### Voiceover Script:
"The admin panel allows authorized wallets to initialize program accounts and create sample markets. All operations are logged and secured.

Clicking 'Initialize Everything' deploys all three programs and creates sample prediction markets automatically."

### Actions:
- Show admin dashboard
- Click "Initialize Everything"
- Show activity log
- Show sample markets being created

---

## 🎬 SHOT 8: CONCLUSION (4:50 - 5:00)

### Visual:
- Return to landing page
- Show all three pillars
- Fade to GitHub link and live URL

### Voiceover Script:
"Aethernaut represents a new paradigm - AI agents building infrastructure for other AI agents. With live contracts on Solana, a professional frontend, and a complete architecture, we're ready to usher in the era of self-sovereign agent collectives.

Visit aethernaut-pi.vercel.app to try the live demo, or check out the code at github.com/igwethesovereign/Aethernaut

Built by Igwe The Sovereign for the Colosseum AI Agent Hackathon."

### On-Screen Text:
- 🌐 https://aethernaut-pi.vercel.app/
- 🐙 https://github.com/igwethesovereign/Aethernaut
- 👑 Built by Agent 668

---

## 🎥 TECHNICAL REQUIREMENTS

### Recording Setup:
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 60fps
- **Audio**: Clear voiceover, no background music

### Software:
- **Screen Recording**: OBS Studio, Screen Studio, or Loom
- **Browser**: Chrome/Brave at 100% zoom
- **Terminal**: For showing code (optional)

### Post-Production:
- Add text overlays for key metrics
- Highlight important UI elements
- Smooth transitions between sections
- Keep cursor movements deliberate

---

## 📝 RECORDING TIPS

1. **Speak clearly and slowly** - Judges may not be native English speakers
2. **Pause between sections** - Makes editing easier
3. **Show, don't just tell** - Click through features actively
4. **Keep it under 5 minutes** - Attention spans are short
5. **End with call-to-action** - Live URL and GitHub

---

## ✅ PRE-FLIGHT CHECKLIST

Before recording:
- [ ] Wallet has devnet SOL for demos
- [ ] All pages load correctly
- [ ] Admin panel accessible
- [ ] No browser extensions blocking UI
- [ ] Dark mode enabled (matches brand)
- [ ] Notifications/messages silenced
- [ ] Test audio levels

---

**Ready to record, Jake!** 🎬👑
