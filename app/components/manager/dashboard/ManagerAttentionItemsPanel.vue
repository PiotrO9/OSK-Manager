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
    hiddenCount: number;
    isLoading: boolean;
    error: string | null;
}

interface Emits {
    retry: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasItems = computed(() => props.items.length > 0);

const priorityLabels: Record<ManagerAttentionItemPriority, string> = {
    urgent: 'Pilne',
    todo: 'Do zrobienia',
    info: 'Info',
};

const priorityClasses: Record<ManagerAttentionItemPriority, string> = {
    urgent: 'border-red-200 bg-red-50 text-red-700',
    todo: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
};

function formatDueDate(date: string | null): string | null {
    if (!date) return null;

    try {
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(`${date}T00:00:00`));
    } catch {
        return date;
    }
}

function priorityClass(priority: ManagerAttentionItemPriority): string {
    return priorityClasses[priority];
}

function priorityLabel(priority: ManagerAttentionItemPriority): string {
    return priorityLabels[priority];
}
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
        aria-labelledby="manager-attention-heading"
    >
        <div
            class="border-border flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5"
        >
            <div class="flex min-w-0 items-start gap-3">
                <div
                    class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl"
                >
                    <AlertTriangle class="size-5" aria-hidden="true" />
                </div>

                <div class="min-w-0 space-y-1">
                    <h2
                        id="manager-attention-heading"
                        class="text-foreground text-xl leading-tight font-semibold tracking-tight"
                    >
                        Wymaga uwagi
                    </h2>
                    <p
                        class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
                    >
                        Najważniejsze sprawy operacyjne dla aktywnej OSK.
                    </p>
                </div>
            </div>

            <button
                type="button"
                class="border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-transparent"
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

        <div class="p-4 md:p-5">
            <div
                v-if="isLoading && !hasItems"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie spraw wymagających uwagi…
            </div>

            <div
                v-else-if="error"
                class="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border p-4 text-sm"
                role="alert"
            >
                {{ error }}
            </div>

            <div
                v-else-if="!hasItems"
                class="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                role="status"
            >
                <CheckCircle2
                    class="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                />
                <div class="space-y-1">
                    <p class="text-sm font-semibold">
                        Brak spraw wymagających reakcji
                    </p>
                    <p class="text-sm leading-relaxed text-emerald-700">
                        Na ten moment dashboard nie wykrył pilnych alertów dla
                        tej OSK.
                    </p>
                </div>
            </div>

            <div v-else class="space-y-3">
                <NuxtLink
                    v-for="item in items"
                    :key="item.id"
                    :to="item.actionTo"
                    class="border-border hover:border-primary/40 hover:bg-primary-50/30 focus-visible:ring-primary group flex flex-col gap-3 rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:flex-row md:items-start md:justify-between"
                >
                    <div class="min-w-0 space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span
                                class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                                :class="priorityClass(item.priority)"
                            >
                                {{ priorityLabel(item.priority) }}
                            </span>
                            <span
                                v-if="formatDueDate(item.dueDate)"
                                class="text-muted-foreground inline-flex items-center gap-1 text-xs"
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
                                class="text-muted-foreground text-sm leading-relaxed"
                            >
                                {{ item.description }}
                            </p>
                        </div>
                    </div>

                    <ChevronRight
                        class="text-muted-foreground group-hover:text-primary mt-0.5 size-4 shrink-0 transition md:mt-1"
                        aria-hidden="true"
                    />
                </NuxtLink>

                <p
                    v-if="hiddenCount > 0"
                    class="text-muted-foreground px-1 text-sm"
                >
                    +{{ hiddenCount }} kolejnych spraw wymaga uwagi.
                </p>
            </div>
        </div>
    </section>
</template>
