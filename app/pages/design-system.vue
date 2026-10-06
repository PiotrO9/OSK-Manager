<script setup lang="ts">
import {
    DESIGN_SYSTEM_SECTIONS,
    isDesignSystemSectionId,
    type DesignSystemSectionId,
} from '~/data/design-system/sections';

definePageMeta({ layout: 'design-system' });

usePageMeta({
    title: () => 'Design system',
    description: () =>
        'Komponenty i wzorce interfejsu dopasowane do codziennej pracy szkoły jazdy.',
});

const route = useRoute();
const router = useRouter();
const activeSection = shallowRef<DesignSystemSectionId>('foundations');
let scrollFrame = 0;

function resolveRequestedSection(): DesignSystemSectionId | null {
    const hash = route.hash.slice(1);

    if (isDesignSystemSectionId(hash)) return hash;

    const section = Array.isArray(route.query.section)
        ? route.query.section[0]
        : route.query.section;

    return isDesignSystemSectionId(section) ? section : null;
}

function scrollToSection(id: DesignSystemSectionId) {
    const element = document.getElementById(id);

    if (!element) return;

    activeSection.value = id;
    element.scrollIntoView({ behavior: 'auto', block: 'start' });
}

async function selectSection(id: DesignSystemSectionId) {
    const query = { ...route.query };

    delete query.section;
    await router.replace({ path: route.path, query, hash: `#${id}` });
    scrollToSection(id);
}

function updateActiveSection() {
    scrollFrame = 0;
    let current: DesignSystemSectionId = 'foundations';

    for (const section of DESIGN_SYSTEM_SECTIONS) {
        const element = document.getElementById(section.id);

        if (element && element.getBoundingClientRect().top <= 140)
            current = section.id;
    }

    activeSection.value = current;
}

function handleScroll() {
    if (!scrollFrame)
        scrollFrame = window.requestAnimationFrame(updateActiveSection);
}

watch(
    () => route.fullPath,
    async () => {
        await nextTick();
        const section = resolveRequestedSection();

        if (section) scrollToSection(section);
    },
);

onMounted(() => {
    const section = resolveRequestedSection();

    if (section) scrollToSection(section);

    window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    window.cancelAnimationFrame(scrollFrame);
});
</script>

<template>
    <div class="min-w-0 space-y-6">
        <div class="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <DesignSystemNavigation
                :sections="DESIGN_SYSTEM_SECTIONS"
                :active-section="activeSection"
                @select="selectSection"
            />
            <div class="min-w-0 space-y-6">
                <section
                    id="foundations"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="foundations-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="foundations-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Fundamenty
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Kolory, typografia, odstępy i gęstość.
                        </p>
                    </header>
                    <Colors />
                    <Typography />
                    <SectionSpacing />
                </section>

                <section
                    id="actions"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="actions-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="actions-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Akcje
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Przyciski, grupy akcji i ich stany.
                        </p>
                    </header>
                    <SectionActions />
                </section>

                <section
                    id="forms"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="forms-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="forms-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Formularze
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Pola, wybory, walidacja oraz data i czas.
                        </p>
                    </header>
                    <SectionFormControls />
                </section>

                <section
                    id="data"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="data-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="data-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Dane
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Tabele, listy, filtry i paginacja.
                        </p>
                    </header>
                    <SectionData />
                </section>

                <section
                    id="schedule"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="schedule-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="schedule-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Harmonogram
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Lekcje, dostępność i konflikty terminów.
                        </p>
                    </header>
                    <SectionSchedule />
                </section>

                <section
                    id="feedback"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="feedback-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="feedback-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Komunikaty
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Ładowanie, pusty stan, błąd, powiadomienie i dialog.
                        </p>
                    </header>
                    <SectionFoundationStates />
                    <div class="grid min-w-0 gap-4 xl:grid-cols-2">
                        <SectionToasts /><SectionDialog />
                    </div>
                </section>

                <section
                    id="patterns"
                    class="scroll-mt-36 space-y-6 lg:scroll-mt-24"
                    aria-labelledby="patterns-title"
                >
                    <header class="border-border border-b pb-4">
                        <h2
                            id="patterns-title"
                            class="text-foreground text-xl font-semibold"
                        >
                            Wzorce ekranów
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Gotowe kompozycje dla codziennej pracy OSK.
                        </p>
                    </header>
                    <SectionScreenPatterns />
                </section>
            </div>
        </div>
    </div>
</template>
