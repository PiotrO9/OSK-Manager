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
const activeSection = shallowRef<DesignSystemSectionId>('foundations');
let sectionObserver: IntersectionObserver | null = null;

function resolveRequestedSection(): DesignSystemSectionId {
    const hash = route.hash.replace('#', '');

    if (isDesignSystemSectionId(hash)) {
        return hash;
    }

    const section = Array.isArray(route.query.section)
        ? route.query.section[0]
        : route.query.section;

    return isDesignSystemSectionId(section) ? section : 'foundations';
}

function scrollToSection(id: DesignSystemSectionId, behavior: ScrollBehavior) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    activeSection.value = id;
    element.scrollIntoView({ behavior, block: 'start' });
    window.history.replaceState(null, '', `${route.path}#${id}`);
}

function selectSection(id: DesignSystemSectionId) {
    scrollToSection(id, 'smooth');
}

onMounted(() => {
    scrollToSection(resolveRequestedSection(), 'auto');

    sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (current, next) =>
                        current.boundingClientRect.top -
                        next.boundingClientRect.top,
                )[0];

            if (isDesignSystemSectionId(visibleEntry?.target.id)) {
                activeSection.value = visibleEntry.target.id;
            }
        },
        { rootMargin: '-96px 0px -62% 0px', threshold: 0.01 },
    );

    for (const section of DESIGN_SYSTEM_SECTIONS) {
        const element = document.getElementById(section.id);

        if (element) {
            sectionObserver.observe(element);
        }
    }
});

onBeforeUnmount(() => sectionObserver?.disconnect());
</script>

<template>
    <div class="min-w-0 space-y-6">
        <div class="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <DesignSystemNavigation
                :sections="DESIGN_SYSTEM_SECTIONS"
                :active-section="activeSection"
                @select="selectSection"
            />
            <main class="min-w-0 space-y-6">
                <section
                    id="foundations"
                    class="scroll-mt-24 space-y-6"
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
                </section>

                <section
                    id="actions"
                    class="scroll-mt-24 space-y-6"
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
                    class="scroll-mt-24 space-y-6"
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
                    class="scroll-mt-24 space-y-6"
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
                    class="scroll-mt-24 space-y-6"
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
                    class="scroll-mt-24 space-y-6"
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
                    class="scroll-mt-24 space-y-6"
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
            </main>
        </div>
    </div>
</template>
