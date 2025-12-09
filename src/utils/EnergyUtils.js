import { BLOCKCHAIN_CONFIG } from '../core/Constants.js';

/**
 * Energy calculation utilities
 * Centralized logic for energy-related calculations
 */

/**
 * Calculate energy bonus based on source and efficiency
 */
export function calculateEnergyBonus(energySource, efficiencyScore, aiWorkloadType) {
    let bonus = 1.0;

    // Bonus for renewable energy
    if (energySource === 'renewable') {
        bonus *= BLOCKCHAIN_CONFIG.RENEWABLE_ENERGY_BONUS;
    } else if (energySource === 'nuclear') {
        bonus *= BLOCKCHAIN_CONFIG.NUCLEAR_ENERGY_BONUS;
    }

    // Bonus for high efficiency
    if (efficiencyScore > BLOCKCHAIN_CONFIG.HIGH_EFFICIENCY_THRESHOLD) {
        bonus *= BLOCKCHAIN_CONFIG.HIGH_EFFICIENCY_BONUS;
    } else if (efficiencyScore > BLOCKCHAIN_CONFIG.MEDIUM_EFFICIENCY_THRESHOLD) {
        bonus *= BLOCKCHAIN_CONFIG.MEDIUM_EFFICIENCY_BONUS;
    }

    // Bonus for AI inference (more efficient than training)
    if (aiWorkloadType === 'inference') {
        bonus *= BLOCKCHAIN_CONFIG.INFERENCE_WORKLOAD_BONUS;
    }

    return bonus;
}

/**
 * Estimate energy consumption for mining
 */
export function estimateEnergyConsumption(timeInSeconds = 1) {
    const avgPowerWatts = BLOCKCHAIN_CONFIG.AVG_GPU_POWER_WATTS;
    const kWh = (avgPowerWatts * timeInSeconds) / (1000 * 3600);
    return kWh;
}

/**
 * Calculate carbon footprint from energy consumption
 */
export function calculateCarbonFootprint(energyKWh, energySource = 'mixed') {
    let multiplier = BLOCKCHAIN_CONFIG.CO2_PER_KWH;

    // Adjust based on energy source
    switch (energySource) {
        case 'renewable':
            multiplier *= 0.1; // 90% reduction
            break;
        case 'nuclear':
            multiplier *= 0.2; // 80% reduction
            break;
        case 'fossil':
            multiplier *= 1.5; // 50% increase
            break;
        default:
            // mixed - use default
            break;
    }

    return energyKWh * multiplier;
}

/**
 * Calculate compute cost in tokens
 */
export function calculateComputeCost(computeUnits) {
    const estimatedEnergy = computeUnits * BLOCKCHAIN_CONFIG.KWH_PER_GPU_HOUR;
    const cost = estimatedEnergy * BLOCKCHAIN_CONFIG.ENERGY_TO_TOKEN_RATE;
    return { cost, estimatedEnergy };
}

/**
 * Calculate carbon credit cost
 */
export function calculateCarbonCreditCost(carbonAmount) {
    return carbonAmount * BLOCKCHAIN_CONFIG.CARBON_CREDIT_PRICE_PER_KG;
}

/**
 * Calculate mining reward with halving
 */
export function calculateMiningReward(blockHeight) {
    const halvings = Math.floor(blockHeight / BLOCKCHAIN_CONFIG.HALVING_INTERVAL);
    const reward = BLOCKCHAIN_CONFIG.BASE_MINING_REWARD / Math.pow(2, halvings);
    return Math.max(reward, 0.00000001); // Minimum reward
}

/**
 * Calculate transaction fee
 */
export function calculateTransactionFee(amount) {
    return amount * BLOCKCHAIN_CONFIG.TRANSACTION_FEE_PERCENTAGE;
}
