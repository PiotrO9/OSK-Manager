import { describe, expect, it } from 'vitest';
import {
    getManagerLessonStatusLabel,
    getManagerLessonStatusTone,
} from '~/utils/lessons/managerLessonEditPresentation';

describe('managerLessonEditPresentation', () => {
    it('maps known lesson statuses to labels and keeps unknown status raw', () => {
        expect(getManagerLessonStatusLabel(undefined)).toBe('-');
        expect(getManagerLessonStatusLabel('')).toBe('-');
        expect(getManagerLessonStatusLabel('SCHEDULED')).toBe('Zaplanowana');
        expect(getManagerLessonStatusLabel('COMPLETED')).toBe('Zakonczona');
        expect(getManagerLessonStatusLabel('CANCELLED')).toBe('Anulowana');
        expect(getManagerLessonStatusLabel('CANCELED')).toBe('Anulowana');
        expect(getManagerLessonStatusLabel('DONE')).toBe('DONE');
    });

    it('maps known lesson statuses to tones', () => {
        expect(getManagerLessonStatusTone('SCHEDULED')).toBe('info');
        expect(getManagerLessonStatusTone('COMPLETED')).toBe('success');
        expect(getManagerLessonStatusTone('CANCELLED')).toBe('danger');
        expect(getManagerLessonStatusTone('CANCELED')).toBe('danger');
        expect(getManagerLessonStatusTone('DONE')).toBe('neutral');
        expect(getManagerLessonStatusTone(undefined)).toBe('neutral');
    });
});
