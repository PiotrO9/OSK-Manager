<script setup lang="ts">
import type { CourseTypeOption } from '~/types/courses/courseType';

defineProps<{
    options: readonly CourseTypeOption[];
    disabled: boolean;
    loading?: boolean;
    error?: string | null;
    invalid?: boolean;
}>();
defineEmits<{ retry: [] }>();
const selectedIds = defineModel<string[]>({ required: true });

function toggleCategory(id: string, checked: boolean | 'indeterminate') {
    selectedIds.value =
        checked === true
            ? [...new Set([...selectedIds.value, id])]
            : selectedIds.value.filter((value) => value !== id);
}
</script>

<template>
    <fieldset
        class="space-y-3"
        :disabled="disabled || loading"
        :aria-describedby="
            invalid ? 'vehicle-categories-error' : 'vehicle-categories-help'
        "
    >
        <legend class="text-sm font-medium">Kategorie szkolenia</legend>
        <p id="vehicle-categories-help" class="text-muted-foreground text-sm">
            Wybierz kategorie kursów, do których można używać tego pojazdu.
        </p>
        <p v-if="loading" role="status" class="text-muted-foreground text-sm">
            Wczytywanie kategorii…
        </p>
        <div v-else-if="error" class="space-y-2">
            <p role="alert" class="text-destructive text-sm">{{ error }}</p>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                @click="$emit('retry')"
                >Spróbuj ponownie</UiButton
            >
        </div>
        <div v-else class="flex flex-wrap gap-3">
            <label
                v-for="category in options"
                :key="category.id"
                :for="`vehicle-category-${category.id}`"
                class="border-border flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                :title="category.name"
            >
                <UiCheckbox
                    :id="`vehicle-category-${category.id}`"
                    :model-value="selectedIds.includes(category.id)"
                    :disabled="disabled"
                    :aria-invalid="invalid"
                    @update:model-value="toggleCategory(category.id, $event)"
                />
                {{ category.code }}
            </label>
            <p
                v-if="options.length === 0"
                class="text-muted-foreground text-sm"
            >
                Katalog kategorii jest pusty.
            </p>
        </div>
        <p
            v-if="invalid"
            id="vehicle-categories-error"
            role="alert"
            class="text-destructive text-sm"
        >
            Wybierz co najmniej jedną kategorię.
        </p>
    </fieldset>
</template>
