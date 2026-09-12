<script setup lang="ts">
import {
    courseFilterFields,
    courseFilterConditions,
    courseFilterNeedsValue,
    courseKindOptions,
    newCourseFilter,
    validCourseFilter,
    type CourseFilter,
    type CourseFilterField,
    type CourseFilterOption,
} from '~/utils/courses/courseFilters';

const props = defineProps<{
    draft: CourseFilter;
    categories: CourseFilterOption[];
    instructors: CourseFilterOption[];
    disabled?: boolean;
    error?: string | null;
}>();
const emit = defineEmits<{
    updateDraft: [value: CourseFilter];
    apply: [];
    cancel: [];
}>();
const options = computed(() =>
    props.draft.field === 'category'
        ? props.categories
        : props.draft.field === 'type'
          ? courseKindOptions
          : props.instructors,
);
const isSelect = computed(() =>
    ['category', 'type', 'instructor'].includes(props.draft.field),
);

function changeField(value: unknown) {
    if (courseFilterFields.some((field) => field.value === value))
        emit(
            'updateDraft',
            newCourseFilter(value as CourseFilterField, props.draft.id),
        );
}

function patch(value: Partial<CourseFilter>) {
    emit('updateDraft', { ...props.draft, ...value });
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="emit('apply')">
        <div class="grid gap-2">
            <UiLabel for="course-filter-field">Pole</UiLabel>
            <UiSelect
                :model-value="draft.field"
                :disabled="disabled"
                @update:model-value="changeField"
            >
                <UiSelectTrigger id="course-filter-field" class="h-11 w-full"
                    ><UiSelectValue
                /></UiSelectTrigger>
                <UiSelectContent
                    ><UiSelectItem
                        v-for="field in courseFilterFields"
                        :key="field.value"
                        :value="field.value"
                        >{{ field.label }}</UiSelectItem
                    ></UiSelectContent
                >
            </UiSelect>
        </div>
        <div class="grid gap-2">
            <UiLabel for="course-filter-condition">Warunek</UiLabel>
            <UiSelect
                :model-value="draft.condition"
                :disabled="disabled"
                @update:model-value="
                    patch({
                        condition: $event as CourseFilter['condition'],
                        value: '',
                    })
                "
            >
                <UiSelectTrigger
                    id="course-filter-condition"
                    class="h-11 w-full"
                    ><UiSelectValue
                /></UiSelectTrigger>
                <UiSelectContent
                    ><UiSelectItem
                        v-for="condition in courseFilterConditions(draft.field)"
                        :key="condition.value"
                        :value="condition.value"
                        >{{ condition.label }}</UiSelectItem
                    ></UiSelectContent
                >
            </UiSelect>
        </div>
        <div v-if="courseFilterNeedsValue(draft)" class="grid gap-2">
            <UiLabel for="course-filter-value">{{
                draft.field === 'totalHours' ? 'Liczba godzin' : 'Wartość'
            }}</UiLabel>
            <UiSelect
                v-if="isSelect"
                :model-value="draft.value"
                :disabled="disabled || !options.length"
                @update:model-value="patch({ value: String($event) })"
            >
                <UiSelectTrigger id="course-filter-value" class="h-11 w-full"
                    ><UiSelectValue placeholder="Wybierz wartość"
                /></UiSelectTrigger>
                <UiSelectContent
                    ><UiSelectItem
                        v-for="option in options"
                        :key="option.value"
                        :value="option.value"
                        >{{ option.label }}</UiSelectItem
                    ></UiSelectContent
                >
            </UiSelect>
            <UiInput
                v-else
                id="course-filter-value"
                :model-value="draft.value"
                :type="draft.field === 'totalHours' ? 'number' : 'text'"
                min="0"
                step="any"
                maxlength="120"
                class="h-11"
                :disabled="disabled"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? 'course-filter-error' : undefined"
                @update:model-value="patch({ value: String($event) })"
            />
        </div>
        <p
            v-if="error"
            id="course-filter-error"
            role="alert"
            class="text-destructive text-sm"
        >
            {{ error }}
        </p>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <UiButton
                type="button"
                variant="outline"
                class="h-11"
                :disabled="disabled"
                @click="emit('cancel')"
                >Anuluj</UiButton
            >
            <UiButton
                type="submit"
                class="h-11"
                :disabled="disabled || !validCourseFilter(draft)"
                >Zastosuj filtr</UiButton
            >
        </div>
    </form>
</template>
