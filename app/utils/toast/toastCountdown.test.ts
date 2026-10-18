import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToastCountdown } from './toastCountdown';

describe('createToastCountdown', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('expires after the configured duration', () => {
        const onExpired = vi.fn();
        const countdown = createToastCountdown(3500, onExpired);

        countdown.resume();
        vi.advanceTimersByTime(3499);
        expect(onExpired).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onExpired).toHaveBeenCalledOnce();
    });

    it('preserves the remaining time across repeated pauses', () => {
        const onExpired = vi.fn();
        const countdown = createToastCountdown(5000, onExpired);

        countdown.resume();
        vi.advanceTimersByTime(1200);
        countdown.pause();
        vi.advanceTimersByTime(10000);
        expect(onExpired).not.toHaveBeenCalled();

        countdown.resume();
        vi.advanceTimersByTime(800);
        countdown.pause();
        countdown.resume();
        vi.advanceTimersByTime(2999);
        expect(onExpired).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onExpired).toHaveBeenCalledOnce();
    });

    it('keeps concurrent countdowns independent', () => {
        const firstExpired = vi.fn();
        const secondExpired = vi.fn();
        const first = createToastCountdown(1800, firstExpired);
        const second = createToastCountdown(6000, secondExpired);

        first.resume();
        second.resume();
        first.pause();
        vi.advanceTimersByTime(6000);
        expect(firstExpired).not.toHaveBeenCalled();
        expect(secondExpired).toHaveBeenCalledOnce();
        first.resume();
        vi.advanceTimersByTime(1800);
        expect(firstExpired).toHaveBeenCalledOnce();
    });

    it('does not schedule a permanent toast and cancels a stopped one', () => {
        const permanentExpired = vi.fn();

        createToastCountdown(0, permanentExpired).resume();

        const onExpired = vi.fn();
        const countdown = createToastCountdown(3500, onExpired);

        countdown.resume();
        countdown.stop();
        countdown.resume();
        vi.runAllTimers();

        expect(permanentExpired).not.toHaveBeenCalled();
        expect(onExpired).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
