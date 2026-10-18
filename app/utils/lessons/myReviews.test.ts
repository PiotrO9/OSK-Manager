import { describe, expect, it } from 'vitest';

import { formatLessonRatingCount, formatLessonRatingValue } from './myReviews';

describe('my reviews presentation', () => {
    it('formats whole ratings and fractional averages without trailing zeros', () => {
        expect(formatLessonRatingValue(5)).toBe('5');
        expect(formatLessonRatingValue(4.5)).toBe('4,5');
        expect(formatLessonRatingValue(4.25)).toBe('4,25');
        expect(formatLessonRatingValue(4.2)).toBe('4,2');
        expect(formatLessonRatingValue(null)).toBe('—');
        expect(formatLessonRatingValue(Number.NaN)).toBe('—');
        expect(formatLessonRatingValue(Number.POSITIVE_INFINITY)).toBe('—');
    });

    it('formats Polish review counts', () => {
        expect(formatLessonRatingCount(1)).toBe('1 opinia');
        expect(formatLessonRatingCount(3)).toBe('3 opinie');
        expect(formatLessonRatingCount(12)).toBe('12 opinii');
    });
});
