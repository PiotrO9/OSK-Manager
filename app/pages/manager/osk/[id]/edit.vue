<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue';

definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({
    title: () => 'Edytuj OSK',
    description: () => 'Zmień dane i ofertę szkoły jazdy.',
});

const {
    school,
    isSchoolLoading,
    schoolLoadError,
    isSchoolMissing,
    loadSchool,
    courseTypes,
    isCourseTypesLoading,
    courseTypesLoadError,
    loadCourseTypes,
    name,
    city,
    address,
    enabledCourseKinds,
    offeredCourseTypeIds,
    nameError,
    submitError,
    navigationError,
    isSaving,
    isSaved,
    isNavigating,
    canSave,
    isLeaveDialogOpen,
    cancelLeave,
    confirmDiscard,
    returnToList,
    handleSubmit,
} = useManagerOskEditPage();
const form = useTemplateRef<{ focusName: () => void }>('form');

async function submitForm() {
    if ((await handleSubmit()) === 'field-error') {
        await nextTick();
        form.value?.focusName();
    }
}
</script>

<template>
    <div class="min-w-0 space-y-6">
        <PageHeader
            title="Edytuj OSK"
            description="Zaktualizuj dane szkoły i jej ofertę kursów."
        >
            <template #actions>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isSaving || isNavigating"
                    @click="returnToList"
                >
                    <ArrowLeft class="size-4" aria-hidden="true" />
                    Wróć do szkół
                </UiButton>
            </template>
        </PageHeader>

        <div class="w-full max-w-5xl space-y-5">
            <LoadingState
                v-if="isSchoolLoading"
                title="Wczytywanie szkoły jazdy…"
                :show-labels="false"
            />
            <ErrorState
                v-else-if="schoolLoadError"
                title="Nie udało się wczytać OSK"
                :description="schoolLoadError"
                @retry="loadSchool"
            />
            <EmptyState
                v-else-if="isSchoolMissing"
                title="Nie znaleziono szkoły jazdy"
                description="Ta szkoła nie istnieje lub nie jest przypisana do Twojego konta."
            >
                <template #action>
                    <UiButton type="button" @click="returnToList"
                        >Wróć na listę OSK</UiButton
                    >
                </template>
            </EmptyState>
            <template v-else-if="school">
                <div class="border-border bg-card rounded-xl border p-4 sm:p-5">
                    <SchoolContext
                        :school="school"
                        label="Aktualny ośrodek"
                        show-address
                    />
                </div>
                <p
                    v-if="isSaved"
                    class="border-border bg-card rounded-xl border p-5"
                    role="status"
                >
                    Zmiany zostały zapisane.
                </p>
                <ManagerOskEditForm
                    v-else
                    ref="form"
                    v-model:name="name"
                    v-model:city="city"
                    v-model:address="address"
                    v-model:enabled-course-kinds="enabledCourseKinds"
                    v-model:offered-course-type-ids="offeredCourseTypeIds"
                    :course-types="courseTypes"
                    :is-course-types-loading="isCourseTypesLoading"
                    :course-types-load-error="courseTypesLoadError"
                    :is-saving="isSaving"
                    :is-navigating="isNavigating"
                    :can-save="canSave"
                    :name-error="nameError"
                    :submit-error="submitError"
                    @retry-course-types="loadCourseTypes"
                    @submit="submitForm"
                    @cancel="returnToList"
                />
            </template>
            <div v-if="navigationError" class="space-y-3">
                <p class="text-destructive text-sm" role="alert">
                    {{ navigationError }}
                </p>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isNavigating"
                    @click="returnToList"
                    >Wróć na listę OSK</UiButton
                >
            </div>
        </div>

        <ManagerOskDiscardDialog
            :open="isLeaveDialogOpen"
            @cancel="cancelLeave"
            @discard="confirmDiscard"
        />
    </div>
</template>
