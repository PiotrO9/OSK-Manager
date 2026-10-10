<script setup lang="ts">
import { Building2, RefreshCw } from 'lucide-vue-next';

const dashboard = useManagerDashboardPage();
</script>

<template>
    <div class="space-y-4 md:space-y-5">
        <ManagerDashboardSkeleton
            v-if="
                dashboard.isDefaultLoading.value &&
                !dashboard.defaultSchool.value
            "
        />

        <ErrorState
            v-else-if="dashboard.defaultSchoolError.value"
            title="Nie udało się wczytać pulpitu"
            :description="dashboard.defaultSchoolError.value"
        >
            <template #action>
                <UiButton
                    type="button"
                    variant="outline"
                    class="min-h-11"
                    @click="dashboard.loadDashboard"
                >
                    <RefreshCw class="size-4" aria-hidden="true" />
                    Spróbuj ponownie
                </UiButton>
            </template>
        </ErrorState>

        <section
            v-else-if="dashboard.isNotConfigured.value"
            class="border-border bg-card rounded-2xl border p-5 shadow-sm md:p-6"
            aria-labelledby="dashboard-no-school-heading"
        >
            <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span
                    class="bg-primary-50 text-primary-700 flex size-12 shrink-0 items-center justify-center rounded-2xl"
                >
                    <Building2 class="size-6" aria-hidden="true" />
                </span>
                <div class="min-w-0 flex-1 space-y-1">
                    <h2
                        id="dashboard-no-school-heading"
                        class="text-foreground text-lg font-bold"
                    >
                        Ustaw domyślną szkołę
                    </h2>
                    <p class="text-muted-foreground text-sm leading-relaxed">
                        Pulpit potrzebuje kontekstu szkoły, aby pokazać sprawy
                        operacyjne i wolne terminy instruktorów.
                    </p>
                </div>
                <UiButton as-child class="min-h-11 shrink-0">
                    <NuxtLink to="/manager/osk?action=create">
                        Dodaj lub wybierz OSK
                    </NuxtLink>
                </UiButton>
            </div>
        </section>

        <template v-else-if="dashboard.defaultSchool.value">
            <ManagerDefaultSchoolCard :school="dashboard.defaultSchool.value" />
            <ManagerDashboardQuickActions />

            <ManagerAttentionItemsPanel
                :items="dashboard.attention.value.items"
                :total="dashboard.attention.value.total"
                :is-loading="dashboard.isAttentionLoading.value"
                :error="dashboard.attentionError.value"
                @retry="dashboard.loadAttention()"
            />

            <ManagerDashboardAvailabilitySection
                :school-id="dashboard.defaultSchool.value.id"
            />
        </template>
    </div>
</template>
