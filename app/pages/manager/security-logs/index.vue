<script setup lang="ts">
definePageMeta({ layout: 'app-shell', middleware: ['security-logs-manager'] });
usePageMeta({
    title: () => 'Logi bezpieczeństwa',
    description: () => 'Dziennik zdarzeń bezpieczeństwa w OSK.',
});

const page = useManagerSecurityLogsPage();
</script>

<template>
    <ManagerSecurityLogsPanel
        :schools="page.schools.value"
        :school-id="page.schoolId.value"
        :active-school="page.activeSchool.value"
        :schools-loading="page.schoolsLoading.value"
        :schools-error="page.schoolsError.value"
        :items="page.items.value"
        :page-info="page.pageInfo.value"
        :collection-status="page.collectionStatus.value"
        :loading="page.loading.value"
        :error="page.error.value"
        :search="page.search.value"
        :quick-view="page.quickView.value"
        :filters="page.filters.value"
        :draft="page.draft.value"
        :draft-error="page.draftError.value"
        :selected-event-id="page.selectedEventId.value"
        :detail="page.detail.value"
        :detail-loading="page.detailLoading.value"
        :detail-error="page.detailError.value"
        :person-options="page.personOptions.value"
        :person-options-loading="page.personOptionsLoading.value"
        @reload-schools="page.loadSchools"
        @refresh="page.refresh"
        @school-change="page.changeSchool"
        @search-change="page.updateSearch"
        @view-change="page.updateView"
        @clear-filters="page.clearFilters"
        @start-new-filter="page.startNewFilter"
        @start-edit-filter="page.startEditFilter"
        @update-draft="page.updateDraft"
        @apply-draft="page.applyDraft"
        @remove-filter="page.removeFilter"
        @search-people="page.loadPersonOptions"
        @page-older="page.pageOlder"
        @page-newer="page.pageNewer"
        @open-details="page.openDetails"
        @close-details="page.closeDetails"
        @retry-details="page.openDetails(page.selectedEventId.value)"
    />
</template>
