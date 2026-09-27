<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui';
import type { RouteLocationRaw } from 'vue-router';
import type { VehicleDetail } from '~/types/vehicles/vehicle';

type VehicleDetailsTab = 'overview' | 'documents' | 'details';

const props = defineProps<{
    vehicle: VehicleDetail;
    backToListHref: RouteLocationRaw;
    editHref: RouteLocationRaw;
}>();

const {
    availability,
    deadlineItems,
    profileRows,
    registrationNumberLabel,
    technicalRows,
    vehicleInitials,
    vehicleTitle,
} = useVehicleDetailsPresentation({
    vehicle: toRef(props, 'vehicle'),
});

const tabs: Array<{ value: VehicleDetailsTab; label: string }> = [
    { value: 'overview', label: 'Przegląd' },
    { value: 'documents', label: 'Dokumenty' },
    { value: 'details', label: 'Dane' },
];

const activeTab = shallowRef<VehicleDetailsTab>('overview');
const visitedTabs = reactive<Record<VehicleDetailsTab, boolean>>({
    overview: true,
    documents: false,
    details: false,
});

watch(
    activeTab,
    (tab) => {
        visitedTabs[tab] = true;
    },
    { immediate: true },
);

watch(
    () => props.vehicle.id,
    () => {
        activeTab.value = 'overview';
        visitedTabs.overview = true;
        visitedTabs.documents = false;
        visitedTabs.details = false;
    },
);

function normalizeTab(value: string): VehicleDetailsTab {
    if (value === 'documents' || value === 'details') return value;

    return 'overview';
}

function getTabTriggerId(tab: VehicleDetailsTab): string {
    return `vehicle-details-tab-${tab}`;
}

function getTabPanelId(tab: VehicleDetailsTab): string {
    return `vehicle-details-panel-${tab}`;
}

function isTabVisible(tab: VehicleDetailsTab): boolean {
    return activeTab.value === tab;
}

function handleTabChange(value: string | number): void {
    activeTab.value = normalizeTab(String(value));
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader :title="vehicleTitle" eyebrow="Pojazd">
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-lg px-4 font-semibold shadow-xs"
                >
                    <NuxtLink
                        :to="props.backToListHref"
                        aria-label="Wróć do listy pojazdów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista pojazdów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
        >
            <aside class="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
                <VehicleProfileCard
                    :photo-url="props.vehicle.photoUrl"
                    :initials="vehicleInitials"
                    :name="vehicleTitle"
                    :registration-number="registrationNumberLabel"
                    :availability-label="availability.label"
                    :availability-tone="availability.tone"
                    :is-default="props.vehicle.isDefault"
                    :profile-rows="profileRows"
                />
            </aside>

            <main class="min-w-0">
                <TabsRoot
                    :model-value="activeTab"
                    class="min-w-0 space-y-5"
                    @update:model-value="handleTabChange"
                >
                    <div
                        class="border-border overflow-x-auto overflow-y-hidden border-b"
                        aria-label="Sekcje kartoteki pojazdu"
                    >
                        <TabsList class="flex min-w-max gap-5">
                            <TabsTrigger
                                v-for="tab in tabs"
                                :id="getTabTriggerId(tab.value)"
                                :key="tab.value"
                                :value="tab.value"
                                :aria-controls="getTabPanelId(tab.value)"
                                class="text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground focus-visible:ring-ring -mb-px cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                {{ tab.label }}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <section
                        v-if="visitedTabs.overview"
                        :id="getTabPanelId('overview')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('overview')"
                        :hidden="!isTabVisible('overview')"
                    >
                        <VehicleOverviewTab :availability="availability" />
                    </section>

                    <section
                        v-if="visitedTabs.documents"
                        :id="getTabPanelId('documents')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('documents')"
                        :hidden="!isTabVisible('documents')"
                    >
                        <VehicleDocumentsTab
                            :deadline-items="deadlineItems"
                            :edit-href="props.editHref"
                        />
                    </section>

                    <section
                        v-if="visitedTabs.details"
                        :id="getTabPanelId('details')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('details')"
                        :hidden="!isTabVisible('details')"
                    >
                        <VehicleTechnicalDetailsCard
                            :rows="technicalRows"
                            :edit-href="props.editHref"
                        />
                    </section>
                </TabsRoot>
            </main>
        </div>
    </div>
</template>
