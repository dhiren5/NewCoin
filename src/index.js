import Blockchain from './core/Blockchain.js';
import Transaction from './core/Transaction.js';
import Wallet from './wallet/Wallet.js';

/**
 * EnergyAI Blockchain Demo
 * Demonstrates energy tokenization, AI compute allocation, and carbon credits
 */

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         🌟 EnergyAI Blockchain - Future of Energy 🌟      ║');
console.log('║     Energy Tokenization for AI Computation & Power        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Initialize blockchain
const energyAI = new Blockchain();
console.log('✅ Blockchain initialized\n');

// Create wallets
console.log('📱 Creating wallets...');
const minerWallet = new Wallet();
minerWallet.walletType = 'miner';

const energyProviderWallet = new Wallet();
energyProviderWallet.walletType = 'energy_provider';

const aiCompanyWallet = new Wallet();
aiCompanyWallet.walletType = 'compute_provider';

const userWallet = new Wallet();

console.log(`   Miner: ${minerWallet.getWalletId()}`);
console.log(`   Energy Provider: ${energyProviderWallet.getWalletId()}`);
console.log(`   AI Company: ${aiCompanyWallet.getWalletId()}`);
console.log(`   User: ${userWallet.getWalletId()}\n`);

// ============================================
// SCENARIO 1: Energy Tokenization
// ============================================
console.log('⚡ SCENARIO 1: Energy Provider Tokenizes Renewable Energy');
console.log('─────────────────────────────────────────────────────────');

// Energy provider tokenizes 100 kWh of solar energy
const solarTokens = energyAI.tokenizeEnergy(
    energyProviderWallet.getAddress(),
    100, // 100 kWh
    'renewable' // Solar energy
);

console.log(`   Energy Provider tokenized 100 kWh of solar energy`);
console.log(`   Tokens generated: ${solarTokens.toFixed(2)} EAI (with renewable bonus)`);
console.log(`   Base rate: 10 tokens/kWh × 1.5 renewable bonus = 15 tokens/kWh\n`);

// Mine the block
energyAI.minePendingTransactions(minerWallet.getAddress(), {
    totalEnergyConsumed: 100,
    aiComputeUnits: 0,
    carbonFootprint: 0, // Solar has zero carbon
    energySource: 'renewable',
    efficiencyScore: 95,
    aiWorkloadType: 'energy_tokenization'
});

console.log(`   Miner reward: ${energyAI.getBalanceOfAddress(minerWallet.getAddress())} EAI`);
console.log(`   Energy Provider balance: ${energyAI.getBalanceOfAddress(energyProviderWallet.getAddress())} EAI\n`);

// ============================================
// SCENARIO 2: AI Compute Allocation
// ============================================
console.log('🤖 SCENARIO 2: AI Company Purchases Compute Resources');
console.log('─────────────────────────────────────────────────────────');

// First, give AI company some tokens
energyAI.tokenizeEnergy(aiCompanyWallet.getAddress(), 50, 'mixed');
energyAI.minePendingTransactions(minerWallet.getAddress());

console.log(`   AI Company initial balance: ${energyAI.getBalanceOfAddress(aiCompanyWallet.getAddress())} EAI`);

// AI company allocates compute for training a large language model
const computeTx = energyAI.allocateCompute(
    aiCompanyWallet.getAddress(),
    userWallet.getAddress(),
    100, // 100 GPU hours
    'training' // LLM training
);

computeTx.signTransaction(aiCompanyWallet.keyPair);
energyAI.addTransaction(computeTx);

console.log(`   Allocated: 100 GPU hours for LLM training`);
console.log(`   Estimated energy: 30 kWh`);
console.log(`   Cost: ${computeTx.amount} EAI tokens\n`);

// Mine the block with AI workload data
energyAI.minePendingTransactions(minerWallet.getAddress(), {
    totalEnergyConsumed: 30,
    aiComputeUnits: 100,
    carbonFootprint: 15, // 0.5 kg CO2 per kWh
    energySource: 'mixed',
    efficiencyScore: 70,
    aiWorkloadType: 'training'
});

console.log(`   AI Company new balance: ${energyAI.getBalanceOfAddress(aiCompanyWallet.getAddress())} EAI`);
console.log(`   User balance: ${energyAI.getBalanceOfAddress(userWallet.getAddress())} EAI\n`);

// ============================================
// SCENARIO 3: Carbon Credit Purchase
// ============================================
console.log('🌱 SCENARIO 3: Purchasing Carbon Credits');
console.log('─────────────────────────────────────────────────────────');

// AI company purchases carbon credits to offset emissions
const carbonTx = energyAI.purchaseCarbonCredit(
    aiCompanyWallet.getAddress(),
    20 // Offset 20 kg CO2
);

carbonTx.signTransaction(aiCompanyWallet.keyPair);
energyAI.addTransaction(carbonTx);

console.log(`   Carbon credits purchased: 20 kg CO2`);
console.log(`   Cost: ${carbonTx.amount} EAI tokens`);
console.log(`   Purpose: Offset emissions from AI training\n`);

energyAI.minePendingTransactions(minerWallet.getAddress());

// ============================================
// SCENARIO 4: Energy Trading
// ============================================
console.log('💱 SCENARIO 4: Peer-to-Peer Energy Trading');
console.log('─────────────────────────────────────────────────────────');

// Energy provider sells energy tokens to user
const energyTradeTx = new Transaction(
    energyProviderWallet.getAddress(),
    userWallet.getAddress(),
    500, // 500 EAI tokens
    'energy_trade',
    {
        energyAmount: 50, // Represents 50 kWh
        pricePerKWh: 10,
        energySource: 'renewable'
    }
);

energyTradeTx.signTransaction(energyProviderWallet.keyPair);
energyAI.addTransaction(energyTradeTx);

console.log(`   Energy Provider → User: 500 EAI tokens`);
console.log(`   Represents: 50 kWh of renewable energy`);
console.log(`   Transaction type: P2P Energy Trade\n`);

energyAI.minePendingTransactions(minerWallet.getAddress());

// ============================================
// BLOCKCHAIN STATISTICS
// ============================================
console.log('\n📊 BLOCKCHAIN STATISTICS');
console.log('═════════════════════════════════════════════════════════');

const stats = energyAI.getStatistics();
console.log(`   Total Blocks: ${stats.totalBlocks}`);
console.log(`   Mining Difficulty: ${stats.difficulty}`);
console.log(`   Base Mining Reward: ${stats.miningReward} EAI`);
console.log(`   Energy-to-Token Rate: ${stats.energyToTokenRate} tokens/kWh`);
console.log(`   Total Energy Tokenized: ${stats.totalEnergyTokenized}`);
console.log(`   Total Carbon Offset: ${stats.totalCarbonOffset}`);
console.log(`   Total AI Compute Units: ${stats.totalAIComputeUnits}`);
console.log(`   Pending Transactions: ${stats.pendingTransactions}`);
console.log(`   Chain Valid: ${stats.isValid ? '✅ Yes' : '❌ No'}\n`);

// ============================================
// WALLET BALANCES
// ============================================
console.log('💰 WALLET BALANCES');
console.log('═════════════════════════════════════════════════════════');
console.log(`   Miner: ${energyAI.getBalanceOfAddress(minerWallet.getAddress()).toFixed(2)} EAI`);
console.log(`   Energy Provider: ${energyAI.getBalanceOfAddress(energyProviderWallet.getAddress()).toFixed(2)} EAI`);
console.log(`   AI Company: ${energyAI.getBalanceOfAddress(aiCompanyWallet.getAddress()).toFixed(2)} EAI`);
console.log(`   User: ${energyAI.getBalanceOfAddress(userWallet.getAddress()).toFixed(2)} EAI\n`);

// ============================================
// ENERGY LEADERBOARD
// ============================================
console.log('🏆 ENERGY PROVIDER LEADERBOARD');
console.log('═════════════════════════════════════════════════════════');

const leaderboard = energyAI.getEnergyLeaderboard();
leaderboard.forEach((provider, index) => {
    console.log(`   ${index + 1}. ${provider.address}`);
    console.log(`      Energy: ${provider.totalEnergy.toFixed(2)} kWh`);
    console.log(`      Tokens: ${provider.totalTokens.toFixed(2)} EAI`);
    console.log(`      Source: ${provider.energySource}\n`);
});

// ============================================
// RECENT BLOCKS
// ============================================
console.log('📦 RECENT BLOCKS');
console.log('═════════════════════════════════════════════════════════');

const recentBlocks = energyAI.chain.slice(-3);
recentBlocks.forEach((block, index) => {
    const summary = block.getSummary();
    console.log(`   Block #${energyAI.chain.length - 3 + index}`);
    console.log(`   Hash: ${summary.hash.substring(0, 20)}...`);
    console.log(`   Timestamp: ${summary.timestamp}`);
    console.log(`   Transactions: ${summary.transactionCount}`);
    console.log(`   Energy: ${summary.energyConsumed}`);
    console.log(`   AI Compute: ${summary.aiComputeUnits} GPU hours`);
    console.log(`   Carbon: ${summary.carbonFootprint}`);
    console.log(`   Source: ${summary.energySource}`);
    console.log(`   Efficiency: ${summary.efficiencyScore}/100`);
    console.log(`   Energy Bonus: ${summary.energyBonus}x\n`);
});

// ============================================
// TRANSACTION HISTORY
// ============================================
console.log('📜 SAMPLE TRANSACTION HISTORY (User Wallet)');
console.log('═════════════════════════════════════════════════════════');

const userTransactions = energyAI.getAllTransactionsForAddress(userWallet.getAddress());
userTransactions.slice(-5).forEach((tx, index) => {
    const summary = tx.getSummary();
    console.log(`   Transaction #${index + 1}`);
    console.log(`   Type: ${summary.type}`);
    console.log(`   From: ${summary.from}`);
    console.log(`   To: ${summary.to}`);
    console.log(`   Amount: ${summary.amount} EAI`);
    console.log(`   Time: ${summary.timestamp}`);

    if (summary.energyAmount) {
        console.log(`   Energy: ${summary.energyAmount}`);
    }
    if (summary.computeUnits) {
        console.log(`   Compute: ${summary.computeUnits}`);
    }
    console.log('');
});

// ============================================
// FUTURE VISION
// ============================================
console.log('\n🚀 FUTURE VISION');
console.log('═════════════════════════════════════════════════════════');
console.log('   • Real-time energy grid integration');
console.log('   • AI model training verification on-chain');
console.log('   • Dynamic pricing based on renewable energy availability');
console.log('   • Cross-chain energy trading with other blockchains');
console.log('   • IoT device integration for automated energy tracking');
console.log('   • Carbon-negative mining incentives');
console.log('   • Decentralized AI compute marketplace');
console.log('   • Smart contracts for automated energy arbitrage');
console.log('   • Integration with major cloud providers (AWS, Azure, GCP)');
console.log('   • Regulatory compliance for energy trading\n');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              🎉 Demo Complete! 🎉                          ║');
console.log('║   EnergyAI: Powering the Future of Sustainable AI         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Export blockchain for further use
export default energyAI;
