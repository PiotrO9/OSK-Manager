<script setup lang="ts">
import { UsersRound } from 'lucide-vue-next';
import type { ManagerCourseCapacityInsight } from '~/types/courses/managerCourseDetail';

const props = defineProps<{
    insight: ManagerCourseCapacityInsight | null;
    isLoading: boolean;
    error: string | null;
}>();

defineEmits<{
    retry: [];
}>();

const fillBarStyle = computed(() => ({
    width: `${props.insight?.fillPercentage ?? 0}%`,
}));

const usageSummaryLabel = computed(() => {
    const insight = props.insight;

    if (!insight?.hasCapacity) {
        return '';
    }

    return `${insight.participantCount ?? '—'} zajętych z ${insight.capacity ?? '—'} miejsc`;
});
</script>

<template>
    <section
        class="capacity-panel border-border bg-card h-fit rounded-lg border shadow-xs"
        aria-labelledby="course-capacity-heading"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="min-w-0 space-y-1">
                <h2
                    id="course-capacity-heading"
                    class="text-foreground text-base font-semibold"
                >
                    Zapełnienie kursu
                </h2>
                <p class="text-muted-foreground text-sm">
                    Liczba kursantów przypisanych do tego kursu.
                </p>
            </div>
        </div>

        <div class="p-5">
            <div v-if="isLoading" class="capacity-panel__content" role="status">
                <div class="space-y-4">
                    <div class="bg-muted h-4 w-32 animate-pulse rounded" />
                    <div class="bg-muted h-10 w-56 animate-pulse rounded" />
                    <div class="bg-muted h-4 w-full animate-pulse rounded" />
                    <div class="bg-muted h-3 w-full animate-pulse rounded" />
                    <div class="flex justify-between gap-4">
                        <div class="bg-muted h-4 w-24 animate-pulse rounded" />
                        <div class="bg-muted h-4 w-20 animate-pulse rounded" />
                    </div>
                </div>
            </div>

            <ErrorState
                v-else-if="error"
                title="Nie udało się policzyć zapełnienia"
                :description="error"
                @retry="$emit('retry')"
            />

            <div v-else-if="insight" class="capacity-panel__content">
                <div class="min-w-0 space-y-5">
                    <div class="space-y-2">
                        <p
                            class="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
                        >
                            Dostępność miejsc
                        </p>
                        <p
                            class="text-foreground text-3xl font-bold tracking-normal sm:text-4xl"
                        >
                            {{ insight.helperLabel }}
                        </p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            {{
                                insight.hasCapacity
                                    ? 'Wskaźnik używa limitu miejsc z konfiguracji kursu.'
                                    : 'Ten typ kursu nie ma limitu miejsc w aktualnym kontrakcie.'
                            }}
                        </p>
                    </div>

                    <div v-if="insight.hasCapacity" class="space-y-4">
                        <div
                            class="space-y-2"
                            role="progressbar"
                            :aria-valuenow="insight.fillPercentage ?? 0"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            :aria-label="`Zapełnienie kursu: ${usageSummaryLabel}`"
                        >
                            <div
                                class="flex items-center justify-between gap-3 text-xs"
                            >
                                <span class="text-muted-foreground">
                                    Zajętość kursu
                                </span>
                                <span
                                    class="text-foreground font-semibold tabular-nums"
                                >
                                    {{ insight.fillPercentage }}%
                                </span>
                            </div>
                            <div
                                class="bg-muted h-3 overflow-hidden rounded-full"
                            >
                                <div
                                    class="bg-primary h-full rounded-full transition-[width] duration-300"
                                    :class="{
                                        'bg-warning-500':
                                            insight.isOverCapacity,
                                    }"
                                    :style="fillBarStyle"
                                />
                            </div>
                            <div
                                class="text-muted-foreground flex items-center justify-between gap-4 text-xs"
                            >
                                <span class="tabular-nums">
                                    {{ insight.participantCount }} zajętych
                                </span>
                                <span class="tabular-nums">
                                    limit {{ insight.capacity }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else
                        class="border-border bg-muted/20 flex items-center gap-3 rounded-lg border p-4"
                    >
                        <div
                            class="bg-card border-border flex size-11 shrink-0 items-center justify-center rounded-full border shadow-xs"
                        >
                            <UsersRound
                                class="text-primary size-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div class="min-w-0">
                            <p
                                class="text-foreground text-2xl font-bold tabular-nums"
                            >
                                {{ insight.valueLabel }}
                            </p>
                            <p class="text-muted-foreground text-sm">
                                uczestników bez limitu miejsc
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.capacity-panel {
    container-type: inline-size;
}

.capacity-panel__content {
    max-width: 46rem;
}
</style>
