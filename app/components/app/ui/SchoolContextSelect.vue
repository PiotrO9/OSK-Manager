<script setup lang="ts">
import { Building2 } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const props = withDefaults(
    defineProps<{
        schools: readonly DrivingSchool[];
        modelValue: string | null;
        id: string;
        label?: string;
        disabled?: boolean;
        loading?: boolean;
    }>(),
    {
        label: 'Aktualny ośrodek',
        disabled: false,
        loading: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [schoolId: string];
}>();

const selectedSchool = computed(() =>
    props.schools.find((school) => school.id === props.modelValue),
);

function handleSchoolChange(value: unknown): void {
    if (typeof value === 'string' && value) {
        emit('update:modelValue', value);
    }
}
</script>

<template>
    <UiSelect
        :model-value="modelValue || undefined"
        :disabled="disabled || loading || schools.length === 0"
        @update:model-value="handleSchoolChange"
    >
        <UiSelectTrigger
            :id="id"
            class="!h-14 w-full min-w-0"
            :aria-label="`${label}: ${selectedSchool?.name ?? 'Wybierz ośrodek'}`"
        >
            <span
                class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-lg"
                aria-hidden="true"
            >
                <Building2 class="size-5" />
            </span>
            <span class="flex min-w-0 flex-1 flex-col text-left">
                <span class="text-muted-foreground text-xs">{{ label }}</span>
                <UiSelectValue placeholder="Wybierz ośrodek" />
            </span>
        </UiSelectTrigger>
        <UiSelectContent>
            <UiSelectGroup>
                <UiSelectItem
                    v-for="school in schools"
                    :key="school.id"
                    :value="school.id"
                >
                    {{ school.name
                    }}{{ school.city ? ` (${school.city})` : '' }}
                </UiSelectItem>
            </UiSelectGroup>
        </UiSelectContent>
    </UiSelect>
</template>
