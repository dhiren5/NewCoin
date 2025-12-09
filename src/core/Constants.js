/**
 * EnergyAI Blockchain Constants
 * Centralized configuration for blockchain parameters
 */

export const BLOCKCHAIN_CONFIG = {
    // Mining Configuration
    INITIAL_DIFFICULTY: 4,
    MIN_DIFFICULTY: 2,
    MAX_DIFFICULTY: 8,
    DIFFICULTY_ADJUSTMENT_INTERVAL: 10, // blocks
    TARGET_BLOCK_TIME: 10000, // 10 seconds in milliseconds
    
    // Rewards
    BASE_MINING_REWARD: 100,
    HALVING_INTERVAL: 210000, // blocks
    
    // Energy Tokenization
    ENERGY_TO_TOKEN_RATE: 10, // 1 kWh = 10 tokens
    
    // Energy Bonuses
    RENEWABLE_ENERGY_BONUS: 1.5,
    NUCLEAR_ENERGY_BONUS: 1.2,
    HIGH_EFFICIENCY_THRESHOLD: 80,
    HIGH_EFFICIENCY_BONUS: 1.3,
    MEDIUM_EFFICIENCY_THRESHOLD: 60,
    MEDIUM_EFFICIENCY_BONUS: 1.1,
    INFERENCE_WORKLOAD_BONUS: 1.2,
    
    // Compute Estimation
    KWH_PER_GPU_HOUR: 0.3,
    AVG_GPU_POWER_WATTS: 250,
    CO2_PER_KWH: 0.5, // kg
    
    // Carbon Credits
    CARBON_CREDIT_PRICE_PER_KG: 0.5,
    
    // Transaction Pool
    MAX_PENDING_TRANSACTIONS: 1000,
    TRANSACTION_FEE_PERCENTAGE: 0.001, // 0.1%
    
    // Cache Configuration
    CACHE_TTL: 5000, // 5 seconds
    ENABLE_BALANCE_CACHE: true,
    ENABLE_STATS_CACHE: true,
    
    // Genesis Block
    GENESIS_ENERGY_SOURCE: 'renewable',
    GENESIS_EFFICIENCY_SCORE: 100,
};

export const TRANSACTION_TYPES = {
    TRANSFER: 'transfer',
    ENERGY_TRADE: 'energy_trade',
    COMPUTE_ALLOCATION: 'compute_allocation',
    CARBON_CREDIT: 'carbon_credit',
    MINING_REWARD: 'mining_reward',
};

export const ENERGY_SOURCES = {
    RENEWABLE: 'renewable',
    NUCLEAR: 'nuclear',
    FOSSIL: 'fossil',
    MIXED: 'mixed',
};

export const AI_WORKLOAD_TYPES = {
    TRAINING: 'training',
    INFERENCE: 'inference',
    GENERAL: 'general',
    GENESIS: 'genesis',
};

export const VALIDATION_LIMITS = {
    MIN_TRANSACTION_AMOUNT: 0.000001,
    MAX_TRANSACTION_AMOUNT: 1000000000,
    MIN_ENERGY_AMOUNT: 0.001,
    MAX_ENERGY_AMOUNT: 1000000,
    MIN_COMPUTE_UNITS: 0.1,
    MAX_COMPUTE_UNITS: 100000,
    MIN_CARBON_AMOUNT: 0.001,
    MAX_CARBON_AMOUNT: 1000000,
};
