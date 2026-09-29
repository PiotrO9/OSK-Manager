<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Szkoły jazdy',
    description: () => 'Lista szkół jazdy przypisanych do konta managera.',
});

const {
    schools,
    defaultSchool,
    loadError,
    isListLoading,
    loadSchools,
    deletingId,
    settingDefaultId,
    confirmTarget,
    isConfirmOpen,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmOpenChange,
    handleConfirmDelete,
    handleSetDefault,
    formDialogOpen,
    formDialogMode,
    formName,
    formCity,
    formAddress,
    formAsDefault,
    formErrors,
    formSubmitError,
    isFormSaving,
    isDefaultSwitchLocked,
    openCreateFormDialog,
    openEditFormDialog,
    handleFormDialogOpenChange,
    submitFormDialog,
} = useManagerOskPage();
</script>

<template>
    <div class="min-w-0 space-y-5">
        <PageHeader
            title="Szkoły jazdy"
            description="Zarządzaj danymi szkół i wybierz domyślny kontekst pracy."
        >
            <template #actions>
                <UiButton
                    type="button"
                    class="h-11 w-full px-4 sm:h-10 sm:w-auto"
                    :disabled="
                        isListLoading || deletingId !== null || isFormSaving
                    "
                    @click="openCreateFormDialog"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    Dodaj OSK
                </UiButton>
            </template>
        </PageHeader>

        <ManagerOskListPanel
            :schools="schools"
            :default-school="defaultSchool"
            :load-error="loadError"
            :is-loading="isListLoading"
            :deleting-id="deletingId"
            :setting-default-id="settingDefaultId"
            :is-form-saving="isFormSaving"
            @retry="loadSchools"
            @request-add="openCreateFormDialog"
            @request-edit="openEditFormDialog"
            @request-delete="handleRequestDelete"
            @set-default="handleSetDefault"
        />

        <ManagerOskDeleteDialog
            :open="isConfirmOpen"
            :school-name="confirmTarget?.name ?? ''"
            :is-deleting="deletingId !== null"
            :is-default="confirmTarget?.isDefault === true"
            :is-only-school="schools.length === 1"
            @update:open="handleConfirmOpenChange"
            @cancel="handleCancelDelete"
            @confirm="handleConfirmDelete"
        />

        <ManagerOskSchoolFormDialog
            :open="formDialogOpen"
            :mode="formDialogMode"
            :name="formName"
            :city="formCity"
            :address="formAddress"
            :as-default="formAsDefault"
            :is-saving="isFormSaving"
            :default-switch-locked="isDefaultSwitchLocked"
            :name-error="formErrors.name"
            :submit-error="formSubmitError"
            @update:open="handleFormDialogOpenChange"
            @update:name="formName = $event"
            @update:city="formCity = $event"
            @update:address="formAddress = $event"
            @update:as-default="formAsDefault = $event"
            @submit="submitFormDialog"
        />
    </div>
</template>
