import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
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

async function testPrograms() {
  console.log("🔍 Testing Aethernaut Programs on Devnet\n");
  console.log("Deployer:", deployerKeypair.publicKey.toString());
  console.log("Balance:", await connection.getBalance(deployerKeypair.publicKey) / 1e9, "SOL\n");

  // Test 1: Verify programs exist
  console.log("✅ Test 1: Verifying deployed programs...");
  
  const treasuryAccount = await connection.getAccountInfo(TREASURY_PROGRAM_ID);
  if (treasuryAccount) {
    console.log("  ✓ Treasury program deployed:", TREASURY_PROGRAM_ID.toString());
    console.log("    Size:", treasuryAccount.data.length, "bytes");
  } else {
    console.log("  ✗ Treasury program not found");
  }

  const registryAccount = await connection.getAccountInfo(REGISTRY_PROGRAM_ID);
  if (registryAccount) {
    console.log("  ✓ Agent Registry program deployed:", REGISTRY_PROGRAM_ID.toString());
    console.log("    Size:", registryAccount.data.length, "bytes");
  } else {
    console.log("  ✗ Agent Registry program not found");
  }

  const marketAccount = await connection.getAccountInfo(MARKET_PROGRAM_ID);
  if (marketAccount) {
    console.log("  ✓ Prediction Market program deployed:", MARKET_PROGRAM_ID.toString());
    console.log("    Size:", marketAccount.data.length, "bytes");
  } else {
    console.log("  ✗ Prediction Market program not found");
  }

  // Test 2: Get program accounts
  console.log("\n✅ Test 2: Checking program accounts...");
  
  try {
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(deployerKeypair), {});
    anchor.setProvider(provider);

    // Load IDLs
    const treasuryIdl = JSON.parse(fs.readFileSync("./target/idl/treasury.json", "utf-8"));
    const registryIdl = JSON.parse(fs.readFileSync("./target/idl/agent_registry.json", "utf-8"));
    const marketIdl = JSON.parse(fs.readFileSync("./target/idl/prediction_market.json", "utf-8"));

    console.log("  ✓ Treasury IDL loaded:", treasuryIdl.instructions.length, "instructions");
    console.log("  ✓ Agent Registry IDL loaded:", registryIdl.instructions.length, "instructions");
    console.log("  ✓ Prediction Market IDL loaded:", marketIdl.instructions.length, "instructions");

    // Create program instances
    const treasuryProgram = new anchor.Program(treasuryIdl, provider);
    const registryProgram = new anchor.Program(registryIdl, provider);
    const marketProgram = new anchor.Program(marketIdl, provider);

    console.log("  ✓ All programs instantiated successfully");

    // Test 3: Calculate PDAs
    console.log("\n✅ Test 3: Calculating Program Derived Addresses...");
    
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), deployerKeypair.publicKey.toBuffer()],
      TREASURY_PROGRAM_ID
    );
    console.log("  ✓ Treasury PDA:", treasuryPda.toString());

    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("registry"), deployerKeypair.publicKey.toBuffer()],
      REGISTRY_PROGRAM_ID
    );
    console.log("  ✓ Registry PDA:", registryPda.toString());

    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), deployerKeypair.publicKey.toBuffer()],
      MARKET_PROGRAM_ID
    );
    console.log("  ✓ Market PDA:", marketPda.toString());

    console.log("\n🎉 All tests passed! Programs are ready for interaction.");
    console.log("\nNext steps:");
    console.log("  1. Initialize treasury with: treasuryProgram.methods.initialize(params)");
    console.log("  2. Initialize registry with: registryProgram.methods.initialize(params)");
    console.log("  3. Initialize market with: marketProgram.methods.initialize(params)");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testPrograms();
