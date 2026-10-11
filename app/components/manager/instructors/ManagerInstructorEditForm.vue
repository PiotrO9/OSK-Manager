<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { CourseTypeOption } from '~/types/courses/courseType';
import { courseTypeVehicleIcon } from '~/utils/courses/courseTypeVehicleIcon';
import type { InstructorEditFormModel } from '~/types/instructors/instructor';
import {
    buildInstructorEditCourseTypeRows,
    parseInstructorExperienceYearsInput,
    updateInstructorCourseTypeSelection,
} from '~/utils/instructors/managerInstructorEditDialog';

const props = defineProps<{
    isSubmitting: boolean;
    submitError: string | null;
    courseTypes: CourseTypeOption[];
    selectedQualifiedCourseTypes: CourseTypeOption[];
    isCourseTypesLoading: boolean;
    courseTypesError: string | null;
    categoriesOnly: boolean;
}>();

const emit = defineEmits<{
    cancel: [];
    submit: [];
}>();

const form = defineModel<InstructorEditFormModel>('form', {
    required: true,
});

function handleExperienceYearsInput(event: Event): void {
    const el = event.target as HTMLInputElement;

    form.value.experienceYears = parseInstructorExperienceYearsInput(el.value);
}

const courseTypeRows = computed(() =>
    buildInstructorEditCourseTypeRows(
        props.courseTypes,
        props.selectedQualifiedCourseTypes,
    ),
);

const isCourseTypesSelectionBlocked = computed(
    () =>
        props.isSubmitting ||
        props.isCourseTypesLoading ||
        props.courseTypesError !== null,
);

function isCourseTypeSelected(id: string): boolean {
    return form.value.qualifiedCourseTypeIds.includes(id);
}

function courseTypeName(item: CourseTypeOption): string {
    return item.name.trim() || `Kategoria ${item.code}`;
}

function handleCourseTypeCheckedChange(
    id: string,
    checked: boolean | 'indeterminate',
): void {
    form.value.qualifiedCourseTypeIds = updateInstructorCourseTypeSelection(
        form.value.qualifiedCourseTypeIds,
        id,
        checked,
    );
}

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
</script>

