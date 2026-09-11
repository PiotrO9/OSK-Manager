import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowRef } from 'vue';

const routerPush = vi.fn();

function installNuxtStudentDetailsTabsGlobals(): void {
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('useRouter', () => ({
        push: routerPush,
    }));
}

describe('useManagerStudentDetailsTabs', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('uses overview for missing, invalid or array tab query values', async () => {
        const { normalizeManagerStudentDetailsTab } =
            await import('./useManagerStudentDetailsTabs');

        expect(normalizeManagerStudentDetailsTab(undefined)).toBe('overview');
        expect(normalizeManagerStudentDetailsTab('unknown')).toBe('overview');
        expect(normalizeManagerStudentDetailsTab(['payments'])).toBe(
            'overview',
        );
        expect(normalizeManagerStudentDetailsTab('payments')).toBe('payments');
    });

    it('switches tabs in local state without touching the router', async () => {
        installNuxtStudentDetailsTabsGlobals();
        const { useManagerStudentDetailsTabs } =
            await import('./useManagerStudentDetailsTabs');
        const tabs = useManagerStudentDetailsTabs();

        expect(tabs.activeTab.value).toBe('overview');

        tabs.setActiveTab('payments');

        expect(tabs.activeTab.value).toBe('payments');
        expect(routerPush).not.toHaveBeenCalled();
    });

    it('does not change state or history for the active tab', async () => {
        installNuxtStudentDetailsTabsGlobals();
        const { useManagerStudentDetailsTabs } =
            await import('./useManagerStudentDetailsTabs');
        const tabs = useManagerStudentDetailsTabs();

        tabs.setActiveTab('overview');

        expect(tabs.activeTab.value).toBe('overview');
        expect(routerPush).not.toHaveBeenCalled();
    });
});
