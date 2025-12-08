import Block from './Block.js';
import Transaction from './Transaction.js';

/**
 * EnergyAI Blockchain - Main blockchain class
 * Manages the chain, mining rewards, and energy tokenization
 */
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4; // Mining difficulty
        this.pendingTransactions = [];
        this.miningReward = 100; // Base mining reward in EnergyAI tokens
        this.energyToTokenRate = 10; // 1 kWh = 10 tokens

        // Energy statistics
        this.totalEnergyTokenized = 0;
        this.totalCarbonOffset = 0;
        this.totalAIComputeUnits = 0;

        // Network participants
        this.validators = new Map(); // Address -> stake
        this.energyProviders = new Map(); // Address -> energy data
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
                energySource: 'renewable',
                efficiencyScore: 100,
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
     * Mine pending transactions and create new block
     */
    minePendingTransactions(miningRewardAddress, energyData = {}) {
        // Calculate total energy for this block
        let totalEnergy = energyData.totalEnergyConsumed || 0;
        let totalCompute = energyData.aiComputeUnits || 0;

        // Add energy from transactions
        for (const tx of this.pendingTransactions) {
            if (tx.transactionType === 'energy_trade') {
                totalEnergy += tx.energyAmount || 0;
            }
            if (tx.transactionType === 'compute_allocation') {
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
                carbonFootprint: energyData.carbonFootprint || totalEnergy * 0.5, // Estimate: 0.5 kg CO2 per kWh
                energySource: energyData.energySource || 'mixed',
                efficiencyScore: energyData.efficiencyScore || 50,
                aiWorkloadType: energyData.aiWorkloadType || 'general',
                computeProof: energyData.computeProof || this.generateComputeProof()
            }
        );

        block.mineBlock(this.difficulty, miningRewardAddress);

        console.log('Block successfully mined!');
        this.chain.push(block);

        // Calculate mining reward with energy bonus
        const baseReward = this.miningReward;
        const energyBonus = block.energyBonus;
        const totalReward = baseReward * energyBonus;

        // Reset pending transactions and add mining reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, totalReward, 'mining_reward', {
                baseReward,
                energyBonus,
                totalReward
            })
        ];

        // Update statistics
        this.totalEnergyTokenized += totalEnergy;
        this.totalCarbonOffset += block.energyData.carbonFootprint;
        this.totalAIComputeUnits += totalCompute;
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
     * Add a new transaction to pending transactions
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
            throw new Error('Insufficient balance');
        }

        this.pendingTransactions.push(transaction);
    }

    /**
     * Tokenize energy - Convert kWh to EnergyAI tokens
     */
    tokenizeEnergy(providerAddress, energyAmount, energySource = 'mixed') {
        const tokens = energyAmount * this.energyToTokenRate;

        // Bonus for renewable energy
        let bonus = 1.0;
        if (energySource === 'renewable') {
            bonus = 1.5;
        } else if (energySource === 'nuclear') {
            bonus = 1.2;
        }

        const totalTokens = tokens * bonus;

        const transaction = new Transaction(
            null, // System generates tokens
            providerAddress,
            totalTokens,
            'energy_trade',
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

        return totalTokens;
    }

    /**
     * Allocate compute resources
     */
    allocateCompute(fromAddress, toAddress, computeUnits, aiWorkloadType = 'general') {
        const estimatedEnergy = computeUnits * 0.3; // Estimate: 0.3 kWh per GPU hour
        const cost = estimatedEnergy * this.energyToTokenRate;

        const transaction = new Transaction(
            fromAddress,
            toAddress,
            cost,
            'compute_allocation',
            {
                computeUnits,
                aiWorkloadType,
                estimatedEnergy
            }
        );

        return transaction;
    }

    /**
     * Purchase carbon credits
     */
    purchaseCarbonCredit(fromAddress, carbonAmount) {
        const pricePerKg = 0.5; // 0.5 tokens per kg CO2
        const cost = carbonAmount * pricePerKg;

        const transaction = new Transaction(
            fromAddress,
            'CARBON_OFFSET_POOL',
            cost,
            'carbon_credit',
            {
                carbonAmount,
                creditType: 'offset'
            }
        );

        this.totalCarbonOffset += carbonAmount;
        return transaction;
    }

    /**
     * Get balance of an address
     */
    getBalanceOfAddress(address) {
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

        return balance;
    }

    /**
     * Get all transactions for an address
     */
    getAllTransactionsForAddress(address) {
        const transactions = [];

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
     * Get blockchain statistics
     */
    getStatistics() {
        return {
            totalBlocks: this.chain.length,
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            energyToTokenRate: this.energyToTokenRate,
            totalEnergyTokenized: `${this.totalEnergyTokenized.toFixed(2)} kWh`,
            totalCarbonOffset: `${this.totalCarbonOffset.toFixed(2)} kg CO2`,
            totalAIComputeUnits: `${this.totalAIComputeUnits.toFixed(2)} GPU hours`,
            pendingTransactions: this.pendingTransactions.length,
            validators: this.validators.size,
            energyProviders: this.energyProviders.size,
            isValid: this.isChainValid()
        };
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