<template>
    <form
        class="space-y-4"
        :aria-label="
            categoriesOnly
                ? 'Edycja kategorii instruktora'
                : 'Edycja danych instruktora'
        "
        :aria-busy="isSubmitting"
        @submit.prevent="emit('submit')"
    >
        <p
            v-if="isSubmitting"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Zapisywanie zmian…
        </p>

        <div v-if="!categoriesOnly" class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
                <label
                    class="text-sm leading-none font-medium"
                    for="instructor-edit-first-name"
                >
                    Imię
                </label>
                <input
                    id="instructor-edit-first-name"
                    v-model="form.firstName"
                    type="text"
                    name="firstName"
                    autocomplete="given-name"
                    required
                    :disabled="isSubmitting"
                    :class="fieldClass"
                />
            </div>
            <div class="space-y-2">
                <label
                    class="text-sm leading-none font-medium"
                    for="instructor-edit-last-name"
                >
                    Nazwisko
                </label>
                <input
                    id="instructor-edit-last-name"
                    v-model="form.lastName"
                    type="text"
                    name="lastName"
                    autocomplete="family-name"
                    required
                    :disabled="isSubmitting"
                    :class="fieldClass"
                />
            </div>
        </div>

        <div v-if="!categoriesOnly" class="space-y-2">
            <label
                class="text-sm leading-none font-medium"
                for="instructor-edit-email"
            >
                E‑mail
            </label>
            <input
                id="instructor-edit-email"
                :value="form.email"
                type="email"
                name="email"
                readonly
                tabindex="-1"
                aria-readonly="true"
                :disabled="isSubmitting"
                :class="
                    cn(
                        fieldClass,
                        'bg-muted text-muted-foreground cursor-not-allowed',
                    )
                "
            />
        </div>

        <div v-if="!categoriesOnly" class="space-y-2">
            <label
                class="text-sm leading-none font-medium"
                for="instructor-edit-experience-years"
            >
                Staż (lata)
            </label>
            <input
                id="instructor-edit-experience-years"
                type="number"
                name="experienceYears"
                min="0"
                max="80"
                step="1"
                :value="form.experienceYears"
                :disabled="isSubmitting"
                :class="fieldClass"
                aria-describedby="instructor-edit-experience-hint"
                @input="handleExperienceYearsInput"
            />
            <p
                id="instructor-edit-experience-hint"
                class="text-muted-foreground text-xs"
            >
                Liczba całkowita od 0 do 80.
            </p>
        </div>

        <div v-if="!categoriesOnly" class="space-y-2">
            <label
                class="text-sm leading-none font-medium"
                for="instructor-edit-qualifications"
            >
                Kwalifikacje
            </label>
            <textarea
                id="instructor-edit-qualifications"
                v-model="form.qualifications"
                name="qualifications"
                rows="4"
                :disabled="isSubmitting"
                class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
        </div>

        <fieldset class="flex flex-col gap-3">
            <legend
                :class="categoriesOnly ? 'sr-only' : 'mb-3 text-sm font-medium'"
            >
                <span
                    v-if="!categoriesOnly"
                    class="inline-flex items-center gap-1"
                >
                    Kategorie uprawnień
                    <ManagerInstructorCategoryRulesTooltip />
                </span>
                <span v-else>Kategorie uprawnień</span>
            </legend>

            <p
                v-if="isCourseTypesLoading"
                class="text-muted-foreground text-sm"
                role="status"
                aria-live="polite"
            >
                Wczytywanie katalogu kategorii…
            </p>
            <p
                v-else-if="courseTypesError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ courseTypesError }}
            </p>
            <p
                v-else-if="courseTypeRows.length === 0"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak kategorii do wyboru.
            </p>

            <div
                v-if="courseTypeRows.length > 0"
                class="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2"
            >
                <label
                    v-for="row in courseTypeRows"
                    :key="row.item.id"
                    class="border-border hover:bg-muted/50 flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
                    :class="
                        row.isUnavailable
                            ? 'text-muted-foreground cursor-not-allowed opacity-60'
                            : isCourseTypeSelected(row.item.id)
                              ? 'border-primary/35 bg-primary/5 text-foreground cursor-pointer'
                              : 'text-foreground cursor-pointer'
                    "
                >
                    <UiCheckbox
                        :model-value="isCourseTypeSelected(row.item.id)"
                        :disabled="
                            row.isUnavailable || isCourseTypesSelectionBlocked
                        "
                        :aria-label="`Uprawnienie ${courseTypeName(row.item)}`"
                        @update:model-value="
                            handleCourseTypeCheckedChange(row.item.id, $event)
                        "
                    />
                    <span
                        class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md"
                        :class="
                            isCourseTypeSelected(row.item.id)
                                ? 'bg-primary/10 text-primary'
                                : ''
                        "
                        aria-hidden="true"
                    >
                        <component
                            :is="courseTypeVehicleIcon(row.item.code)"
                            class="size-4"
                        />
                    </span>
                    <span class="flex min-w-0 flex-col gap-1">
                        <span class="text-sm font-medium">
                            {{ courseTypeName(row.item) }}
                        </span>
                        <span
                            v-if="row.isUnavailable"
                            class="text-muted-foreground text-xs"
                        >
                            Przypisana kategoria spoza aktualnego katalogu.
                        </span>
                    </span>
                </label>
            </div>
        </fieldset>

        <p
            v-if="submitError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ submitError }}
        </p>

        <UiDialogFooter class="gap-2 sm:gap-2">
            <UiButton
                type="button"
                variant="outline"
                :disabled="isSubmitting"
                @click="emit('cancel')"
            >
                Anuluj
            </UiButton>
            <UiButton
                type="submit"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
            >
                {{ isSubmitting ? 'Zapisywanie…' : 'Zapisz' }}
            </UiButton>
        </UiDialogFooter>
    </form>
</template>
