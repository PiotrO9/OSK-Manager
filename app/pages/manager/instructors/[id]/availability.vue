<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const router = useRouter();

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

usePageMeta({
    title: () => 'Dostępność instruktora',
    description: () =>
        'Konfiguracja tygodniowego harmonogramu pracy instruktora.',
});

const scheduleHref = computed(() => {
    const id = instructorId.value;

    return id ? `/manager/instructors/${id}/schedule` : '/manager/instructors';
});

const backHref = computed(() => {
    const id = instructorId.value;

    return id ? `/manager/instructors/${id}` : '/manager/instructors';
});

watch(
    () => route.query.schoolId,
    (schoolId) => {
        if (schoolId === undefined) {
            return;
        }

        void router.replace({ path: route.path, query: {} });
    },
    { immediate: true },
);
</script>

<template>
    <div>
        <ManagerInstructorAvailabilityContent
            v-if="instructorId"
            :instructor-id="instructorId"
            :back-to="backHref"
            :schedule-to="scheduleHref"
        />

        <p v-else class="text-destructive text-sm" role="alert">
            Nieprawidłowy identyfikator instruktora.
        </p>
    </div>
</template>
