import { describe, expect, it } from 'vitest';
import { formatVehicleUpdatedAt } from './updatedAt';

describe('formatVehicleUpdatedAt', () => {
    it('uses the Warsaw time zone for winter and summer dates', () => {
        expect(formatVehicleUpdatedAt('2026-01-08T12:32:00.000Z')).toBe(
            'Dane pojazdu zaktualizowano: 08.01.2026, 13:32',
        );
        expect(formatVehicleUpdatedAt('2026-10-08T12:32:00.000Z')).toBe(
            'Dane pojazdu zaktualizowano: 08.10.2026, 14:32',
        );
    });

    it('does not invent a date for old or malformed data', () => {
        expect(formatVehicleUpdatedAt(null)).toBe(
            'Brak informacji o ostatniej aktualizacji danych pojazdu',
        );
        expect(formatVehicleUpdatedAt('2026-10-08')).toBe(
            'Brak informacji o ostatniej aktualizacji danych pojazdu',
        );
    });
});
