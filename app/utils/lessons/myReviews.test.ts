import { describe, expect, it } from 'vitest';

import { formatLessonRatingCount, formatLessonRatingValue } from './myReviews';

describe('my reviews presentation', () => {
    it('formats ratings and Polish review counts', () => {
        expect(formatLessonRatingValue(4)).toBe('4,0');
        expect(formatLessonRatingValue(4.25)).toBe('4,3');
        expect(formatLessonRatingValue(null)).toBe('—');
        expect(formatLessonRatingCount(1)).toBe('1 opinia');
        expect(formatLessonRatingCount(3)).toBe('3 opinie');
        expect(formatLessonRatingCount(12)).toBe('12 opinii');
    });
});
