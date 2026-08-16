import { describe, expect, it } from 'vitest';
import { createDemoAuthSession } from './demoAuthSession';

describe('createDemoAuthSession', () => {
    it('creates a demo session without production auth data', () => {
        expect(createDemoAuthSession(' Demo User ')).toEqual({
            userId: 'demo',
            userName: 'Demo User',
            role: 'DEMO',
            drivingSchools: [],
            defaultOskId: null,
        });
    });

    it('rejects empty demo names', () => {
        expect(createDemoAuthSession('   ')).toBeNull();
    });
});
