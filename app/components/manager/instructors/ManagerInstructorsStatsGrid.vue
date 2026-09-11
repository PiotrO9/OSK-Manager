<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';

defineProps<{
    instructorsCount: number;
    activeSchool: DrivingSchool | null;
    instructorsWithQualificationsCount: number;
    uniqueQualificationCodesCount: number;
    isUnavailable?: boolean;
}>();
</script>

<template>
    <div
        class="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-5"
        aria-label="Podsumowanie listy instruktorów"
    >
        <dl class="flex items-baseline gap-2 text-sm">
            <dt class="text-muted-foreground">Wyniki</dt>
            <dd class="text-foreground font-bold tabular-nums">
                {{ isUnavailable ? '—' : instructorsCount }}
            </dd>
        </dl>

        <div
            class="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
        >
            <span>Wybrana OSK:</span>
            <dl class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div class="flex min-w-0 items-center gap-1.5">
                    <dt class="sr-only">Szkoła jazdy</dt>
                    <dd class="text-foreground max-w-56 truncate font-semibold">
                        {{
                            isUnavailable
                                ? '—'
                                : activeSchool?.name || 'Brak wyboru'
                        }}
                    </dd>
                </div>
                <div class="flex items-center gap-1.5">
                    <span
                        class="bg-success-600 size-1.5 rounded-full"
                        aria-hidden="true"
                    />
                    <dt>z kwalifikacjami</dt>
                    <dd class="text-foreground font-semibold tabular-nums">
                        {{
                            isUnavailable
                                ? '—'
                                : instructorsWithQualificationsCount
                        }}
                    </dd>
                </div>
                <div class="flex items-center gap-1.5">
                    <dt>kategorie</dt>
                    <dd class="text-foreground font-semibold tabular-nums">
                        {{
                            isUnavailable ? '—' : uniqueQualificationCodesCount
                        }}
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</template>
