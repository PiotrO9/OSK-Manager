import { describe, expect, it } from 'vitest';
import {
    managerLessonCancelErrorMessage,
    managerLessonEditErrorMessage,
} from './managerLessonEditErrorMessage';

describe('manager lesson edit error messages', () => {
    it('translates known cancellation errors from the backend', () => {
        expect(
            managerLessonCancelErrorMessage({
                data: {
                    message: 'Cannot cancel a lesson that has already started',
                },
                statusCode: 400,
            }),
        ).toBe('Nie można anulować jazdy, która już się rozpoczęła.');
    });

    it('never exposes an unknown English API message on the edit page', () => {
        expect(
            managerLessonCancelErrorMessage({
                data: {
                    message:
                        'At least one of startTime, endTime, instructorId, vehicleId is required',
                },
                statusCode: 400,
            }),
        ).toBe('Nie udało się anulować rezerwacji. Spróbuj ponownie.');
        expect(
            managerLessonEditErrorMessage(
                { data: { message: 'Forbidden' }, statusCode: 403 },
                'Nie udało się wczytać lekcji.',
            ),
        ).toBe('Nie masz uprawnień do wykonania tej operacji.');
        expect(
            managerLessonEditErrorMessage(
                new Error('Unexpected upstream error'),
                'Nie udało się zapisać lekcji.',
            ),
        ).toBe('Nie udało się zapisać lekcji.');
    });
});
