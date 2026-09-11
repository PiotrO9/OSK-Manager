export const managerStudentDetailsTabs = [
    'overview',
    'lessons',
    'payments',
    'courses',
] as const;

export type ManagerStudentDetailsTab =
    (typeof managerStudentDetailsTabs)[number];

const DEFAULT_TAB: ManagerStudentDetailsTab = 'overview';

export function normalizeManagerStudentDetailsTab(
    raw: unknown,
): ManagerStudentDetailsTab {
    if (typeof raw !== 'string') {
        return DEFAULT_TAB;
    }

    return managerStudentDetailsTabs.includes(raw as ManagerStudentDetailsTab)
        ? (raw as ManagerStudentDetailsTab)
        : DEFAULT_TAB;
}

export function useManagerStudentDetailsTabs() {
    const activeTab = shallowRef<ManagerStudentDetailsTab>(DEFAULT_TAB);

    function setActiveTab(tab: ManagerStudentDetailsTab): void {
        if (tab === activeTab.value) {
            return;
        }

        activeTab.value = tab;
    }

    return {
        activeTab,
        setActiveTab,
    };
}
