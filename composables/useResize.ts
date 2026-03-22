import { ref, onMounted, onUnmounted, computed } from 'vue';

export type Breakpoints = {
    mobile?: number;
    desktop?: number;
};

export function useResize(
    initialBreakpoints?: Breakpoints,
    initialDebounceMs = 100,
) {
    const defaultBreakpoints = { mobile: 768, desktop: 1024 };

    const breakpoints = ref<Required<Breakpoints>>({
        mobile: initialBreakpoints?.mobile ?? defaultBreakpoints.mobile,
        desktop: initialBreakpoints?.desktop ?? defaultBreakpoints.desktop,
    });

    const width = ref<number>(
        typeof window === 'undefined' ? 0 : window.innerWidth,
    );
    const height = ref<number>(
        typeof window === 'undefined' ? 0 : window.innerHeight,
    );

    let resizeTimeout: number | null = null;
    let debounceMs = Math.max(0, Math.floor(initialDebounceMs));

    function updateSize() {
        if (typeof window === 'undefined') return;
        width.value = window.innerWidth;
        height.value = window.innerHeight;
    }

    function handleResize() {
        if (resizeTimeout !== null) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(() => {
            updateSize();
            resizeTimeout = null;
        }, debounceMs);
    }

    function setBreakpoints(newBreakpoints: Breakpoints) {
        if (newBreakpoints.mobile !== undefined) {
            breakpoints.value.mobile = newBreakpoints.mobile;
        }
        if (newBreakpoints.desktop !== undefined) {
            breakpoints.value.desktop = newBreakpoints.desktop;
        }
    }

    function setDebounce(ms: number) {
        debounceMs = Math.max(0, Math.floor(ms));
    }

    const isMobile = computed(() => width.value < breakpoints.value.mobile);
    const isDesktop = computed(() => width.value >= breakpoints.value.desktop);

    onMounted(() => {
        if (typeof window === 'undefined') return;
        updateSize();
        window.addEventListener('resize', handleResize, {
            passive: true,
        } as EventListenerOptions);
    });

    onUnmounted(() => {
        if (resizeTimeout !== null) {
            clearTimeout(resizeTimeout);
            resizeTimeout = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleResize as EventListener);
        }
    });

    return {
        width,
        height,
        isMobile,
        isDesktop,
        setBreakpoints,
        setDebounce,
    };
}
