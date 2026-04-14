<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { session } = useAuthSession();
const { addToast } = useAppToast();
const { deleteInstructorEvent, isDeleteLoading: isEventDeleteLoading } =
    useInstructorEventsApi();

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

const calendarRef = ref<{
    reloadWeek: () => Promise<void>;
} | null>(null);

const deleteDialogOpen = ref(false);
const pendingDeleteItem = ref<ScheduleLessonItem | null>(null);

const pendingDeleteTimeLabel = computed(() => {
    const item = pendingDeleteItem.value;

    if (!item) {
        return '';
    }

    return `${formatScheduleRangeLabel(item.startTime)} — ${formatScheduleRangeLabel(item.endTime)}`;
});

function formatScheduleRangeLabel(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

function handleRequestDelete(item: ScheduleLessonItem): void {
    pendingDeleteItem.value = item;
    deleteDialogOpen.value = true;
}

function handleDeleteDialogCancel(): void {
    deleteDialogOpen.value = false;
    pendingDeleteItem.value = null;
}

async function handleDeleteDialogConfirm(): Promise<void> {
    const item = pendingDeleteItem.value;

    if (!item) {
        return;
    }

    const removedId = item.id;

    try {
        await deleteInstructorEvent(removedId);

        addToast({
            title: 'Usunięto blok czasu',
            description: 'Blok został usunięty z harmonogramu.',
            variant: 'success',
        });

        await calendarRef.value?.reloadWeek();
        handleDeleteDialogCancel();
    } catch (err: unknown) {
        addToast({
            title: 'Nie udało się usunąć bloku',
            description: getApiFetchErrorMessage(
                err,
                'Spróbuj ponownie lub odśwież stronę.',
            ),
            variant: 'error',
        });
    }
}
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
                praktyczną z kursantem, aby otworzyć edycję. Na bloku czasu
                możesz też użyć ikony kosza, aby usunąć go bez wchodzenia w
                szczegóły. Wolne sloty znajdziesz w kalendarzu dostępności na
                dashboardzie.
            </p>
        </div>

        <p v-if="schoolIdError" class="text-destructive text-sm" role="alert">
            {{ schoolIdError }}
        </p>

        <ManagerSchoolScheduleCalendar
            v-if="schoolId"
            ref="calendarRef"
            :school-id="schoolId"
            event-edit-enabled
            event-delete-enabled
            @request-delete="handleRequestDelete"
        />

        <ManagerInstructorEventDeleteDialog
            v-model:open="deleteDialogOpen"
            :time-range-label="pendingDeleteTimeLabel"
            :is-deleting="isEventDeleteLoading"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />
    </div>
</template>
