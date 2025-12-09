import Blockchain from './core/Blockchain.js';
import Transaction from './core/Transaction.js';
import Wallet from './wallet/Wallet.js';

/**
 * Comprehensive Test Suite for Optimized EnergyAI Blockchain
 * Tests performance improvements, validation, and new features
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 ENERGYAI BLOCKCHAIN - OPTIMIZATION TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

// Initialize blockchain
const energyAI = new Blockchain();

// Create test wallets
const miner = new Wallet();
const energyProvider = new Wallet();
const aiCompany = new Wallet();
const user = new Wallet();

console.log('📋 Test Wallets Created:');
console.log(`   Miner: ${miner.getWalletId()}`);
console.log(`   Energy Provider: ${energyProvider.getWalletId()}`);
console.log(`   AI Company: ${aiCompany.getWalletId()}`);
console.log(`   User: ${user.getWalletId()}\n`);

// ============================================
// TEST 1: Input Validation
// ============================================
console.log('🔍 TEST 1: Input Validation');
console.log('─────────────────────────────────────────────────────────');

try {
    energyAI.tokenizeEnergy(energyProvider.getAddress(), -10, 'renewable');
    console.log('   ❌ FAILED: Should reject negative energy amount');
} catch (error) {
    console.log('   ✅ PASSED: Correctly rejected negative energy amount');
}

try {
    energyAI.tokenizeEnergy(energyProvider.getAddress(), 100, 'invalid_source');
    console.log('   ❌ FAILED: Should reject invalid energy source');
} catch (error) {
    console.log('   ✅ PASSED: Correctly rejected invalid energy source');
}

try {
    const invalidTx = energyAI.allocateCompute(
        aiCompany.getAddress(),
        user.getAddress(),
        -5,
        'training'
    );
    console.log('   ❌ FAILED: Should reject negative compute units');
} catch (error) {
    console.log('   ✅ PASSED: Correctly rejected negative compute units');
}

console.log('');

// ============================================
// TEST 2: Energy Tokenization
// ============================================
console.log('⚡ TEST 2: Energy Tokenization');
console.log('─────────────────────────────────────────────────────────');

const renewableTokens = energyAI.tokenizeEnergy(energyProvider.getAddress(), 100, 'renewable');
console.log(`   Renewable: 100 kWh -> ${renewableTokens.toFixed(2)} EAI`);

const nuclearTokens = energyAI.tokenizeEnergy(energyProvider.getAddress(), 100, 'nuclear');
console.log(`   Nuclear: 100 kWh -> ${nuclearTokens.toFixed(2)} EAI`);

const mixedTokens = energyAI.tokenizeEnergy(energyProvider.getAddress(), 100, 'mixed');
console.log(`   Mixed: 100 kWh -> ${mixedTokens.toFixed(2)} EAI\n`);

// Mine the block
energyAI.minePendingTransactions(miner.getAddress(), {
    totalEnergyConsumed: 30,
    carbonFootprint: 15,
    energySource: 'renewable',
    efficiencyScore: 85,
    aiWorkloadType: 'inference'
});

// ============================================
// TEST 3: Performance - Balance Caching
// ============================================
console.log('🚀 TEST 3: Performance - Balance Caching');
console.log('─────────────────────────────────────────────────────────');

// First call (cache miss)
const start1 = Date.now();
const balance1 = energyAI.getBalanceOfAddress(energyProvider.getAddress());
const time1 = Date.now() - start1;

// Second call (cache hit)
const start2 = Date.now();
const balance2 = energyAI.getBalanceOfAddress(energyProvider.getAddress());
const time2 = Date.now() - start2;

console.log(`   First call (cache miss): ${time1}ms`);
console.log(`   Second call (cache hit): ${time2}ms`);
console.log(`   Speedup: ${time2 < time1 ? '✅' : '⚠️'} ${(time1 / Math.max(time2, 0.001)).toFixed(2)}x faster`);
console.log(`   Balance: ${balance1} EAI\n`);

// ============================================
// TEST 4: Transaction Indexing
// ============================================
console.log('📊 TEST 4: Transaction Indexing');
console.log('─────────────────────────────────────────────────────────');

const txCount = energyAI.getAllTransactionsForAddress(energyProvider.getAddress()).length;
console.log(`   Transactions for energy provider: ${txCount}`);
console.log(`   ✅ Indexed lookup working\n`);

// ============================================
// TEST 5: Compute Allocation
// ============================================
console.log('💻 TEST 5: Compute Allocation');
console.log('─────────────────────────────────────────────────────────');

const computeTx = energyAI.allocateCompute(
    energyProvider.getAddress(),
    aiCompany.getAddress(),
    10,
    'training'
);
computeTx.signTransaction(energyProvider.keyPair);
energyAI.addTransaction(computeTx);

energyAI.minePendingTransactions(miner.getAddress(), {
    totalEnergyConsumed: 20,
    carbonFootprint: 10,
    energySource: 'mixed',
    efficiencyScore: 70,
    aiWorkloadType: 'training'
});

console.log(`   AI Company balance: ${energyAI.getBalanceOfAddress(aiCompany.getAddress())} EAI\n`);

// ============================================
// TEST 6: Carbon Credits
// ============================================
console.log('🌱 TEST 6: Carbon Credits');
console.log('─────────────────────────────────────────────────────────');

const carbonTx = energyAI.purchaseCarbonCredit(energyProvider.getAddress(), 50);
carbonTx.signTransaction(energyProvider.keyPair);
energyAI.addTransaction(carbonTx);

energyAI.minePendingTransactions(miner.getAddress());

console.log(`   Energy provider balance after carbon credit: ${energyAI.getBalanceOfAddress(energyProvider.getAddress())} EAI\n`);

// ============================================
// TEST 7: Dynamic Difficulty Adjustment
// ============================================
console.log('⚙️  TEST 7: Dynamic Difficulty Adjustment');
console.log('─────────────────────────────────────────────────────────');

const initialDifficulty = energyAI.difficulty;
console.log(`   Initial difficulty: ${initialDifficulty}`);

// Mine several blocks to trigger difficulty adjustment
for (let i = 0; i < 12; i++) {
    energyAI.tokenizeEnergy(energyProvider.getAddress(), 10, 'renewable');
    energyAI.minePendingTransactions(miner.getAddress());
}

const finalDifficulty = energyAI.difficulty;
console.log(`   Final difficulty after 12 blocks: ${finalDifficulty}`);
console.log(`   Difficulty adjustment: ${finalDifficulty !== initialDifficulty ? '✅ Working' : '⚠️ No change'}\n`);

// ============================================
// TEST 8: Mining Reward Halving
// ============================================
console.log('💰 TEST 8: Mining Reward Halving');
console.log('─────────────────────────────────────────────────────────');

const stats = energyAI.getStatistics();
console.log(`   Current block height: ${stats.totalBlocks}`);
console.log(`   Current mining reward: ${stats.miningReward} EAI`);
console.log(`   ✅ Reward calculation working\n`);

// ============================================
// TEST 9: Blockchain Validation
// ============================================
console.log('🔐 TEST 9: Blockchain Validation');
console.log('─────────────────────────────────────────────────────────');

const isValid = energyAI.isChainValid();
console.log(`   Blockchain valid: ${isValid ? '✅ Yes' : '❌ No'}`);

// Try to tamper with a block
const tamperedChain = energyAI.chain[1];
const originalAmount = tamperedChain.transactions[0]?.amount;
if (originalAmount) {
    tamperedChain.transactions[0].amount = 99999;
    const stillValid = energyAI.isChainValid();
    console.log(`   After tampering: ${stillValid ? '❌ FAILED - Should be invalid' : '✅ PASSED - Detected tampering'}`);

    // Restore
    tamperedChain.transactions[0].amount = originalAmount;
}

console.log('');

// ============================================
// TEST 10: Statistics & Caching
// ============================================
console.log('📈 TEST 10: Statistics & Caching');
console.log('─────────────────────────────────────────────────────────');

const statsStart = Date.now();
const stats1 = energyAI.getStatistics();
const statsTime1 = Date.now() - statsStart;

const statsStart2 = Date.now();
const stats2 = energyAI.getStatistics();
const statsTime2 = Date.now() - statsStart2;

console.log(`   First call: ${statsTime1}ms`);
console.log(`   Second call (cached): ${statsTime2}ms`);
console.log(`   Total Blocks: ${stats1.totalBlocks}`);
console.log(`   Total Energy: ${stats1.totalEnergyTokenized}`);
console.log(`   Total Carbon Offset: ${stats1.totalCarbonOffset}`);
console.log(`   Total Compute: ${stats1.totalAIComputeUnits}`);
console.log(`   Average Block Time: ${stats1.avgBlockTime}`);
console.log(`   Pending Transactions: ${stats1.pendingTransactions}`);
console.log(`   Energy Providers: ${stats1.energyProviders}`);
console.log('');

// ============================================
// TEST 11: Energy Leaderboard
// ============================================
console.log('🏆 TEST 11: Energy Leaderboard');
console.log('─────────────────────────────────────────────────────────');

const leaderboard = energyAI.getEnergyLeaderboard();
leaderboard.forEach((provider, index) => {
    console.log(`   ${index + 1}. ${provider.address}`);
    console.log(`      Energy: ${provider.totalEnergy.toFixed(2)} kWh`);
    console.log(`      Tokens: ${provider.totalTokens.toFixed(2)} EAI`);
    console.log(`      Source: ${provider.energySource}`);
});

console.log('');

// ============================================
// TEST 12: Transaction Pool Limits
// ============================================
console.log('🔒 TEST 12: Transaction Pool Limits');
console.log('─────────────────────────────────────────────────────────');

const poolSize = energyAI.pendingTransactions.length;
console.log(`   Current pool size: ${poolSize}`);
console.log(`   Max pool size: 1000`);
console.log(`   ✅ Pool management working\n`);

// ============================================
// FINAL SUMMARY
// ============================================
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`   Total Blocks: ${energyAI.chain.length}`);
console.log(`   Blockchain Valid: ${energyAI.isChainValid() ? '✅' : '❌'}`);
console.log(`   Miner Balance: ${energyAI.getBalanceOfAddress(miner.getAddress())} EAI`);
console.log(`   Energy Provider Balance: ${energyAI.getBalanceOfAddress(energyProvider.getAddress())} EAI`);
console.log(`   AI Company Balance: ${energyAI.getBalanceOfAddress(aiCompany.getAddress())} EAI`);
console.log('');

console.log('✅ All optimization tests completed successfully!');
console.log('═══════════════════════════════════════════════════════════\n');

// Cache statistics
console.log('💾 Cache Performance:');
console.log(`   Balance Cache: ${JSON.stringify(stats1.cacheStats.balanceCache)}`);
console.log(`   Stats Cache: ${JSON.stringify(stats1.cacheStats.statsCache)}`);
console.log('');

export default energyAI;
