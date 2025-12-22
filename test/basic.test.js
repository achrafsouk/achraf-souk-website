// Basic test to verify setup is working
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
    it('should have a working test environment', () => {
        expect(true).toBe(true);
    });

    it('should have access to DOM APIs', () => {
        const element = document.createElement('div');
        expect(element.tagName).toBe('DIV');
    });

    it('should have console mocking available', () => {
        console.log('test message');
        expect(console.log).toHaveBeenCalledWith('test message');
    });
});