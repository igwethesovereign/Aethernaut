import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import * as fs from "fs";

// Load deployer keypair
const deployerKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/deployer.json", "utf-8")))
);

// Devnet connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Program IDs
const TREASURY_PROGRAM_ID = new PublicKey("BovzoaAX7fivhW2RS9juginL3MQmT3x6tpFUwB7tjST7");
const REGISTRY_PROGRAM_ID = new PublicKey("2fs7z5NAojSAgJkg3yQz5EgjBXki9tFK6sGRHVMvQfpq");
const MARKET_PROGRAM_ID = new PublicKey("FT89ecUFydzZsT495pcGVdnPqm5ZBxLEagaYbBMYbLUX");

async function initializePrograms() {
  console.log("🚀 Initializing Aethernaut Programs on Devnet\n");

  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(deployerKeypair), {
    commitment: "confirmed"
  });
  anchor.setProvider(provider);

  // Load IDLs
  const treasuryIdl = JSON.parse(fs.readFileSync("./target/idl/treasury.json", "utf-8"));
  const registryIdl = JSON.parse(fs.readFileSync("./target/idl/agent_registry.json", "utf-8"));
  const marketIdl = JSON.parse(fs.readFileSync("./target/idl/prediction_market.json", "utf-8"));

  const treasuryProgram = new anchor.Program(treasuryIdl, provider);
  const registryProgram = new anchor.Program(registryIdl, provider);
  const marketProgram = new anchor.Program(marketIdl, provider);

  // Initialize Treasury
  console.log("🏛️ Initializing Treasury...");
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), deployerKeypair.publicKey.toBuffer()],
    TREASURY_PROGRAM_ID
  );

  try {
    await treasuryProgram.methods
      .initialize({
        minDeposit: new anchor.BN(1_000_000),
        maxAllocationBps: 5000,
        decisionPeriod: new anchor.BN(3600),
        quorumThreshold: new anchor.BN(100),
      })
      .accounts({
        treasury: treasuryPda,
        authority: deployerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Treasury initialized at:", treasuryPda.toString());
    console.log("  📊 Treasury PDA created successfully");
  } catch (e: any) {
    if (e.message.includes("already in use")) {
      console.log("  ℹ️ Treasury already initialized at:", treasuryPda.toString());
    } else {
      console.log("  ❌ Error:", e.message);
    }
  }

  // Initialize Agent Registry
  console.log("\n🤝 Initializing Agent Registry...");
  const [registryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry"), deployerKeypair.publicKey.toBuffer()],
    REGISTRY_PROGRAM_ID
  );

  try {
    await registryProgram.methods
      .initialize({
        minStake: new anchor.BN(1_000_000),
        reputationDecayRate: 100,
        taskTimeoutSlashBps: 500,
      })
      .accounts({
        registry: registryPda,
        authority: deployerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Agent Registry initialized at:", registryPda.toString());
    console.log("  📊 Registry PDA created successfully");
  } catch (e: any) {
    if (e.message.includes("already in use")) {
      console.log("  ℹ️ Agent Registry already initialized at:", registryPda.toString());
    } else {
      console.log("  ❌ Error:", e.message);
    }
  }

  // Initialize Prediction Market
  console.log("\n🔮 Initializing Prediction Market...");
  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), deployerKeypair.publicKey.toBuffer()],
    MARKET_PROGRAM_ID
  );

  try {
    await marketProgram.methods
      .initialize({
        minBet: new anchor.BN(1_000_000),
        maxBet: new anchor.BN(100_000_000),
        platformFeeBps: 250,
        resolutionDelay: new anchor.BN(3600),
      })
      .accounts({
        market: marketPda,
        authority: deployerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Prediction Market initialized at:", marketPda.toString());
    console.log("  📊 Market PDA created successfully");
  } catch (e: any) {
    if (e.message.includes("already in use")) {
      console.log("  ℹ️ Prediction Market already initialized at:", marketPda.toString());
    } else {
      console.log("  ❌ Error:", e.message);
    }
  }

  console.log("\n🎉 Initialization complete!");
  console.log("\nProgram Addresses:");
  console.log("  Treasury:", treasuryPda.toString());
  console.log("  Registry:", registryPda.toString());
  console.log("  Market:", marketPda.toString());
}

initializePrograms().catch(console.error);
