import express from 'express';
import Blockchain from './core/Blockchain.js';
import Transaction from './core/Transaction.js';
import Wallet from './wallet/Wallet.js';

/**
 * EnergyAI Blockchain Node - REST API Server
 * Provides HTTP endpoints for blockchain interaction
 */

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize blockchain and node wallet
const blockchain = new Blockchain();
const nodeWallet = new Wallet();
nodeWallet.walletType = 'node';

console.log('🚀 Starting EnergyAI Blockchain Node...');
console.log(`Node Address: ${nodeWallet.getWalletId()}\n`);

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /blockchain
 * Get the entire blockchain
 */
app.get('/blockchain', (req, res) => {
    res.json({
        success: true,
        blockchain: blockchain.chain,
        length: blockchain.chain.length
    });
});

/**
 * GET /stats
 * Get blockchain statistics
 */
app.get('/stats', (req, res) => {
    res.json({
        success: true,
        statistics: blockchain.getStatistics()
    });
});

/**
 * GET /balance/:address
 * Get balance for an address
 */
app.get('/balance/:address', (req, res) => {
    const balance = blockchain.getBalanceOfAddress(req.params.address);
    res.json({
        success: true,
        address: req.params.address,
        balance: balance
    });
});

/**
 * GET /transactions/:address
 * Get all transactions for an address
 */
app.get('/transactions/:address', (req, res) => {
    const transactions = blockchain.getAllTransactionsForAddress(req.params.address);
    res.json({
        success: true,
        address: req.params.address,
        transactions: transactions.map(tx => tx.getSummary())
    });
});

/**
 * POST /transaction/create
 * Create a new transaction
 */
app.post('/transaction/create', (req, res) => {
    try {
        const { fromAddress, toAddress, amount, type, metadata } = req.body;

        const transaction = new Transaction(
            fromAddress,
            toAddress,
            amount,
            type || 'transfer',
            metadata || {}
        );

        res.json({
            success: true,
            message: 'Transaction created (needs to be signed)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /transaction/submit
 * Submit a signed transaction
 */
app.post('/transaction/submit', (req, res) => {
    try {
        const { transaction } = req.body;

        // Recreate transaction object
        const tx = new Transaction(
            transaction.fromAddress,
            transaction.toAddress,
            transaction.amount,
            transaction.transactionType,
            transaction.metadata
        );
        tx.signature = transaction.signature;

        blockchain.addTransaction(tx);

        res.json({
            success: true,
            message: 'Transaction added to pending pool',
            pendingCount: blockchain.pendingTransactions.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /mine
 * Mine pending transactions
 */
app.post('/mine', (req, res) => {
    try {
        const { minerAddress, energyData } = req.body;

        const address = minerAddress || nodeWallet.getAddress();

        blockchain.minePendingTransactions(address, energyData || {});

        res.json({
            success: true,
            message: 'Block mined successfully',
            minerAddress: address,
            newBalance: blockchain.getBalanceOfAddress(address),
            blockCount: blockchain.chain.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /energy/tokenize
 * Tokenize energy
 */
app.post('/energy/tokenize', (req, res) => {
    try {
        const { providerAddress, energyAmount, energySource } = req.body;

        const tokens = blockchain.tokenizeEnergy(
            providerAddress,
            energyAmount,
            energySource || 'mixed'
        );

        res.json({
            success: true,
            message: 'Energy tokenized successfully',
            energyAmount: energyAmount,
            tokensGenerated: tokens,
            energySource: energySource
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /compute/allocate
 * Allocate compute resources
 */
app.post('/compute/allocate', (req, res) => {
    try {
        const { fromAddress, toAddress, computeUnits, aiWorkloadType } = req.body;

        const transaction = blockchain.allocateCompute(
            fromAddress,
            toAddress,
            computeUnits,
            aiWorkloadType || 'general'
        );

        res.json({
            success: true,
            message: 'Compute allocation created (needs to be signed and submitted)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /carbon/purchase
 * Purchase carbon credits
 */
app.post('/carbon/purchase', (req, res) => {
    try {
        const { fromAddress, carbonAmount } = req.body;

        const transaction = blockchain.purchaseCarbonCredit(
            fromAddress,
            carbonAmount
        );

        res.json({
            success: true,
            message: 'Carbon credit purchase created (needs to be signed and submitted)',
            transaction: transaction.getSummary()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /leaderboard
 * Get energy provider leaderboard
 */
app.get('/leaderboard', (req, res) => {
    res.json({
        success: true,
        leaderboard: blockchain.getEnergyLeaderboard()
    });
});

/**
 * POST /wallet/create
 * Create a new wallet
 */
app.post('/wallet/create', (req, res) => {
    const wallet = new Wallet();
    wallet.walletType = req.body.walletType || 'standard';

    res.json({
        success: true,
        wallet: wallet.export()
    });
});

/**
 * GET /validate
 * Validate the blockchain
 */
app.get('/validate', (req, res) => {
    const isValid = blockchain.isChainValid();

    res.json({
        success: true,
        isValid: isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is corrupted'
    });
});

/**
 * GET /block/:index
 * Get a specific block
 */
app.get('/block/:index', (req, res) => {
    const index = parseInt(req.params.index);

    if (index < 0 || index >= blockchain.chain.length) {
        return res.status(404).json({
            success: false,
            error: 'Block not found'
        });
    }

    res.json({
        success: true,
        block: blockchain.chain[index].getSummary()
    });
});

/**
 * GET /
 * API information
 */
app.get('/', (req, res) => {
    res.json({
        name: 'EnergyAI Blockchain Node',
        version: '1.0.0',
        description: 'Energy token blockchain for AI computation and compute power',
        endpoints: {
            'GET /': 'API information',
            'GET /blockchain': 'Get entire blockchain',
            'GET /stats': 'Get blockchain statistics',
            'GET /balance/:address': 'Get balance for address',
            'GET /transactions/:address': 'Get transactions for address',
            'GET /block/:index': 'Get specific block',
            'GET /leaderboard': 'Get energy provider leaderboard',
            'GET /validate': 'Validate blockchain',
            'POST /transaction/create': 'Create new transaction',
            'POST /transaction/submit': 'Submit signed transaction',
            'POST /mine': 'Mine pending transactions',
            'POST /energy/tokenize': 'Tokenize energy',
            'POST /compute/allocate': 'Allocate compute resources',
            'POST /carbon/purchase': 'Purchase carbon credits',
            'POST /wallet/create': 'Create new wallet'
        },
        nodeAddress: nodeWallet.getAddress(),
        nodeId: nodeWallet.getWalletId()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ EnergyAI Blockchain Node running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}`);
    console.log(`🔗 Node ID: ${nodeWallet.getWalletId()}\n`);
    console.log('Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/stats`);
    console.log(`   GET  http://localhost:${PORT}/blockchain`);
    console.log(`   POST http://localhost:${PORT}/mine`);
    console.log(`   POST http://localhost:${PORT}/energy/tokenize`);
    console.log(`   ... and more!\n`);
});

export default app;
