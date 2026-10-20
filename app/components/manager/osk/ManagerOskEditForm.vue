<script setup lang="ts">
import type { CourseKind } from '~~/shared/contracts/courses';
import type { CourseTypeOption } from '~/types/courses/courseType';

defineProps<{
    name: string;
    city: string;
    address: string;
    enabledCourseKinds: CourseKind[];
    offeredCourseTypeIds: string[];
    courseTypes: CourseTypeOption[];
    isCourseTypesLoading: boolean;
    courseTypesLoadError: string | null;
    isSaving: boolean;
    isNavigating: boolean;
    canSave: boolean;
    nameError: string;
    submitError: string;
}>();
const emit = defineEmits<{
    'update:name': [value: string];
    'update:city': [value: string];
    'update:address': [value: string];
    'update:enabledCourseKinds': [value: CourseKind[]];
    'update:offeredCourseTypeIds': [value: string[]];
    retryCourseTypes: [];
    submit: [];
    cancel: [];
}>();
const fields = useTemplateRef<{ focusName: () => void }>('fields');

defineExpose({ focusName: () => fields.value?.focusName() });
</script>

<template>
    <form
        novalidate
        class="space-y-5"
        :aria-busy="isSaving"
        @submit.prevent="emit('submit')"
    >
        <section
            class="border-border bg-card space-y-5 rounded-xl border p-5 sm:p-6"
            aria-labelledby="osk-edit-basic-title"
        >
            <div class="space-y-1">
                <h2
                    id="osk-edit-basic-title"
                    class="text-foreground text-lg font-semibold"
                >
                    Dane szkoły jazdy
                </h2>
                <p class="text-muted-foreground text-sm">
                    Zmień nazwę i dane adresowe ośrodka.
                </p>
            </div>
            <fieldset
                :disabled="isSaving || isNavigating"
                class="grid gap-5 md:grid-cols-2"
            >
                <legend class="sr-only">Dane szkoły jazdy</legend>
                <div class="md:col-span-2">
                    <ManagerOskBasicFields
                        ref="fields"
                        :name="name"
                        :city="city"
                        :address="address"
                        :name-error="nameError"
                        :disabled="isSaving || isNavigating"
                        @update:name="emit('update:name', $event)"
                        @update:city="emit('update:city', $event)"
                        @update:address="emit('update:address', $event)"
                    />
                </div>
            </fieldset>
        </section>

        <section
            class="border-border bg-card space-y-5 rounded-xl border p-5 sm:p-6"
            aria-labelledby="osk-edit-offer-title"
        >
            <div class="space-y-1">
                <h2
                    id="osk-edit-offer-title"
                    class="text-foreground text-lg font-semibold"
                >
                    Oferta kursów
                </h2>
                <p class="text-muted-foreground text-sm">
                    Wybierz rodzaje kursów i oferowane kategorie.
                </p>
            </div>
            <ManagerOskCourseSettingsFields
                :enabled-course-kinds="enabledCourseKinds"
                :offered-course-type-ids="offeredCourseTypeIds"
                :course-types="courseTypes"
                :is-course-types-loading="isCourseTypesLoading"
                :course-types-load-error="courseTypesLoadError"
                :is-saving="isSaving || isNavigating"
                @update:enabled-course-kinds="
                    emit('update:enabledCourseKinds', $event)
                "
                @update:offered-course-type-ids="
                    emit('update:offeredCourseTypeIds', $event)
                "
                @retry-course-types="emit('retryCourseTypes')"
            />
        </section>

        <div
            class="border-border bg-card space-y-4 rounded-xl border p-5 sm:p-6"
        >
            <p v-if="submitError" class="text-destructive text-sm" role="alert">
                {{ submitError }}
            </p>
            <p
                v-if="courseTypesLoadError"
                class="text-muted-foreground text-sm"
            >
                Wczytaj katalog kategorii, aby bezpiecznie zapisać ustawienia
                oferty.
            </p>
            <div class="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isSaving || isNavigating"
                    @click="emit('cancel')"
                    >Anuluj</UiButton
                >
                <UiButton
                    type="submit"
                    :disabled="!canSave || isNavigating"
                    :aria-busy="isSaving"
                    >{{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}</UiButton
                >
            </div>
        </div>
    </form>
</template>
