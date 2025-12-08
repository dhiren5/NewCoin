import crypto from 'crypto';
import EC from 'elliptic';

const ec = new EC.ec('secp256k1');

/**
 * Transaction class for EnergyAI blockchain
 * Supports energy token transfers and AI compute resource allocation
 */
class Transaction {
    constructor(fromAddress, toAddress, amount, transactionType = 'transfer', metadata = {}) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.transactionType = transactionType; // transfer, energy_trade, compute_allocation, carbon_credit
        this.metadata = metadata;
        this.signature = null;

        // Energy-specific transaction data
        if (transactionType === 'energy_trade') {
            this.energyAmount = metadata.energyAmount || 0; // kWh
            this.pricePerKWh = metadata.pricePerKWh || 0;
            this.energySource = metadata.energySource || 'mixed';
        }

        if (transactionType === 'compute_allocation') {
            this.computeUnits = metadata.computeUnits || 0; // GPU hours
            this.aiWorkloadType = metadata.aiWorkloadType || 'general';
            this.estimatedEnergy = metadata.estimatedEnergy || 0;
        }

        if (transactionType === 'carbon_credit') {
            this.carbonAmount = metadata.carbonAmount || 0; // kg CO2
            this.creditType = metadata.creditType || 'offset';
        }
    }

    /**
     * Calculate hash of the transaction
     */
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.fromAddress +
                this.toAddress +
                this.amount +
                this.timestamp +
                this.transactionType +
                JSON.stringify(this.metadata)
            )
            .digest('hex');
    }

    /**
     * Sign transaction with private key
     */
    signTransaction(signingKey) {
        // Check if the public key matches the fromAddress
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    /**
     * Verify if transaction is valid
     */
    isValid() {
        // Mining rewards don't have fromAddress
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    /**
     * Get transaction summary
     */
    getSummary() {
        const summary = {
            from: this.fromAddress ? this.fromAddress.substring(0, 10) + '...' : 'System',
            to: this.toAddress.substring(0, 10) + '...',
            amount: this.amount,
            type: this.transactionType,
            timestamp: new Date(this.timestamp).toISOString()
        };

        if (this.transactionType === 'energy_trade') {
            summary.energyAmount = `${this.energyAmount} kWh`;
            summary.pricePerKWh = this.pricePerKWh;
            summary.energySource = this.energySource;
        }

        if (this.transactionType === 'compute_allocation') {
            summary.computeUnits = `${this.computeUnits} GPU hours`;
            summary.aiWorkloadType = this.aiWorkloadType;
            summary.estimatedEnergy = `${this.estimatedEnergy} kWh`;
        }

        if (this.transactionType === 'carbon_credit') {
            summary.carbonAmount = `${this.carbonAmount} kg CO2`;
            summary.creditType = this.creditType;
        }

        return summary;
    }
}

export default Transaction;
