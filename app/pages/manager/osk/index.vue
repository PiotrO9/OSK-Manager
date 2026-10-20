<script setup lang="ts">
import { appPaths } from '~~/shared/routing/appPaths';
import { Plus } from '@lucide/vue';

definePageMeta({
    layout: 'app-shell',
    middleware: [
        'manager',
        (to) => {
            if (to.query.action !== 'create') return;

            const query = { ...to.query };

            delete query.action;

            return navigateTo(
                { path: appPaths.managerSchoolNew(), query, hash: to.hash },
                { replace: true },
            );
        },
    ],
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
                    :disabled="isListLoading || deletingId !== null"
                    @click="navigateTo(appPaths.managerSchoolNew())"
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
            @retry="loadSchools"
            @request-add="navigateTo(appPaths.managerSchoolNew())"
            @request-edit="navigateTo(appPaths.managerSchoolEdit($event.id))"
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
    </div>
</template>
