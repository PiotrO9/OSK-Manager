<script setup lang="ts">
import { CheckCircle2, ChevronDown, Circle } from 'lucide-vue-next';
import type { StudentProcessStatusStep } from '~/types/students/student';

interface Props {
    steps: readonly StudentProcessStatusStep[];
    isLoading: boolean;
    error: string | null;
    title?: string;
    description?: string;
    initiallyExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Status procesu kursanta',
    description: 'PKK, teoria, praktyka i płatności w jednym przebiegu.',
    initiallyExpanded: true,
});

const isExpanded = ref(props.initiallyExpanded);

const completedCount = computed(
    () => props.steps.filter((step) => step.completed).length,
);

const totalCount = computed(() => props.steps.length);

const hasSteps = computed(() => totalCount.value > 0);
const componentId = useId();
const contentId = `student-process-status-content-${componentId}`;
const headingId = `student-process-status-heading-${componentId}`;

function getStepBadgeLabel(step: StudentProcessStatusStep): string {
    return step.completed ? 'Wykonane' : 'Do zrobienia';
}

function getStepDescription(step: StudentProcessStatusStep): string {
    const t = step.description.trim();

    return t.length > 0 ? t : 'Brak opisu kroku.';
}
</script>

<template>
    <section
        class="border-border bg-card rounded-lg border shadow-xs"
        :aria-labelledby="headingId"
    >
        <div
            class="border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4"
        >
            <div class="min-w-0">
                <h2
                    :id="headingId"
                    class="text-foreground text-base font-semibold"
                >
                    {{ props.title }}
                </h2>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ props.description }}
                </p>
            </div>
            <button
                v-if="hasSteps"
                type="button"
                class="border-border bg-background text-foreground hover:bg-muted/40 focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                :aria-expanded="isExpanded"
                :aria-controls="contentId"
                @click="isExpanded = !isExpanded"
            >
                <slot name="summary-icon" />
                <span>{{ completedCount }} / {{ totalCount }}</span>
                <ChevronDown
                    class="size-4 transition-transform"
                    :class="{ 'rotate-180': isExpanded }"
                    aria-hidden="true"
                />
            </button>
        </div>

        <div :id="contentId" class="p-5" :hidden="hasSteps && !isExpanded">
            <p
                v-if="isLoading"
                class="text-muted-foreground text-sm"
                role="status"
                aria-live="polite"
            >
                Wczytywanie statusu procesu…
            </p>
            <p
                v-else-if="error"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ error }}
            </p>
            <p v-else-if="!hasSteps" class="text-muted-foreground text-sm">
                Brak kroków procesu do wyświetlenia.
            </p>

            <ul v-else class="grid gap-3 lg:grid-cols-2" role="list">
                <li
                    v-for="step in steps"
                    :key="step.name"
                    class="border-border bg-background flex min-w-0 gap-3 rounded-lg border px-4 py-3"
                >
                    <CheckCircle2
                        v-if="step.completed"
                        class="text-success-700 dark:text-success-300 mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <Circle
                        v-else
                        class="text-muted-foreground mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="text-foreground text-sm font-medium">
                                {{ step.name }}
                            </p>
                            <StatusBadge
                                :label="getStepBadgeLabel(step)"
                                :tone="step.completed ? 'success' : 'neutral'"
                                subtle
                            />
                        </div>
                        <p class="text-muted-foreground mt-1 text-sm">
                            {{ getStepDescription(step) }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
