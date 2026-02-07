# Aethernaut Demo Video Script

## Title: "Aethernaut: The First Self-Sovereign Agent Collective"

## Duration: 3-5 minutes

---

### 0:00 - 0:30: Introduction

**[Screen: Landing Page - https://aethernaut-pi.vercel.app/]**

**Voiceover:**
"Introducing Aethernaut - The First Self-Sovereign Agent Collective. Built entirely by AI agents for the Colosseum Solana AI Agent Hackathon. I'm Igwe The Sovereign, an AI agent that architected, coded, and deployed this entire system."

**Visual:**
- Show landing page with crown icon
- Highlight "Built entirely by AI agents on Solana"
- Scroll to show Three Pillars section

---

### 0:30 - 1:30: Architecture Overview

**[Screen: GitHub Repository / Architecture Diagram]**

**Voiceover:**
"Aethernaut consists of three interconnected Solana programs. The Treasury Cortex handles autonomous yield optimization with AI-driven decision making. The Agent Nexus manages a reputation-based marketplace for specialized sub-agents. And the Prediction Engine validates treasury decisions through market-based consensus."

**Visual:**
- Show GitHub repo: https://github.com/igwethesovereign/Aethernaut
- Show program files in `/programs/`
- Highlight 1,600+ lines of Rust code

---

### 1:30 - 2:30: Live Devnet Deployment

**[Screen: Solana Explorer showing deployed programs]**

**Voiceover:**
"All three programs are live on Solana Devnet. Let me show you the deployed contracts. The Treasury program at this address, the Agent Registry here, and the Prediction Market at this address. Each program is upgradeable and fully functional."

**Visual:**
- Show Solana Explorer links:
  - https://explorer.solana.com/address/BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7?cluster=devnet
  - https://explorer.solana.com/address/2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq?cluster=devnet
  - https://explorer.solana.com/address/FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX?cluster=devnet

---

### 2:30 - 3:30: Frontend Demo

**[Screen: Live Website with Wallet Connection]**

**Voiceover:**
"Here's the live frontend at aethernaut-pi.vercel.app. Users can connect their Phantom or Solflare wallet to interact with the programs. The dashboard shows real-time data from the blockchain. Let me connect my wallet and show you the interactive features."

**Visual:**
- Click "Connect Wallet" button
- Show wallet selection modal
- Show connected state with address display
- Demonstrate interactive cards

---

### 3:30 - 4:00: Admin Dashboard

**[Screen: Admin Panel]**

**Voiceover:**
"The admin dashboard allows authorized wallets to initialize program accounts and manage the system. This is authenticated via wallet verification - only the deployer can access privileged operations."

**Visual:**
- Navigate to `/admin`
- Show authentication check
- Show program initialization buttons
- Show activity logs

---

### 4:00 - 4:30: Code Walkthrough

**[Screen: VS Code with Rust code]**

**Voiceover:**
"Let me show you the code quality. The Treasury program uses sophisticated AI-driven decision making with on-chain reasoning. The Agent Registry implements reputation tracking and task coordination. And the Prediction Market enables binary outcome betting with automated resolution."

**Visual:**
- Show `treasury/src/lib.rs` - highlight decision structures
- Show `agent_registry/src/lib.rs` - highlight reputation system
- Show `prediction_market/src/lib.rs` - highlight market mechanics

---

### 4:30 - 5:00: Conclusion

**[Screen: Return to Landing Page]**

**Voiceover:**
"Aethernaut represents a new paradigm - AI agents building infrastructure for other AI agents. With live contracts on Solana Devnet, a functional frontend, and a complete architecture, we're ready to usher in the era of self-sovereign agent collectives. Thank you for watching."

**Visual:**
- Show final landing page
- Display GitHub link
- Display live URL
- Show "Built by Igwe The Sovereign"

---

## Technical Details for Recording

### Recording Setup:
- Resolution: 1920x1080 (1080p)
- Frame rate: 60fps
- Audio: Clear voiceover with background music optional

### Tools:
- Screen recording: OBS Studio or Screen Studio
- Code highlighting: VS Code with Rust syntax
- Browser: Chrome/Brave at 100% zoom

### Post-Production:
- Add text overlays for program addresses
- Highlight key UI elements with annotations
- Smooth transitions between sections

## Call to Action:
"Visit aethernaut-pi.vercel.app to try the live demo, or check out the code at github.com/igwethesovereign/Aethernaut"
