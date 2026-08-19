import { describe, expect, it } from 'vitest';
import {
    buildAuthProfilePatchPayload,
    createAuthSessionFromBackendUser,
} from './authSessionMapper';

describe('auth session mapper', () => {
    it('creates a session from backend user data with normalized optional fields', () => {
        const session = createAuthSessionFromBackendUser({
            id: 'user-1',
            email: 'manager@example.com',
            role: 'MANAGER',
            firstName: ' Anna ',
            lastName: ' Nowak ',
            avatarUrl: '  ',
            phone: ' 123 ',
            bio: '',
            profileUpdatedAt: ' 2026-08-16T10:00:00.000Z ',
            pkkNumber: null,
            drivingSchools: [
                {
                    id: ' school-1 ',
                    name: ' OSK Test ',
                    city: ' Warszawa ',
                    address: '',
                },
                {
                    id: '',
                    name: 'Pomijane',
                },
            ],
            defaultOskId: ' school-1 ',
        });

        expect(session).toMatchObject({
            userId: 'user-1',
            userName: 'Anna Nowak',
            email: 'manager@example.com',
            role: 'MANAGER',
            avatarUrl: null,
            firstName: 'Anna',
            lastName: 'Nowak',
            phone: '123',
            bio: null,
            profileUpdatedAt: '2026-08-16T10:00:00.000Z',
            pkkNumber: null,
            defaultOskId: 'school-1',
            drivingSchools: [
                {
                    id: 'school-1',
                    name: 'OSK Test',
                    city: 'Warszawa',
                    address: null,
                },
            ],
        });
    });

    it('builds a normalized profile patch payload from provided fields only', () => {
        expect(
            buildAuthProfilePatchPayload({
                firstName: ' Piotr ',
                phone: '',
                bio: null,
            }),
        ).toEqual({
            firstName: 'Piotr',
            phone: null,
            bio: null,
        });
    });
});
