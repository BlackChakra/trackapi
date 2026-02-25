import { describe, it, expect } from 'vitest';
import {
    validateTrackingNumber,
    validateCourierCode,
    validateTrackRequest,
} from '../validation';

// ─── validateTrackingNumber ─────────────────────────────────────────

describe('validateTrackingNumber', () => {
    it('accepts valid tracking numbers', () => {
        expect(validateTrackingNumber('1Z999AA10123456784')).toBe('1Z999AA10123456784');
        expect(validateTrackingNumber('ABC123')).toBe('ABC123');
        expect(validateTrackingNumber('123-456-789')).toBe('123-456-789');
    });

    it('trims whitespace', () => {
        expect(validateTrackingNumber('  ABC123  ')).toBe('ABC123');
    });

    it('rejects non-string input', () => {
        expect(validateTrackingNumber(123)).toBeNull();
        expect(validateTrackingNumber(null)).toBeNull();
        expect(validateTrackingNumber(undefined)).toBeNull();
        expect(validateTrackingNumber({})).toBeNull();
    });

    it('rejects input that is too short', () => {
        expect(validateTrackingNumber('AB')).toBeNull();
        expect(validateTrackingNumber('A')).toBeNull();
        expect(validateTrackingNumber('')).toBeNull();
    });

    it('rejects input that is too long', () => {
        const longString = 'A'.repeat(61);
        expect(validateTrackingNumber(longString)).toBeNull();
    });

    it('rejects input with special characters', () => {
        expect(validateTrackingNumber('ABC!@#')).toBeNull();
        expect(validateTrackingNumber('<script>')).toBeNull();
        expect(validateTrackingNumber('ABC;DROP TABLE')).toBeNull();
    });

    it('accepts hyphens and spaces', () => {
        expect(validateTrackingNumber('ABC 123 DEF')).toBe('ABC 123 DEF');
        expect(validateTrackingNumber('ABC-123-DEF')).toBe('ABC-123-DEF');
    });
});

// ─── validateCourierCode ────────────────────────────────────────────

describe('validateCourierCode', () => {
    it('accepts valid courier codes', () => {
        expect(validateCourierCode('fedex')).toBe('fedex');
        expect(validateCourierCode('ups')).toBe('ups');
        expect(validateCourierCode('dhl-express')).toBe('dhl-express');
    });

    it('lowercases input', () => {
        expect(validateCourierCode('FedEx')).toBe('fedex');
        expect(validateCourierCode('UPS')).toBe('ups');
    });

    it('trims whitespace', () => {
        expect(validateCourierCode('  fedex  ')).toBe('fedex');
    });

    it('rejects non-string input', () => {
        expect(validateCourierCode(123)).toBeNull();
        expect(validateCourierCode(null)).toBeNull();
        expect(validateCourierCode(undefined)).toBeNull();
    });

    it('rejects empty strings', () => {
        expect(validateCourierCode('')).toBeNull();
        expect(validateCourierCode('   ')).toBeNull();
    });

    it('rejects codes longer than 40 characters', () => {
        const longCode = 'a'.repeat(41);
        expect(validateCourierCode(longCode)).toBeNull();
    });

    it('rejects codes with invalid characters', () => {
        expect(validateCourierCode('fe dex')).toBeNull();
        expect(validateCourierCode('fed_ex')).toBeNull();
        expect(validateCourierCode('fed.ex')).toBeNull();
    });
});

// ─── validateTrackRequest ───────────────────────────────────────────

describe('validateTrackRequest', () => {
    it('validates a correct request with tracking number only', () => {
        const result = validateTrackRequest({ tracking_number: 'ABC123' });
        expect(result).toEqual({
            success: true,
            data: { tracking_number: 'ABC123' },
        });
    });

    it('validates a correct request with tracking number and courier', () => {
        const result = validateTrackRequest({
            tracking_number: 'ABC123',
            courier: 'fedex',
        });
        expect(result).toEqual({
            success: true,
            data: { tracking_number: 'ABC123', courier: 'fedex' },
        });
    });

    it('ignores empty courier string', () => {
        const result = validateTrackRequest({
            tracking_number: 'ABC123',
            courier: '',
        });
        expect(result).toEqual({
            success: true,
            data: { tracking_number: 'ABC123' },
        });
    });

    it('rejects null body', () => {
        const result = validateTrackRequest(null);
        expect(result).toEqual({
            success: false,
            error: 'Request body must be a JSON object',
        });
    });

    it('rejects non-object body', () => {
        const result = validateTrackRequest('string');
        expect(result).toEqual({
            success: false,
            error: 'Request body must be a JSON object',
        });
    });

    it('rejects missing tracking number', () => {
        const result = validateTrackRequest({});
        expect(result.success).toBe(false);
    });

    it('rejects invalid tracking number', () => {
        const result = validateTrackRequest({ tracking_number: 'A!' });
        expect(result.success).toBe(false);
    });

    it('rejects invalid courier code', () => {
        const result = validateTrackRequest({
            tracking_number: 'ABC123',
            courier: 'bad courier!',
        });
        expect(result.success).toBe(false);
    });
});
