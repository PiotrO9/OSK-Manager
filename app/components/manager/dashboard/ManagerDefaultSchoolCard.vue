<script setup lang="ts">
import { Building2, ExternalLink, MapPin } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

defineProps<{
    school: DrivingSchool;
}>();
</script>

<template>
    <div
        class="border-border bg-card overflow-hidden rounded-2xl border p-4 shadow-sm md:p-5"
        :aria-label="`Karta domyślnego OSK: ${school.name}`"
    >
        <div
            class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
            <div class="flex min-w-0 items-start gap-4">
                <div
                    class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl md:size-11"
                >
                    <Building2 class="size-5" aria-hidden="true" />
                </div>

                <div class="min-w-0 flex-1 space-y-1">
                    <p
                        class="text-foreground truncate text-lg font-semibold tracking-tight"
                    >
                        {{ school.name }}
                    </p>

                    <p
                        v-if="school.city || school.address"
                        class="text-muted-foreground flex items-center gap-1.5 text-sm"
                    >
                        <MapPin class="size-3.5 shrink-0" aria-hidden="true" />
                        <span class="min-w-0 truncate">
                            <span v-if="school.city">{{ school.city }}</span>
                            <span v-if="school.city && school.address">
                                ·
                            </span>
                            <span v-if="school.address">{{
                                school.address
                            }}</span>
                        </span>
                    </p>
                </div>
            </div>

            <NuxtLink
                to="/manager/osk"
                class="border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-transparent"
                aria-label="Przejdź do listy szkół jazdy"
            >
                <ExternalLink class="size-4" aria-hidden="true" />
            </NuxtLink>
        </div>
    </div>
</template>
