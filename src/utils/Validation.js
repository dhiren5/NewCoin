import { VALIDATION_LIMITS } from '../core/Constants.js';

/**
 * Input validation utilities for blockchain operations
 */
export class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount, fieldName = 'amount') {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
    }

    if (amount < VALIDATION_LIMITS.MIN_TRANSACTION_AMOUNT) {
        throw new ValidationError(
            `${fieldName} must be at least ${VALIDATION_LIMITS.MIN_TRANSACTION_AMOUNT}`,
            fieldName
        );
    }

    if (amount > VALIDATION_LIMITS.MAX_TRANSACTION_AMOUNT) {
        throw new ValidationError(
            `${fieldName} cannot exceed ${VALIDATION_LIMITS.MAX_TRANSACTION_AMOUNT}`,
            fieldName
        );
    }

    return true;
}

/**
 * Validate energy amount
 */
export function validateEnergyAmount(energyAmount) {
    if (typeof energyAmount !== 'number' || isNaN(energyAmount)) {
        throw new ValidationError('Energy amount must be a valid number', 'energyAmount');
    }

    if (energyAmount < VALIDATION_LIMITS.MIN_ENERGY_AMOUNT) {
        throw new ValidationError(
            `Energy amount must be at least ${VALIDATION_LIMITS.MIN_ENERGY_AMOUNT} kWh`,
            'energyAmount'
        );
    }

    if (energyAmount > VALIDATION_LIMITS.MAX_ENERGY_AMOUNT) {
        throw new ValidationError(
            `Energy amount cannot exceed ${VALIDATION_LIMITS.MAX_ENERGY_AMOUNT} kWh`,
            'energyAmount'
        );
    }

    return true;
}

/**
 * Validate compute units
 */
export function validateComputeUnits(computeUnits) {
    if (typeof computeUnits !== 'number' || isNaN(computeUnits)) {
        throw new ValidationError('Compute units must be a valid number', 'computeUnits');
    }

    if (computeUnits < VALIDATION_LIMITS.MIN_COMPUTE_UNITS) {
        throw new ValidationError(
            `Compute units must be at least ${VALIDATION_LIMITS.MIN_COMPUTE_UNITS}`,
            'computeUnits'
        );
    }

    if (computeUnits > VALIDATION_LIMITS.MAX_COMPUTE_UNITS) {
        throw new ValidationError(
            `Compute units cannot exceed ${VALIDATION_LIMITS.MAX_COMPUTE_UNITS}`,
            'computeUnits'
        );
    }

    return true;
}

/**
 * Validate carbon amount
 */
export function validateCarbonAmount(carbonAmount) {
    if (typeof carbonAmount !== 'number' || isNaN(carbonAmount)) {
        throw new ValidationError('Carbon amount must be a valid number', 'carbonAmount');
    }

    if (carbonAmount < VALIDATION_LIMITS.MIN_CARBON_AMOUNT) {
        throw new ValidationError(
            `Carbon amount must be at least ${VALIDATION_LIMITS.MIN_CARBON_AMOUNT} kg`,
            'carbonAmount'
        );
    }

    if (carbonAmount > VALIDATION_LIMITS.MAX_CARBON_AMOUNT) {
        throw new ValidationError(
            `Carbon amount cannot exceed ${VALIDATION_LIMITS.MAX_CARBON_AMOUNT} kg`,
            'carbonAmount'
        );
    }

    return true;
}

/**
 * Validate blockchain address
 */
export function validateAddress(address, fieldName = 'address') {
    if (!address || typeof address !== 'string') {
        throw new ValidationError(`${fieldName} must be a valid string`, fieldName);
    }

    if (address.length < 10) {
        throw new ValidationError(`${fieldName} is too short`, fieldName);
    }

    return true;
}

/**
 * Validate energy source
 */
export function validateEnergySource(energySource) {
    const validSources = ['renewable', 'nuclear', 'fossil', 'mixed'];

    if (!validSources.includes(energySource)) {
        throw new ValidationError(
            `Energy source must be one of: ${validSources.join(', ')}`,
            'energySource'
        );
    }

    return true;
}

/**
 * Validate AI workload type
 */
export function validateAIWorkloadType(workloadType) {
    const validTypes = ['training', 'inference', 'general', 'genesis'];

    if (!validTypes.includes(workloadType)) {
        throw new ValidationError(
            `AI workload type must be one of: ${validTypes.join(', ')}`,
            'aiWorkloadType'
        );
    }

    return true;
}

/**
 * Validate efficiency score
 */
export function validateEfficiencyScore(score) {
    if (typeof score !== 'number' || isNaN(score)) {
        throw new ValidationError('Efficiency score must be a valid number', 'efficiencyScore');
    }

    if (score < 0 || score > 100) {
        throw new ValidationError('Efficiency score must be between 0 and 100', 'efficiencyScore');
    }

    return true;
}
