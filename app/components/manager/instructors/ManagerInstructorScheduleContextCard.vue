<script setup lang="ts">
import { Route } from 'lucide-vue-next';

defineProps<{
    schoolId: string;
    scheduleItemsCount: number;
    lessonItemsCount: number;
    blockItemsCount: number;
    nextScheduledItemLabel: string;
}>();
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-xl border shadow-xs"
        aria-label="Kontekst terminarza instruktora"
    >
        <div
            class="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
        >
            <div class="flex min-w-0 gap-3">
                <div
                    class="bg-primary-50 text-primary-600 flex size-11 shrink-0 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <Route class="size-5" />
                </div>
                <div class="min-w-0">
                    <h2 class="text-foreground text-lg font-semibold">
                        Harmonogram operacyjny
                    </h2>
                    <p
                        class="text-muted-foreground mt-1 text-sm leading-relaxed"
                    >
                        Kliknij wiersz bloku lub jazdy praktycznej, aby otworzyć
                        edycję. Bloki bez kursanta zmieniają wolne sloty
                        instruktora.
                    </p>
                    <p
                        v-if="!schoolId"
                        class="text-warning-800 mt-2 text-xs font-medium"
                    >
                        Dodaj <code>?schoolId=</code> w adresie, aby wybrac
                        pojazd dla bloku jazdy.
                    </p>
                </div>
            </div>

            <div class="grid overflow-hidden rounded-xl border sm:grid-cols-4">
                <div class="border-border px-4 py-3 sm:border-r">
                    <p class="text-muted-foreground text-xs">Wpisy</p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ scheduleItemsCount }}
                    </p>
                </div>
                <div class="border-border px-4 py-3 sm:border-r">
                    <p class="text-muted-foreground text-xs">Lekcje</p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ lessonItemsCount }}
                    </p>
                </div>
                <div class="border-border px-4 py-3 sm:border-r">
                    <p class="text-muted-foreground text-xs">Bloki</p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ blockItemsCount }}
                    </p>
                </div>
                <div class="px-4 py-3">
                    <p class="text-muted-foreground text-xs">Najblizszy wpis</p>
                    <p
                        class="text-foreground mt-1 text-sm font-bold whitespace-nowrap"
                    >
                        {{ nextScheduledItemLabel }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
