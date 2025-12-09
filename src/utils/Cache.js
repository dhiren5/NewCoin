/**
 * Simple LRU Cache implementation for blockchain data
 * Improves performance by caching frequently accessed data
 */
class Cache {
    constructor(maxSize = 100, ttl = 5000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl; // Time to live in milliseconds
    }

    /**
     * Get value from cache
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (LRU)
        this.cache.delete(key);
        this.cache.set(key, item);

        return item.value;
    }

    /**
     * Set value in cache
     */
    set(key, value) {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    /**
     * Check if key exists and is not expired
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Invalidate specific key
     */
    invalidate(key) {
        this.cache.delete(key);
    }

    /**
     * Invalidate keys matching pattern
     */
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }
}

export default Cache;
