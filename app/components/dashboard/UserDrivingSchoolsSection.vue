<script setup lang="ts">
import { Building2, MapPin } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const props = defineProps<{
    schools: readonly DrivingSchool[];
}>();

const heading = computed(() =>
    props.schools.length <= 1 ? 'Twoja szkoła jazdy' : 'Twoje szkoły jazdy',
);
</script>

<template>
    <div class="space-y-4">
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
            {{ heading }}
        </h2>

        <p
            v-if="schools.length === 0"
            class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
            role="status"
        >
            Nie masz jeszcze przypisanej szkoły jazdy. Gdy administrator doda
            Cię do szkoły, zobaczysz ją tutaj.
        </p>

        <div v-else class="space-y-4">
            <div
                v-for="school in schools"
                :key="school.id"
                class="border-border bg-card rounded-2xl border p-5 shadow-sm"
                :aria-label="`Szkoła jazdy: ${school.name}`"
            >
                <div class="flex items-start gap-4">
                    <div
                        class="bg-primary-50 text-primary-600 flex size-11 shrink-0 items-center justify-center rounded-xl"
                    >
                        <Building2 class="size-5" aria-hidden="true" />
                    </div>

                    <div class="min-w-0 flex-1 space-y-1">
                        <p
                            class="text-foreground truncate text-lg font-semibold"
                        >
                            {{ school.name }}
                        </p>

                        <p
                            v-if="school.city || school.address"
                            class="text-muted-foreground flex items-center gap-1.5 text-sm"
                        >
                            <MapPin
                                class="size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span class="min-w-0 truncate">
                                <span v-if="school.city">{{
                                    school.city
                                }}</span>
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
            </div>
        </div>
    </div>
</template>
