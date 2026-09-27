import { describe, expect, it } from 'vitest';
import { managerLessonNoHoursMessage } from './managerLessonAvailabilityMessage';

describe('lesson edit empty availability message', () => {
    it('explains an OSK closed day', () => {
        expect(managerLessonNoHoursMessage('SCHOOL_CLOSED')).toContain('OSK');
    });

    it('suggests changing vehicle when that is the limiting resource', () => {
        expect(managerLessonNoHoursMessage('VEHICLE_UNAVAILABLE')).toContain(
            'pojazd',
        );
    });

    it('does not invent a specific cause for an unknown empty result', () => {
        expect(managerLessonNoHoursMessage(undefined)).toContain(
            'Nie ma wolnych godzin',
        );
    });
});
