import crypto from 'crypto';
import { calculateEnergyBonus, estimateEnergyConsumption } from '../utils/EnergyUtils.js';
import { BLOCKCHAIN_CONFIG } from './Constants.js';

/**
 * Block class representing a single block in the EnergyAI blockchain (OPTIMIZED)
 * Each block contains energy computation data and AI workload verification
 */
class Block {
  constructor(timestamp, transactions, previousHash = '', energyData = {}) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = '';
    this.nonce = 0;

    // Energy-specific data
    this.energyData = {
      totalEnergyConsumed: energyData.totalEnergyConsumed || 0, // in kWh
      aiComputeUnits: energyData.aiComputeUnits || 0, // GPU/TPU hours
      carbonFootprint: energyData.carbonFootprint || 0, // in kg CO2
      energySource: energyData.energySource || 'mixed', // renewable, fossil, nuclear, mixed
      efficiencyScore: energyData.efficiencyScore || 0, // 0-100
      aiWorkloadType: energyData.aiWorkloadType || 'general', // training, inference, general
      computeProof: energyData.computeProof || null // Proof of actual AI computation
    };

    // Calculate energy efficiency bonus using centralized utility
    this.energyBonus = calculateEnergyBonus(
      this.energyData.energySource,
      this.energyData.efficiencyScore,
      this.energyData.aiWorkloadType
    );
  }

  /**
   * Calculate hash for the block using SHA-256
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        JSON.stringify(this.energyData) +
        this.nonce
      )
      .digest('hex');
  }

  /**
   * Proof of Compute - Mine block with energy-aware difficulty
   * Difficulty adjusts based on energy efficiency
   */
  mineBlock(difficulty, minerAddress) {
    const target = Array(difficulty + 1).join('0');

    // Start mining
    const startTime = Date.now();
    const startEnergy = this.estimateEnergyConsumption();

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    const endTime = Date.now();
    const miningTime = (endTime - startTime) / 1000; // in seconds
    const energyUsed = this.estimateEnergyConsumption(miningTime);

    // Record mining energy data
    this.miningMetrics = {
      minerAddress,
      miningTime,
      energyUsed,
      hashRate: this.nonce / miningTime,
      timestamp: endTime
    };

    console.log(`Block mined: ${this.hash}`);
    console.log(`Mining time: ${miningTime}s, Energy used: ${energyUsed.toFixed(4)} kWh`);
  }

  /**
   * Estimate energy consumption for mining
   * Based on typical GPU power consumption (250W average)
   */
  estimateEnergyConsumption(timeInSeconds = 1) {
    return estimateEnergyConsumption(timeInSeconds);
  }

  /**
   * Validate if block has valid transactions
   */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get block summary for display
   */
  getSummary() {
    return {
      hash: this.hash,
      previousHash: this.previousHash,
      timestamp: new Date(this.timestamp).toISOString(),
      transactionCount: this.transactions.length,
      energyConsumed: `${this.energyData.totalEnergyConsumed} kWh`,
      aiComputeUnits: this.energyData.aiComputeUnits,
      carbonFootprint: `${this.energyData.carbonFootprint} kg CO2`,
      energySource: this.energyData.energySource,
      efficiencyScore: this.energyData.efficiencyScore,
      energyBonus: this.energyBonus.toFixed(2),
      nonce: this.nonce
    };
  }
}

export default Block;
