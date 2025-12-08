import EC from 'elliptic';
import crypto from 'crypto';
import Transaction from '../core/Transaction.js';

const ec = new EC.ec('secp256k1');

/**
 * Wallet class for EnergyAI blockchain
 * Manages keys and creates transactions
 */
class Wallet {
    constructor(privateKey = null) {
        if (privateKey) {
            this.keyPair = ec.keyFromPrivate(privateKey, 'hex');
        } else {
            this.keyPair = ec.genKeyPair();
        }

        this.publicKey = this.keyPair.getPublic('hex');
        this.privateKey = this.keyPair.getPrivate('hex');

        // Wallet metadata
        this.createdAt = Date.now();
        this.walletType = 'standard'; // standard, energy_provider, compute_provider, validator
    }

    /**
     * Get wallet address (public key)
     */
    getAddress() {
        return this.publicKey;
    }

    /**
     * Get private key (keep secret!)
     */
    getPrivateKey() {
        return this.privateKey;
    }

    /**
     * Create and sign a transaction
     */
    createTransaction(toAddress, amount, blockchain, transactionType = 'transfer', metadata = {}) {
        const transaction = new Transaction(
            this.publicKey,
            toAddress,
            amount,
            transactionType,
            metadata
        );

        transaction.signTransaction(this.keyPair);
        return transaction;
    }

    /**
     * Get wallet balance
     */
    getBalance(blockchain) {
        return blockchain.getBalanceOfAddress(this.publicKey);
    }

    /**
     * Get transaction history
     */
    getTransactionHistory(blockchain) {
        return blockchain.getAllTransactionsForAddress(this.publicKey);
    }

    /**
     * Export wallet to JSON
     */
    export() {
        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
            createdAt: this.createdAt,
            walletType: this.walletType
        };
    }

    /**
     * Import wallet from JSON
     */
    static import(walletData) {
        const wallet = new Wallet(walletData.privateKey);
        wallet.createdAt = walletData.createdAt;
        wallet.walletType = walletData.walletType || 'standard';
        return wallet;
    }

    /**
     * Generate wallet ID (shortened address)
     */
    getWalletId() {
        return crypto
            .createHash('sha256')
            .update(this.publicKey)
            .digest('hex')
            .substring(0, 16);
    }

    /**
     * Get wallet summary
     */
    getSummary(blockchain = null) {
        const summary = {
            walletId: this.getWalletId(),
            address: this.publicKey.substring(0, 20) + '...',
            walletType: this.walletType,
            createdAt: new Date(this.createdAt).toISOString()
        };

        if (blockchain) {
            summary.balance = this.getBalance(blockchain);
            summary.transactionCount = this.getTransactionHistory(blockchain).length;
        }

        return summary;
    }
}

export default Wallet;
