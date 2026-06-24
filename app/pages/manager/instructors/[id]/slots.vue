<script setup lang="ts">
import { ArrowLeft, Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();

function readSchoolIdFromQuery(): string {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

function getInstructorId(): string {
    const raw = route.params.id;

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

const instructorId = computed(getInstructorId);

const backToDetailHref = computed(() => {
    const id = instructorId.value;
    const sid = readSchoolIdFromQuery();

    if (!id) {
        return '/manager/instructors';
    }

    if (sid) {
        return {
            path: `/manager/instructors/${id}`,
            query: { schoolId: sid },
        };
    }

    return `/manager/instructors/${id}`;
});

const scheduleHref = computed(() => {
    const id = instructorId.value;
    const sid = readSchoolIdFromQuery();

    if (!id) {
        return '/manager/instructors';
    }

    if (sid) {
        return {
            path: `/manager/instructors/${id}/schedule`,
            query: { schoolId: sid },
        };
    }

    return `/manager/instructors/${id}/schedule`;
});

usePageMeta({
    title: () => 'Sloty instruktora',
    description: () =>
        'Tygodniowy widok dostępnych slotów czasowych instruktora.',
});
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Wolne sloty instruktora"
            description="Kalendarz dostępnych okien do rezerwacji jazd."
            eyebrow="Sloty instruktora"
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="backToDetailHref"
                        aria-label="Wróć do szczegółów instruktora"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Szczegóły
                    </NuxtLink>
                </UiButton>

                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="scheduleHref"
                        aria-label="Przejdz do dodawania jazdy lub bloku czasu"
                    >
                        <Plus class="mr-2 size-4" aria-hidden="true" />
                        Dodaj jazde
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <ManagerInstructorWeeklyCalendar
            v-if="instructorId"
            :instructor-id="instructorId"
        />

        <p v-else class="text-destructive text-sm" role="alert">
            Nieprawidlowy identyfikator instruktora.
        </p>
    </div>
</template>
