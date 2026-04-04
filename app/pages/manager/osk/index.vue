<script setup lang="ts">
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
    loadError,
    isListLoading,
    deletingId,
    confirmTarget,
    isConfirmOpen,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmOpenChange,
    handleConfirmDelete,
    formDialogOpen,
    formDialogMode,
    formName,
    formCity,
    formAddress,
    formAsDefault,
    isFormSaving,
    isDefaultSwitchLocked,
    openCreateFormDialog,
    openEditFormDialog,
    handleFormDialogOpenChange,
    submitFormDialog,
} = useManagerOskPage();
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Szkoły jazdy
            </h1>
        </div>

        <p v-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <ManagerOskListGrid
            v-else
            :schools="schools"
            :is-list-loading="isListLoading"
            :deleting-id="deletingId"
            :is-form-saving="isFormSaving"
            @request-add="openCreateFormDialog"
            @request-edit="openEditFormDialog"
            @request-delete="handleRequestDelete"
        />

        <ManagerOskDeleteDialog
            :open="isConfirmOpen"
            :school-name="confirmTarget?.name ?? ''"
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
            @update:open="handleFormDialogOpenChange"
            @update:name="formName = $event"
            @update:city="formCity = $event"
            @update:address="formAddress = $event"
            @update:as-default="formAsDefault = $event"
            @submit="submitFormDialog"
        />
    </div>
</template>
