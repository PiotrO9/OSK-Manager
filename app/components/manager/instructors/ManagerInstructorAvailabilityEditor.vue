<script setup lang="ts">
import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import { getInstructorAvailabilityDraftTimelineBar } from '~/utils/instructors/managerInstructorAvailabilityEditor';

const props = defineProps<{
    rows: readonly WeeklyDayFormRow[];
    loadError: string | null;
    formError: string | null;
    isLoading: boolean;
    isSaving: boolean;
    getRowError: (dayOfWeek: number) => string | null;
}>();

defineEmits<{
    retry: [];
    updateEnabled: [dayOfWeek: number, enabled: boolean];
    updateStartTime: [dayOfWeek: number, value: string];
    updateEndTime: [dayOfWeek: number, value: string];
}>();

const rowsWithDraftBars = computed(() =>
    props.rows.map((row) => ({
        row,
        draftBar: getInstructorAvailabilityDraftTimelineBar(row),
    })),
);
</script>

<template>
    <div class="space-y-3">
        <p
            v-if="props.isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie dostępności...
        </p>

        <ErrorState
            v-else-if="props.loadError"
            title="Nie udało się wczytać dostępności"
            :description="props.loadError"
            @retry="$emit('retry')"
        />

        <template v-else>
            <div
                class="space-y-2"
                role="list"
                aria-label="Tygodniowa dostępność instruktora"
            >
                <ManagerInstructorAvailabilityDayRow
                    v-for="item in rowsWithDraftBars"
                    :key="item.row.dayOfWeek"
                    :row="item.row"
                    :draft-bar="item.draftBar"
                    :is-disabled="props.isSaving"
                    :error="props.getRowError(item.row.dayOfWeek)"
                    @update-enabled="
                        $emit('updateEnabled', item.row.dayOfWeek, $event)
                    "
                    @update-start-time="
                        $emit('updateStartTime', item.row.dayOfWeek, $event)
                    "
                    @update-end-time="
                        $emit('updateEndTime', item.row.dayOfWeek, $event)
                    "
                />
            </div>

            <p
                v-if="props.formError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ props.formError }}
            </p>
        </template>
    </div>
</template>
