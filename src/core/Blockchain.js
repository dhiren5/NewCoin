import Block from './Block.js';
import Transaction from './Transaction.js';
import Cache from '../utils/Cache.js';
import { BLOCKCHAIN_CONFIG, TRANSACTION_TYPES } from './Constants.js';
import {
    validateAmount,
    validateAddress,
    validateEnergyAmount,
    validateComputeUnits,
    validateCarbonAmount,
    validateEnergySource,
    ValidationError
} from '../utils/Validation.js';
import {
    calculateComputeCost,
    calculateCarbonCreditCost,
    calculateMiningReward
} from '../utils/EnergyUtils.js';

/**
 * EnergyAI Blockchain - Main blockchain class (OPTIMIZED)
 * Manages the chain, mining rewards, and energy tokenization
 * 
 * Optimizations:
 * - Balance caching for O(1) lookups
 * - Transaction indexing for fast queries
 * - Dynamic difficulty adjustment
 * - Memory-efficient data structures
 * - Input validation
 */
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = BLOCKCHAIN_CONFIG.INITIAL_DIFFICULTY;
        this.pendingTransactions = [];
        this.miningReward = BLOCKCHAIN_CONFIG.BASE_MINING_REWARD;
        this.energyToTokenRate = BLOCKCHAIN_CONFIG.ENERGY_TO_TOKEN_RATE;

        // Energy statistics
        this.totalEnergyTokenized = 0;
        this.totalCarbonOffset = 0;
        this.totalAIComputeUnits = 0;

        // Network participants
        this.validators = new Map(); // Address -> stake
        this.energyProviders = new Map(); // Address -> energy data

        // Performance optimizations
        this.balanceCache = new Cache(1000, BLOCKCHAIN_CONFIG.CACHE_TTL);
        this.statsCache = new Cache(10, BLOCKCHAIN_CONFIG.CACHE_TTL);
        this.transactionIndex = new Map(); // Address -> transaction indices
        this.blockTimeHistory = []; // For difficulty adjustment

        // Initialize transaction index for genesis block
        this._indexBlock(this.chain[0], 0);
    }

    /**
     * Create the genesis block
     */
    createGenesisBlock() {
        const genesisBlock = new Block(
            Date.now(),
            [],
            '0',
            {
                totalEnergyConsumed: 0,
                aiComputeUnits: 0,
                carbonFootprint: 0,
                energySource: BLOCKCHAIN_CONFIG.GENESIS_ENERGY_SOURCE,
                efficiencyScore: BLOCKCHAIN_CONFIG.GENESIS_EFFICIENCY_SCORE,
                aiWorkloadType: 'genesis',
                computeProof: 'GENESIS_BLOCK'
            }
        );
        genesisBlock.hash = genesisBlock.calculateHash();
        return genesisBlock;
    }

    /**
     * Get the latest block in the chain
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Index a block's transactions for fast lookups
     * @private
     */
    _indexBlock(block, blockIndex) {
        for (let txIndex = 0; txIndex < block.transactions.length; txIndex++) {
            const tx = block.transactions[txIndex];

            // Index by fromAddress
            if (tx.fromAddress) {
                if (!this.transactionIndex.has(tx.fromAddress)) {
                    this.transactionIndex.set(tx.fromAddress, []);
                }
                this.transactionIndex.get(tx.fromAddress).push({ blockIndex, txIndex });
            }

            // Index by toAddress
            if (tx.toAddress) {
                if (!this.transactionIndex.has(tx.toAddress)) {
                    this.transactionIndex.set(tx.toAddress, []);
                }
                this.transactionIndex.get(tx.toAddress).push({ blockIndex, txIndex });
            }
        }
    }

    /**
     * Invalidate caches when blockchain state changes
     * @private
     */
    _invalidateCaches() {
        this.balanceCache.clear();
        this.statsCache.clear();
    }

    /**
     * Adjust mining difficulty based on block time history
     * @private
     */
    _adjustDifficulty() {
        const chainLength = this.chain.length;

        // Only adjust every N blocks
        if (chainLength % BLOCKCHAIN_CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {
            return;
        }

        if (this.blockTimeHistory.length < 2) {
            return;
        }

        // Calculate average block time
        const recentTimes = this.blockTimeHistory.slice(-BLOCKCHAIN_CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL);
        const avgBlockTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;

        // Adjust difficulty
        if (avgBlockTime < BLOCKCHAIN_CONFIG.TARGET_BLOCK_TIME * 0.5) {
            // Blocks too fast, increase difficulty
            this.difficulty = Math.min(
                this.difficulty + 1,
                BLOCKCHAIN_CONFIG.MAX_DIFFICULTY
            );
            console.log(`⬆️  Difficulty increased to ${this.difficulty}`);
        } else if (avgBlockTime > BLOCKCHAIN_CONFIG.TARGET_BLOCK_TIME * 2) {
            // Blocks too slow, decrease difficulty
            this.difficulty = Math.max(
                this.difficulty - 1,
                BLOCKCHAIN_CONFIG.MIN_DIFFICULTY
            );
            console.log(`⬇️  Difficulty decreased to ${this.difficulty}`);
        }
    }

    /**
     * Mine pending transactions and create new block (OPTIMIZED)
     */
    minePendingTransactions(miningRewardAddress, energyData = {}) {
        validateAddress(miningRewardAddress, 'miningRewardAddress');

        const startTime = Date.now();

        // Limit pending transactions to prevent memory issues
        if (this.pendingTransactions.length > BLOCKCHAIN_CONFIG.MAX_PENDING_TRANSACTIONS) {
            console.warn(`⚠️  Transaction pool full, processing first ${BLOCKCHAIN_CONFIG.MAX_PENDING_TRANSACTIONS} transactions`);
            this.pendingTransactions = this.pendingTransactions.slice(0, BLOCKCHAIN_CONFIG.MAX_PENDING_TRANSACTIONS);
        }

        // Calculate total energy for this block
        let totalEnergy = energyData.totalEnergyConsumed || 0;
        let totalCompute = energyData.aiComputeUnits || 0;

        // Add energy from transactions
        for (const tx of this.pendingTransactions) {
            if (tx.transactionType === TRANSACTION_TYPES.ENERGY_TRADE) {
                totalEnergy += tx.energyAmount || 0;
            }
            if (tx.transactionType === TRANSACTION_TYPES.COMPUTE_ALLOCATION) {
                totalCompute += tx.computeUnits || 0;
                totalEnergy += tx.estimatedEnergy || 0;
            }
        }

        // Create new block with energy data
        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash,
            {
                totalEnergyConsumed: totalEnergy,
                aiComputeUnits: totalCompute,
                carbonFootprint: energyData.carbonFootprint || totalEnergy * BLOCKCHAIN_CONFIG.CO2_PER_KWH,
                energySource: energyData.energySource || 'mixed',
                efficiencyScore: energyData.efficiencyScore || 50,
                aiWorkloadType: energyData.aiWorkloadType || 'general',
                computeProof: energyData.computeProof || this.generateComputeProof()
            }
        );

        block.mineBlock(this.difficulty, miningRewardAddress);

        console.log('✅ Block successfully mined!');
        this.chain.push(block);

        // Index the new block for fast lookups
        this._indexBlock(block, this.chain.length - 1);

        // Calculate mining reward with halving and energy bonus
        const baseReward = calculateMiningReward(this.chain.length);
        const energyBonus = block.energyBonus;
        const totalReward = baseReward * energyBonus;

        // Reset pending transactions and add mining reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, totalReward, TRANSACTION_TYPES.MINING_REWARD, {
                baseReward,
                energyBonus,
                totalReward,
                blockHeight: this.chain.length
            })
        ];

        // Update statistics
        this.totalEnergyTokenized += totalEnergy;
        this.totalCarbonOffset += block.energyData.carbonFootprint;
        this.totalAIComputeUnits += totalCompute;

        // Track block time for difficulty adjustment
        const blockTime = Date.now() - startTime;
        this.blockTimeHistory.push(blockTime);

        // Keep only recent history
        if (this.blockTimeHistory.length > BLOCKCHAIN_CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL * 2) {
            this.blockTimeHistory.shift();
        }

        // Adjust difficulty if needed
        this._adjustDifficulty();

        // Invalidate caches
        this._invalidateCaches();
    }

    /**
     * Generate proof of compute (simplified version)
     * In production, this would verify actual AI workload execution
     */
    generateComputeProof() {
        const timestamp = Date.now();
        const randomData = Math.random().toString(36).substring(7);
        return `COMPUTE_PROOF_${timestamp}_${randomData}`;
    }

    /**
     * Add a new transaction to pending transactions (OPTIMIZED)
     */
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        // Verify sender has enough balance
        const balance = this.getBalanceOfAddress(transaction.fromAddress);
        if (balance < transaction.amount) {
            throw new Error(`Insufficient balance. Required: ${transaction.amount}, Available: ${balance}`);
        }

        // Check transaction pool limit
        if (this.pendingTransactions.length >= BLOCKCHAIN_CONFIG.MAX_PENDING_TRANSACTIONS) {
            throw new Error('Transaction pool is full. Please try again later.');
        }

        this.pendingTransactions.push(transaction);
        console.log(`📤 Transaction added to pool (${this.pendingTransactions.length} pending)`);
    }

    /**
     * Tokenize energy - Convert kWh to EnergyAI tokens (OPTIMIZED)
     */
    tokenizeEnergy(providerAddress, energyAmount, energySource = 'mixed') {
        validateAddress(providerAddress, 'providerAddress');
        validateEnergyAmount(energyAmount);
        validateEnergySource(energySource);

        const tokens = energyAmount * this.energyToTokenRate;

        // Bonus for renewable energy
        let bonus = 1.0;
        if (energySource === 'renewable') {
            bonus = BLOCKCHAIN_CONFIG.RENEWABLE_ENERGY_BONUS;
        } else if (energySource === 'nuclear') {
            bonus = BLOCKCHAIN_CONFIG.NUCLEAR_ENERGY_BONUS;
        }

        const totalTokens = tokens * bonus;

        const transaction = new Transaction(
            null, // System generates tokens
            providerAddress,
            totalTokens,
            TRANSACTION_TYPES.ENERGY_TRADE,
            {
                energyAmount,
                pricePerKWh: this.energyToTokenRate,
                energySource,
                bonus
            }
        );

        this.pendingTransactions.push(transaction);

        // Track energy provider
        if (!this.energyProviders.has(providerAddress)) {
            this.energyProviders.set(providerAddress, {
                totalEnergy: 0,
                totalTokens: 0,
                energySource
            });
        }

        const provider = this.energyProviders.get(providerAddress);
        provider.totalEnergy += energyAmount;
        provider.totalTokens += totalTokens;

        console.log(`⚡ Tokenized ${energyAmount} kWh -> ${totalTokens.toFixed(2)} EAI (${energySource})`);
        return totalTokens;
    }

    /**
     * Allocate compute resources (OPTIMIZED)
     */
    allocateCompute(fromAddress, toAddress, computeUnits, aiWorkloadType = 'general') {
        validateAddress(fromAddress, 'fromAddress');
        validateAddress(toAddress, 'toAddress');
        validateComputeUnits(computeUnits);

        const { cost, estimatedEnergy } = calculateComputeCost(computeUnits);

        const transaction = new Transaction(
            fromAddress,
            toAddress,
            cost,
            TRANSACTION_TYPES.COMPUTE_ALLOCATION,
            {
                computeUnits,
                aiWorkloadType,
                estimatedEnergy
            }
        );

        console.log(`💻 Allocated ${computeUnits} GPU hours (~${estimatedEnergy.toFixed(2)} kWh)`);
        return transaction;
    }

    /**
     * Purchase carbon credits (OPTIMIZED)
     */
    purchaseCarbonCredit(fromAddress, carbonAmount) {
        validateAddress(fromAddress, 'fromAddress');
        validateCarbonAmount(carbonAmount);

        const cost = calculateCarbonCreditCost(carbonAmount);

        const transaction = new Transaction(
            fromAddress,
            'CARBON_OFFSET_POOL',
            cost,
            TRANSACTION_TYPES.CARBON_CREDIT,
            {
                carbonAmount,
                creditType: 'offset'
            }
        );

        this.totalCarbonOffset += carbonAmount;
        console.log(`🌱 Purchased ${carbonAmount} kg CO2 credits for ${cost.toFixed(2)} EAI`);
        return transaction;
    }

    /**
     * Get balance of an address (OPTIMIZED with caching)
     * Performance: O(1) with cache, O(n*m) without cache
     */
    getBalanceOfAddress(address) {
        // Check cache first
        if (BLOCKCHAIN_CONFIG.ENABLE_BALANCE_CACHE) {
            const cached = this.balanceCache.get(`balance_${address}`);
            if (cached !== null) {
                return cached;
            }
        }

        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        // Cache the result
        if (BLOCKCHAIN_CONFIG.ENABLE_BALANCE_CACHE) {
            this.balanceCache.set(`balance_${address}`, balance);
        }

        return balance;
    }

    /**
     * Get all transactions for an address (OPTIMIZED with indexing)
     * Performance: O(k) where k is number of transactions for address
     */
    getAllTransactionsForAddress(address) {
        const transactions = [];

        // Use index if available
        const indices = this.transactionIndex.get(address);
        if (indices) {
            for (const { blockIndex, txIndex } of indices) {
                const tx = this.chain[blockIndex].transactions[txIndex];
                transactions.push(tx);
            }
            return transactions;
        }

        // Fallback to linear search (for addresses not in index)
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address || trans.toAddress === address) {
                    transactions.push(trans);
                }
            }
        }

        return transactions;
    }

    /**
     * Validate the entire blockchain
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Validate transactions in block
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            // Validate block hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Validate chain linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get blockchain statistics (OPTIMIZED with caching)
     */
    getStatistics() {
        // Check cache first
        if (BLOCKCHAIN_CONFIG.ENABLE_STATS_CACHE) {
            const cached = this.statsCache.get('blockchain_stats');
            if (cached !== null) {
                return cached;
            }
        }

        const stats = {
            totalBlocks: this.chain.length,
            difficulty: this.difficulty,
            miningReward: calculateMiningReward(this.chain.length),
            energyToTokenRate: this.energyToTokenRate,
            totalEnergyTokenized: `${this.totalEnergyTokenized.toFixed(2)} kWh`,
            totalCarbonOffset: `${this.totalCarbonOffset.toFixed(2)} kg CO2`,
            totalAIComputeUnits: `${this.totalAIComputeUnits.toFixed(2)} GPU hours`,
            pendingTransactions: this.pendingTransactions.length,
            validators: this.validators.size,
            energyProviders: this.energyProviders.size,
            isValid: this.isChainValid(),
            avgBlockTime: this.blockTimeHistory.length > 0
                ? `${(this.blockTimeHistory.reduce((a, b) => a + b, 0) / this.blockTimeHistory.length / 1000).toFixed(2)}s`
                : 'N/A',
            cacheStats: {
                balanceCache: this.balanceCache.getStats(),
                statsCache: this.statsCache.getStats()
            }
        };

        // Cache the result
        if (BLOCKCHAIN_CONFIG.ENABLE_STATS_CACHE) {
            this.statsCache.set('blockchain_stats', stats);
        }

        return stats;
    }

    /**
     * Get energy leaderboard
     */
    getEnergyLeaderboard() {
        const leaderboard = [];

        for (const [address, data] of this.energyProviders) {
            leaderboard.push({
                address: address.substring(0, 10) + '...',
                totalEnergy: data.totalEnergy,
                totalTokens: data.totalTokens,
                energySource: data.energySource
            });
        }

        return leaderboard.sort((a, b) => b.totalEnergy - a.totalEnergy);
    }
}

export default Blockchain;
