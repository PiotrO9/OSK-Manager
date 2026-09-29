<script setup lang="ts">
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    RefreshCw,
} from 'lucide-vue-next';
import type {
    ManagerAttentionItem,
    ManagerAttentionItemPriority,
} from '~/types/manager/attentionItem';

interface Props {
    items: readonly ManagerAttentionItem[];
    total: number;
    isLoading: boolean;
    error: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
const showAll = shallowRef(false);
const initialLimit = 4;
const hasItems = computed(() => props.items.length > 0);
const visibleItems = computed(() =>
    showAll.value ? props.items : props.items.slice(0, initialLimit),
);
const remainingLoadedCount = computed(() =>
    Math.max(0, props.items.length - visibleItems.value.length),
);

const priorityLabels: Record<ManagerAttentionItemPriority, string> = {
    urgent: 'Pilne',
    todo: 'Do zrobienia',
    info: 'Informacja',
};

const priorityClasses: Record<ManagerAttentionItemPriority, string> = {
    urgent: 'border-red-200 bg-red-50 text-red-700',
    todo: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
};

function formatDueDate(date: string | null): string | null {
    if (!date) return null;

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
        aria-labelledby="manager-attention-heading"
    >
        <div
            class="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between md:p-5"
        >
            <div class="flex min-w-0 items-start gap-3">
                <div
                    class="bg-primary-50 text-primary-700 flex size-11 shrink-0 items-center justify-center rounded-xl"
                >
                    <AlertTriangle class="size-5" aria-hidden="true" />
                </div>
                <div class="min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2
                            id="manager-attention-heading"
                            class="text-foreground text-xl leading-tight font-semibold tracking-tight"
                        >
                            Wymaga uwagi
                        </h2>
                        <UiBadge v-if="total > 0" variant="secondary">
                            {{ total }}
                        </UiBadge>
                    </div>
                    <p
                        class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
                    >
                        Najważniejsze sprawy do obsługi w domyślnej szkole.
                    </p>
                </div>
            </div>

            <button
                type="button"
                class="border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-transparent"
                :disabled="isLoading"
                aria-label="Odśwież sprawy wymagające uwagi"
                @click="emit('retry')"
            >
                <RefreshCw
                    class="size-4"
                    :class="{ 'animate-spin': isLoading }"
                    aria-hidden="true"
                />
            </button>
        </div>

        <div class="space-y-4 p-4 md:p-5">
            <div
                v-if="error"
                class="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
            >
                <p class="text-destructive text-sm">{{ error }}</p>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="min-h-11 shrink-0"
                    :disabled="isLoading"
                    @click="emit('retry')"
                >
                    Spróbuj ponownie
                </UiButton>
            </div>

            <div
                v-if="isLoading && !hasItems"
                class="space-y-2"
                role="status"
                aria-label="Wczytywanie spraw wymagających uwagi"
            >
                <UiSkeleton class="h-24 w-full rounded-xl" />
                <UiSkeleton class="h-24 w-full rounded-xl" />
            </div>

            <div
                v-else-if="!hasItems && !error"
                class="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                role="status"
            >
                <CheckCircle2
                    class="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                />
                <div class="space-y-1">
                    <p class="text-sm font-semibold">
                        Wszystko jest pod kontrolą
                    </p>
                    <p class="text-sm leading-relaxed text-emerald-700">
                        Nie znaleziono spraw wymagających reakcji w tej szkole.
                    </p>
                </div>
            </div>

            <div v-else-if="hasItems" class="space-y-2">
                <NuxtLink
                    v-for="item in visibleItems"
                    :key="item.id"
                    :to="item.actionTo"
                    class="border-border hover:border-primary/40 hover:bg-primary-50/30 focus-visible:ring-primary group flex min-h-20 items-start justify-between gap-3 rounded-xl border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                    <div class="min-w-0 space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span
                                class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                                :class="priorityClasses[item.priority]"
                            >
                                {{ priorityLabels[item.priority] }}
                            </span>
                            <span
                                v-if="formatDueDate(item.dueDate)"
                                class="text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums"
                            >
                                <CalendarClock
                                    class="size-3.5"
                                    aria-hidden="true"
                                />
                                {{ formatDueDate(item.dueDate) }}
                            </span>
                        </div>
                        <div class="space-y-1">
                            <p
                                class="text-foreground text-sm leading-snug font-semibold"
                            >
                                {{ item.title }}
                            </p>
                            <p
                                class="text-muted-foreground line-clamp-2 text-sm leading-relaxed"
                            >
                                {{ item.description }}
                            </p>
                        </div>
                    </div>
                    <ChevronRight
                        class="text-muted-foreground group-hover:text-primary mt-1 size-4 shrink-0 transition-colors"
                        aria-hidden="true"
                    />
                </NuxtLink>

                <div v-if="remainingLoadedCount > 0 || showAll" class="pt-1">
                    <button
                        v-if="remainingLoadedCount > 0"
                        type="button"
                        class="text-primary hover:text-primary-700 focus-visible:ring-primary min-h-11 w-fit cursor-pointer rounded-lg px-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
                        @click="showAll = true"
                    >
                        Pokaż kolejne {{ remainingLoadedCount }}
                    </button>
                    <button
                        v-else-if="showAll && items.length > initialLimit"
                        type="button"
                        class="text-primary hover:text-primary-700 focus-visible:ring-primary min-h-11 w-fit cursor-pointer rounded-lg px-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
                        @click="showAll = false"
                    >
                        Pokaż mniej
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
