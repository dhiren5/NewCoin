import Blockchain from './core/Blockchain.js';
import Transaction from './core/Transaction.js';
import Wallet from './wallet/Wallet.js';

/**
 * Test Suite for EnergyAI Blockchain
 */

console.log('🧪 Running EnergyAI Blockchain Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(description, testFn) {
    try {
        testFn();
        console.log(`✅ PASS: ${description}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ FAIL: ${description}`);
        console.log(`   Error: ${error.message}`);
        testsFailed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// ============================================
// BLOCKCHAIN TESTS
// ============================================
console.log('📦 BLOCKCHAIN TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Blockchain initializes with genesis block', () => {
    const blockchain = new Blockchain();
    assert(blockchain.chain.length === 1, 'Should have 1 block');
    assert(blockchain.chain[0].previousHash === '0', 'Genesis block should have previousHash of 0');
});

test('Can add and mine transactions', () => {
    const blockchain = new Blockchain();
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    // Give wallet1 some tokens
    blockchain.tokenizeEnergy(wallet1.getAddress(), 10, 'renewable');
    blockchain.minePendingTransactions(wallet1.getAddress());

    const balance1 = blockchain.getBalanceOfAddress(wallet1.getAddress());
    assert(balance1 > 0, 'Wallet1 should have tokens');

    // Create and sign transaction
    const tx = new Transaction(wallet1.getAddress(), wallet2.getAddress(), 50, 'transfer');
    tx.signTransaction(wallet1.keyPair);
    blockchain.addTransaction(tx);

    blockchain.minePendingTransactions(wallet1.getAddress());

    const balance2 = blockchain.getBalanceOfAddress(wallet2.getAddress());
    assert(balance2 === 50, 'Wallet2 should have 50 tokens');
});

test('Blockchain validates correctly', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.minePendingTransactions(wallet.getAddress());
    blockchain.minePendingTransactions(wallet.getAddress());

    assert(blockchain.isChainValid(), 'Blockchain should be valid');
});

test('Tampered blockchain is invalid', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.minePendingTransactions(wallet.getAddress());
    blockchain.minePendingTransactions(wallet.getAddress());

    // Tamper with a block
    blockchain.chain[1].transactions[0].amount = 999999;

    assert(!blockchain.isChainValid(), 'Tampered blockchain should be invalid');
});

// ============================================
// ENERGY TOKENIZATION TESTS
// ============================================
console.log('\n⚡ ENERGY TOKENIZATION TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Energy tokenization with renewable bonus', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    const tokens = blockchain.tokenizeEnergy(wallet.getAddress(), 10, 'renewable');

    // 10 kWh * 10 tokens/kWh * 1.5 renewable bonus = 150 tokens
    assert(tokens === 150, `Should generate 150 tokens, got ${tokens}`);
});

test('Energy tokenization with mixed source', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    const tokens = blockchain.tokenizeEnergy(wallet.getAddress(), 10, 'mixed');

    // 10 kWh * 10 tokens/kWh * 1.0 (no bonus) = 100 tokens
    assert(tokens === 100, `Should generate 100 tokens, got ${tokens}`);
});

test('Energy provider tracking', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.tokenizeEnergy(wallet.getAddress(), 50, 'renewable');
    blockchain.tokenizeEnergy(wallet.getAddress(), 30, 'renewable');

    const provider = blockchain.energyProviders.get(wallet.getAddress());
    assert(provider.totalEnergy === 80, 'Should track total energy');
});

// ============================================
// TRANSACTION TESTS
// ============================================
console.log('\n💱 TRANSACTION TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Transaction signing and validation', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    const tx = new Transaction(wallet1.getAddress(), wallet2.getAddress(), 100);
    tx.signTransaction(wallet1.keyPair);

    assert(tx.isValid(), 'Signed transaction should be valid');
});

test('Cannot sign transaction for another wallet', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();
    const wallet3 = new Wallet();

    const tx = new Transaction(wallet1.getAddress(), wallet2.getAddress(), 100);

    let errorThrown = false;
    try {
        tx.signTransaction(wallet3.keyPair);
    } catch (error) {
        errorThrown = true;
    }

    assert(errorThrown, 'Should throw error when signing for another wallet');
});

