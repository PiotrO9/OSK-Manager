<script setup lang="ts">
import { BookOpen, Car } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    buildStudentScheduleDayGroups,
    displayStudentScheduleTimeRange,
    formatStudentScheduleTime,
    getStudentScheduleItemDescription,
    getStudentScheduleItemTitle,
    getStudentScheduleStatusLabel,
    getStudentScheduleStatusTone,
    isStudentScheduleCancellableLesson,
    isStudentScheduleTheoryItem,
} from '~/utils/schedule/studentScheduleGroupedList';

const props = withDefaults(
    defineProps<{
        items: readonly ScheduleLessonItem[];
        isLoading?: boolean;
        errorMessage?: string | null;
        emptyMessage?: string;
        studentLessonCancelEnabled?: boolean;
        cancellingLessonId?: string | null;
    }>(),
    {
        isLoading: false,
        errorMessage: null,
        emptyMessage: 'Brak zaplanowanych jazd i wykladow w tym tygodniu.',
        studentLessonCancelEnabled: false,
        cancellingLessonId: null,
    },
);

const emit = defineEmits<{
    'request-cancel-lesson': [item: ScheduleLessonItem];
}>();

const groups = computed(() => buildStudentScheduleDayGroups(props.items));

function isStudentCancellableLesson(item: ScheduleLessonItem): boolean {
    return isStudentScheduleCancellableLesson({
        item,
        studentLessonCancelEnabled: props.studentLessonCancelEnabled,
    });
}

function handleCancelClick(item: ScheduleLessonItem): void {
    emit('request-cancel-lesson', item);
}
</script>

<template>
    <div class="space-y-4">
        <LoadingState v-if="isLoading" title="Wczytywanie lekcji..." />

        <ErrorState v-else-if="errorMessage" :description="errorMessage" />

        <EmptyState
            v-else-if="groups.length === 0"
            title="Brak lekcji"
            :description="emptyMessage"
        />

        <template v-else>
            <section
                v-for="group in groups"
                :key="group.date"
                class="space-y-2"
                :aria-label="`Harmonogram na ${group.label}`"
            >
                <h3
                    class="text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase"
                >
                    {{ group.label }}
                </h3>

                <ul class="space-y-2">
                    <li
                        v-for="item in group.items"
                        :key="item.id"
                        class="border-border bg-background hover:bg-muted/30 flex flex-col gap-3 rounded-xl border px-3 py-3 transition sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="flex min-w-0 gap-3">
                            <span
                                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border"
                                :class="
                                    isStudentScheduleTheoryItem(item)
                                        ? 'border-violet-200 bg-violet-50 text-violet-700'
                                        : 'border-sky-200 bg-sky-50 text-sky-700'
                                "
                                aria-hidden="true"
                            >
                                <BookOpen
                                    v-if="isStudentScheduleTheoryItem(item)"
                                    class="size-4"
                                />
                                <Car v-else class="size-4" />
                            </span>

                            <div class="min-w-0">
                                <div
                                    class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
                                >
                                    <p
                                        class="text-foreground text-sm leading-5 font-bold"
                                    >
                                        {{
                                            formatStudentScheduleTime(
                                                item.startTime,
                                            )
                                        }}
                                        -
                                        {{ getStudentScheduleItemTitle(item) }}
                                    </p>
                                    <StatusBadge
                                        :label="
                                            getStudentScheduleStatusLabel(
                                                item.status,
                                            )
                                        "
                                        :tone="
                                            getStudentScheduleStatusTone(
                                                item.status,
                                            )
                                        "
                                        subtle
                                    />
                                </div>
                                <p
                                    class="text-muted-foreground mt-1 text-sm leading-5"
                                >
                                    {{
                                        getStudentScheduleItemDescription(item)
                                    }}
                                </p>
                                <p
                                    class="text-muted-foreground mt-1 text-xs tabular-nums"
                                >
                                    {{ displayStudentScheduleTimeRange(item) }}
                                </p>
                            </div>
                        </div>

                        <UiButton
                            v-if="isStudentCancellableLesson(item)"
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="shrink-0"
                            :disabled="cancellingLessonId === item.id"
                            :aria-busy="cancellingLessonId === item.id"
                            :aria-label="`Anuluj rezerwację ${displayStudentScheduleTimeRange(item)}`"
                            @click="handleCancelClick(item)"
                        >
                            {{
                                cancellingLessonId === item.id
                                    ? 'Anulowanie...'
                                    : 'Anuluj'
                            }}
                        </UiButton>
                    </li>
                </ul>
            </section>
        </template>
    </div>
</template>
