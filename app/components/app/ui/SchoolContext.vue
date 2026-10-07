<script setup lang="ts">
import { Building2 } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

withDefaults(
    defineProps<{
        school: Pick<DrivingSchool, 'name' | 'city' | 'address'> | null;
        label?: string;
        showAddress?: boolean;
        loading?: boolean;
        emptyLabel?: string;
    }>(),
    {
        label: 'Aktualny ośrodek',
        showAddress: false,
        loading: false,
        emptyLabel: 'Brak wybranego ośrodka',
    },
);
</script>

<template>
    <div class="flex min-w-0 items-center gap-3">
        <span
            class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
        >
            <Building2 class="size-5" />
        </span>
        <div class="min-w-0">
            <p class="text-muted-foreground text-xs">{{ label }}</p>
            <p
                class="text-foreground truncate text-sm font-semibold"
                :title="school?.name || undefined"
            >
                {{
                    loading
                        ? 'Wczytywanie ośrodka…'
                        : school?.name || emptyLabel
                }}
                <span
                    v-if="school?.city && !loading"
                    class="text-muted-foreground font-normal"
                >
                    · {{ school.city }}
                </span>
            </p>
            <p
                v-if="showAddress && school?.address && !loading"
                class="text-muted-foreground truncate text-xs"
                :title="school.address"
            >
                {{ school.address }}
            </p>
        </div>
    </div>
</template>