test('Energy trade transaction', () => {
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    const tx = new Transaction(
        wallet1.getAddress(),
        wallet2.getAddress(),
        500,
        'energy_trade',
        {
            energyAmount: 50,
            pricePerKWh: 10,
            energySource: 'renewable'
        }
    );

    assert(tx.energyAmount === 50, 'Should have energy amount');
    assert(tx.energySource === 'renewable', 'Should have energy source');
});

test('Compute allocation transaction', () => {
    const blockchain = new Blockchain();
    const wallet1 = new Wallet();
    const wallet2 = new Wallet();

    const tx = blockchain.allocateCompute(
        wallet1.getAddress(),
        wallet2.getAddress(),
        100,
        'training'
    );

    assert(tx.computeUnits === 100, 'Should have compute units');
    assert(tx.aiWorkloadType === 'training', 'Should have workload type');
});

// ============================================
// WALLET TESTS
// ============================================
console.log('\n💰 WALLET TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Wallet creation', () => {
    const wallet = new Wallet();

    assert(wallet.publicKey, 'Should have public key');
    assert(wallet.privateKey, 'Should have private key');
    assert(wallet.getAddress(), 'Should have address');
});

test('Wallet export and import', () => {
    const wallet1 = new Wallet();
    const exported = wallet1.export();

    const wallet2 = Wallet.import(exported);

    assert(wallet1.getAddress() === wallet2.getAddress(), 'Imported wallet should have same address');
    assert(wallet1.getPrivateKey() === wallet2.getPrivateKey(), 'Imported wallet should have same private key');
});

test('Wallet balance calculation', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.tokenizeEnergy(wallet.getAddress(), 10, 'renewable');
    blockchain.minePendingTransactions(wallet.getAddress());

    const balance = wallet.getBalance(blockchain);
    assert(balance > 0, 'Wallet should have positive balance');
});

// ============================================
// MINING TESTS
// ============================================
console.log('\n⛏️  MINING TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Mining reward with energy bonus', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.minePendingTransactions(wallet.getAddress(), {
        energySource: 'renewable',
        efficiencyScore: 90
    });

    blockchain.minePendingTransactions(wallet.getAddress());

    const balance = blockchain.getBalanceOfAddress(wallet.getAddress());
    assert(balance > blockchain.miningReward, 'Should have bonus reward');
});

test('Block hash starts with correct difficulty', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    blockchain.minePendingTransactions(wallet.getAddress());

    const lastBlock = blockchain.getLatestBlock();
    const prefix = lastBlock.hash.substring(0, blockchain.difficulty);
    const expectedPrefix = '0'.repeat(blockchain.difficulty);

    assert(prefix === expectedPrefix, `Hash should start with ${blockchain.difficulty} zeros`);
});

// ============================================
// CARBON CREDIT TESTS
// ============================================
console.log('\n🌱 CARBON CREDIT TESTS');
console.log('─────────────────────────────────────────────────────────\n');

test('Carbon credit purchase', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    const tx = blockchain.purchaseCarbonCredit(wallet.getAddress(), 100);

    assert(tx.carbonAmount === 100, 'Should have carbon amount');
    assert(tx.creditType === 'offset', 'Should be offset type');
});

test('Carbon offset tracking', () => {
    const blockchain = new Blockchain();
    const wallet = new Wallet();

    const initialOffset = blockchain.totalCarbonOffset;

    blockchain.minePendingTransactions(wallet.getAddress(), {
        carbonFootprint: 50
    });

    assert(blockchain.totalCarbonOffset > initialOffset, 'Should track carbon offset');
});

// ============================================
// TEST SUMMARY
// ============================================
console.log('\n═══════════════════════════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total: ${testsPassed + testsFailed}`);
console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════\n');

if (testsFailed === 0) {
    console.log('🎉 All tests passed! The blockchain is working correctly.\n');
} else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
}
