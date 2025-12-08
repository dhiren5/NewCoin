import Blockchain from '../src/core/Blockchain.js';
import Wallet from '../src/wallet/Wallet.js';

/**
 * Quick Start Example - EnergyAI Blockchain
 * A simple demonstration of the core features
 */

console.log('🚀 EnergyAI Blockchain - Quick Start Example\n');

// Step 1: Create blockchain
console.log('Step 1: Creating blockchain...');
const energyAI = new Blockchain();
console.log('✅ Blockchain created\n');

// Step 2: Create wallets
console.log('Step 2: Creating wallets...');
const solarFarm = new Wallet();
const aiCompany = new Wallet();
const miner = new Wallet();

console.log(`   Solar Farm: ${solarFarm.getWalletId()}`);
console.log(`   AI Company: ${aiCompany.getWalletId()}`);
console.log(`   Miner: ${miner.getWalletId()}\n`);

// Step 3: Solar farm tokenizes 100 kWh of renewable energy
console.log('Step 3: Solar farm tokenizes 100 kWh of renewable energy...');
const tokens = energyAI.tokenizeEnergy(
    solarFarm.getAddress(),
    100,
    'renewable'
);
console.log(`   Generated: ${tokens} EAI tokens (with 1.5x renewable bonus)`);
console.log(`   Calculation: 100 kWh × 10 tokens/kWh × 1.5 = ${tokens} EAI\n`);

// Step 4: Mine the block
console.log('Step 4: Mining block with renewable energy...');
energyAI.minePendingTransactions(miner.getAddress(), {
    energySource: 'renewable',
    efficiencyScore: 95
});
console.log('✅ Block mined!\n');

// Step 5: Check balances
console.log('Step 5: Checking balances...');
console.log(`   Solar Farm: ${energyAI.getBalanceOfAddress(solarFarm.getAddress())} EAI`);
console.log(`   Miner: ${energyAI.getBalanceOfAddress(miner.getAddress()).toFixed(2)} EAI (with energy bonus)\n`);

// Step 6: AI company purchases compute resources
console.log('Step 6: AI company receives tokens and purchases compute...');
energyAI.tokenizeEnergy(aiCompany.getAddress(), 50, 'mixed');
energyAI.minePendingTransactions(miner.getAddress());

const computeTx = energyAI.allocateCompute(
    aiCompany.getAddress(),
    solarFarm.getAddress(),
    50, // 50 GPU hours
    'training'
);
computeTx.signTransaction(aiCompany.keyPair);
energyAI.addTransaction(computeTx);

console.log(`   AI Company allocated 50 GPU hours for LLM training`);
console.log(`   Cost: ${computeTx.amount} EAI tokens\n`);

// Step 7: Mine the compute allocation
console.log('Step 7: Mining compute allocation block...');
energyAI.minePendingTransactions(miner.getAddress(), {
    aiComputeUnits: 50,
    energySource: 'mixed',
    efficiencyScore: 70
});
console.log('✅ Block mined!\n');

// Step 8: Final statistics
console.log('Step 8: Final blockchain statistics...');
const stats = energyAI.getStatistics();
console.log(`   Total Blocks: ${stats.totalBlocks}`);
console.log(`   Total Energy Tokenized: ${stats.totalEnergyTokenized}`);
console.log(`   Total AI Compute: ${stats.totalAIComputeUnits}`);
console.log(`   Chain Valid: ${stats.isValid ? '✅ Yes' : '❌ No'}\n`);

// Step 9: Show final balances
console.log('Step 9: Final balances...');
console.log(`   Solar Farm: ${energyAI.getBalanceOfAddress(solarFarm.getAddress()).toFixed(2)} EAI`);
console.log(`   AI Company: ${energyAI.getBalanceOfAddress(aiCompany.getAddress()).toFixed(2)} EAI`);
console.log(`   Miner: ${energyAI.getBalanceOfAddress(miner.getAddress()).toFixed(2)} EAI\n`);

console.log('🎉 Quick start complete! Your blockchain is working!\n');
console.log('Next steps:');
console.log('  • Run "npm run miner" for interactive mining');
console.log('  • Run "npm run node" to start the API server');
console.log('  • Check README.md for more examples\n');
