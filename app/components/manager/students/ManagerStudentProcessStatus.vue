<script setup lang="ts">
import { CheckCircle2, Circle } from 'lucide-vue-next';
import type { StudentProcessStatusStep } from '~/types/students/student';

interface Props {
    steps: readonly StudentProcessStatusStep[];
    isLoading: boolean;
    error: string | null;
}

const props = defineProps<Props>();

const completedCount = computed(
    () => props.steps.filter((step) => step.completed).length,
);

const totalCount = computed(() => props.steps.length);

const hasSteps = computed(() => totalCount.value > 0);

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
        class="border-border bg-card rounded-xl border p-6 shadow-sm"
        aria-labelledby="student-process-status-heading"
    >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div class="min-w-0">
                <h2
                    id="student-process-status-heading"
                    class="text-foreground text-lg font-semibold"
                >
                    Status procesu kursanta
                </h2>
            </div>
            <UiBadge v-if="hasSteps" variant="outline" class="shrink-0">
                {{ completedCount }} / {{ totalCount }}
            </UiBadge>
        </div>

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

        <ul v-else class="grid gap-3 sm:grid-cols-2" role="list">
            <li
                v-for="step in steps"
                :key="step.name"
                class="border-border bg-background flex min-w-0 gap-3 rounded-lg border px-4 py-3"
            >
                <CheckCircle2
                    v-if="step.completed"
                    class="mt-0.5 size-5 shrink-0 text-emerald-600"
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
                        <UiBadge
                            :variant="step.completed ? 'default' : 'secondary'"
                        >
                            {{ getStepBadgeLabel(step) }}
                        </UiBadge>
                    </div>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ getStepDescription(step) }}
                    </p>
                </div>
            </li>
        </ul>
    </section>
</template>
