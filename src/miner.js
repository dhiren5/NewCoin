import Blockchain from './core/Blockchain.js';
import Wallet from './wallet/Wallet.js';
import readline from 'readline';

/**
 * Interactive Miner for EnergyAI Blockchain
 * Allows users to mine blocks with custom energy configurations
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let blockchain = new Blockchain();
let minerWallet = new Wallet();
minerWallet.walletType = 'miner';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           ⛏️  EnergyAI Blockchain Miner ⛏️                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Miner Address: ${minerWallet.getWalletId()}`);
console.log(`Public Key: ${minerWallet.getAddress().substring(0, 30)}...\n`);

function displayMenu() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('MINER MENU');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1. Mine new block (Renewable Energy)');
    console.log('2. Mine new block (Mixed Energy)');
    console.log('3. Mine new block (Fossil Fuel)');
    console.log('4. View blockchain statistics');
    console.log('5. View miner balance');
    console.log('6. View recent blocks');
    console.log('7. Validate blockchain');
    console.log('8. Exit');
    console.log('═══════════════════════════════════════════════════════════\n');
}

function mineBlock(energySource, efficiencyScore) {
    console.log(`\n⛏️  Mining new block with ${energySource} energy...`);

    const energyData = {
        totalEnergyConsumed: Math.random() * 10 + 5, // 5-15 kWh
        aiComputeUnits: Math.random() * 20 + 10, // 10-30 GPU hours
        carbonFootprint: 0,
        energySource: energySource,
        efficiencyScore: efficiencyScore,
        aiWorkloadType: 'mining'
    };

    // Calculate carbon footprint based on energy source
    if (energySource === 'renewable') {
        energyData.carbonFootprint = 0;
    } else if (energySource === 'mixed') {
        energyData.carbonFootprint = energyData.totalEnergyConsumed * 0.5;
    } else {
        energyData.carbonFootprint = energyData.totalEnergyConsumed * 0.8;
    }

    const startTime = Date.now();
    blockchain.minePendingTransactions(minerWallet.getAddress(), energyData);
    const endTime = Date.now();

    console.log(`✅ Block mined in ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`   Energy consumed: ${energyData.totalEnergyConsumed.toFixed(2)} kWh`);
    console.log(`   Carbon footprint: ${energyData.carbonFootprint.toFixed(2)} kg CO2`);
    console.log(`   Efficiency score: ${energyData.efficiencyScore}/100`);
    console.log(`   New balance: ${blockchain.getBalanceOfAddress(minerWallet.getAddress()).toFixed(2)} EAI`);
}

function showStats() {
    const stats = blockchain.getStatistics();
    console.log('\n📊 BLOCKCHAIN STATISTICS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Blocks: ${stats.totalBlocks}`);
    console.log(`Mining Difficulty: ${stats.difficulty}`);
    console.log(`Total Energy Tokenized: ${stats.totalEnergyTokenized}`);
    console.log(`Total Carbon Offset: ${stats.totalCarbonOffset}`);
    console.log(`Total AI Compute: ${stats.totalAIComputeUnits}`);
    console.log(`Pending Transactions: ${stats.pendingTransactions}`);
    console.log(`Chain Valid: ${stats.isValid ? '✅ Yes' : '❌ No'}`);
}

function showBalance() {
    const balance = blockchain.getBalanceOfAddress(minerWallet.getAddress());
    console.log(`\n💰 Miner Balance: ${balance.toFixed(2)} EAI tokens`);
}

function showRecentBlocks() {
    console.log('\n📦 RECENT BLOCKS');
    console.log('═══════════════════════════════════════════════════════════');

    const recentBlocks = blockchain.chain.slice(-5);
    recentBlocks.forEach((block, index) => {
        const summary = block.getSummary();
        console.log(`\nBlock #${blockchain.chain.length - 5 + index}`);
        console.log(`Hash: ${summary.hash.substring(0, 30)}...`);
        console.log(`Energy: ${summary.energyConsumed}`);
        console.log(`Carbon: ${summary.carbonFootprint}`);
        console.log(`Source: ${summary.energySource}`);
        console.log(`Bonus: ${summary.energyBonus}x`);
    });
}

function validateChain() {
    const isValid = blockchain.isChainValid();
    console.log(`\n🔍 Blockchain Validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
}

function handleChoice(choice) {
    switch (choice) {
        case '1':
            mineBlock('renewable', 90 + Math.random() * 10);
            displayMenu();
            promptUser();
            break;
        case '2':
            mineBlock('mixed', 60 + Math.random() * 20);
            displayMenu();
            promptUser();
            break;
        case '3':
            mineBlock('fossil', 40 + Math.random() * 20);
            displayMenu();
            promptUser();
            break;
        case '4':
            showStats();
            displayMenu();
            promptUser();
            break;
        case '5':
            showBalance();
            displayMenu();
            promptUser();
            break;
        case '6':
            showRecentBlocks();
            displayMenu();
            promptUser();
            break;
        case '7':
            validateChain();
            displayMenu();
            promptUser();
            break;
        case '8':
            console.log('\n👋 Thanks for mining! Goodbye.\n');
            rl.close();
            process.exit(0);
            break;
        default:
            console.log('❌ Invalid choice. Please try again.');
            displayMenu();
            promptUser();
    }
}

function promptUser() {
    rl.question('Enter your choice (1-8): ', handleChoice);
}

// Start the miner
displayMenu();
promptUser();
