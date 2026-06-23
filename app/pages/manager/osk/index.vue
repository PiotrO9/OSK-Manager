<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';

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
    statsError,
    isListLoading,
    isStatsLoading,
    instructorCount,
    studentCount,
    defaultSchoolCount,
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

const summaryItems = computed(() => [
    {
        label: 'Szkoły',
        value: schools.value.length,
    },
    {
        label: 'Domyślna',
        value: defaultSchoolCount.value,
    },
    {
        label: 'Instruktorzy',
        value:
            isStatsLoading.value && instructorCount.value === null
                ? '...'
                : (instructorCount.value ?? '—'),
    },
    {
        label: 'Kursanci',
        value:
            isStatsLoading.value && studentCount.value === null
                ? '...'
                : (studentCount.value ?? '—'),
    },
]);

const defaultSchoolName = computed(
    () =>
        schools.value.find((school) => school.isDefault === true)?.name ??
        'Brak domyślnej',
);

const resultLabel = computed(() => {
    const count = schools.value.length;

    if (count === 1) return '1 wynik';

    if ([2, 3, 4].includes(count)) return `${count} wyniki`;

    return `${count} wyników`;
});
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Szkoły jazdy"
            description="Zarządzaj szkołami przypisanymi do konta managera."
        >
            <template #actions>
                <UiButton
                    variant="outline"
                    class="bg-card shadow-xs"
                    type="button"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    22-28 czerwca
                </UiButton>
                <UiButton
                    type="button"
                    :disabled="deletingId !== null || isFormSaving"
                    @click="openCreateFormDialog"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    Dodaj OSK
                </UiButton>
            </template>
        </PageHeader>

        <p v-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <template v-else>
            <SummaryStrip :items="summaryItems" />

            <p
                v-if="statsError"
                class="text-muted-foreground text-xs"
                role="status"
            >
                {{ statsError }}
            </p>

            <FilterBar :result-label="resultLabel" :is-loading="isListLoading">
                <StatusBadge :label="defaultSchoolName" tone="info" subtle />
                <StatusBadge label="Typ: wszystkie" subtle />
                <StatusBadge label="Status: aktywne" subtle />
            </FilterBar>

            <ManagerOskListGrid
                :schools="schools"
                :is-list-loading="isListLoading"
                :deleting-id="deletingId"
                :is-form-saving="isFormSaving"
                @request-add="openCreateFormDialog"
                @request-edit="openEditFormDialog"
                @request-delete="handleRequestDelete"
            />
        </template>

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
