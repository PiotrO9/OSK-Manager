<script setup lang="ts">
withDefaults(
    defineProps<{
        totalStudentsCount: number;
        pageStudentsCount: number;
        activeStudentsOnPage: number;
        studentsWithPkkOnPage: number;
        isUnavailable?: boolean;
    }>(),
    { isUnavailable: false },
);
</script>

<template>
    <div
        class="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-5"
        aria-label="Podsumowanie listy kursantów"
    >
        <dl class="flex items-baseline gap-2 text-sm">
            <dt class="text-muted-foreground">Wyniki</dt>
            <dd class="text-foreground font-bold tabular-nums">
                {{ isUnavailable ? '—' : totalStudentsCount }}
            </dd>
        </dl>
        <div
            class="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
        >
            <span>Na tej stronie:</span>
            <dl class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div class="flex items-center gap-1.5">
                    <dt>kursanci</dt>
                    <dd class="text-foreground font-semibold tabular-nums">
                        {{ isUnavailable ? '—' : pageStudentsCount }}
                    </dd>
                </div>
                <div class="flex items-center gap-1.5">
                    <span
                        class="bg-success-600 size-1.5 rounded-full"
                        aria-hidden="true"
                    />
                    <dt>aktywni</dt>
                    <dd class="text-foreground font-semibold tabular-nums">
                        {{ isUnavailable ? '—' : activeStudentsOnPage }}
                    </dd>
                </div>
                <div class="flex items-center gap-1.5">
                    <dt>z PKK</dt>
                    <dd class="text-foreground font-semibold tabular-nums">
                        {{ isUnavailable ? '—' : studentsWithPkkOnPage }}
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</template>
