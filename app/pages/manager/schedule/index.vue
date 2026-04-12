<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { session } = useAuthSession();

function readSchoolIdFromQuery(): string {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

const schoolId = computed((): string => {
    const q = readSchoolIdFromQuery();

    if (q) {
        return q;
    }

    const def = session.value?.defaultOskId;

    return typeof def === 'string' ? def.trim() : '';
});

const schoolIdError = ref<string | null>(null);

watch(
    () => schoolId.value,
    (sid) => {
        schoolIdError.value = null;

        if (!sid) {
            schoolIdError.value =
                'Brak identyfikatora szkoły. Dodaj ?schoolId= do adresu lub ustaw domyślną OSK.';
        }
    },
    { immediate: true },
);

usePageMeta({
    title: () => 'Harmonogram lekcji',
    description: () =>
        'Tygodniowy widok zarezerwowanych lekcji wszystkich instruktorów szkoły.',
});
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Harmonogram lekcji (szkoła)
            </h1>
            <p class="text-muted-foreground text-sm">
                Zarezerwowane lekcje wszystkich instruktorów w wybranej OSK.
                Kliknij blok czasu instruktora (bez kursanta) albo jazdę
                praktyczną z kursantem, aby otworzyć edycję. Wolne sloty
                znajdziesz w kalendarzu dostępności na dashboardzie.
            </p>
        </div>

        <p v-if="schoolIdError" class="text-destructive text-sm" role="alert">
            {{ schoolIdError }}
        </p>

        <ManagerSchoolScheduleCalendar
            v-if="schoolId"
            :school-id="schoolId"
            event-edit-enabled
        />
    </div>
</template>
