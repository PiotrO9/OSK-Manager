<script setup lang="ts">
import { ArrowLeft, Save } from 'lucide-vue-next';
import type { VehicleWritePayload } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Nowy pojazd',
    description: () => 'Dodaj pojazd do szkoły jazdy.',
});

const route = useRoute();
const { createVehicle, isCreateLoading } = useVehiclesApi();

const FORM_ID = 'vehicle-create-form';

const apiError = ref<string | null>(null);

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const vehiclesListRoute = computed(() => ({
    path: '/vehicles',
    query: schoolId.value !== null ? { schoolId: schoolId.value } : undefined,
}));

async function handleVehicleSubmit(payload: VehicleWritePayload) {
    const sid = schoolId.value;

    if (!sid) return;

    apiError.value = null;

    try {
        await createVehicle({
            schoolId: sid,
            ...payload,
        });

        await navigateTo({
            path: '/vehicles',
            query: { schoolId: sid },
        });
    } catch (err) {
        apiError.value =
            err instanceof Error ? err.message : 'Nie udało się dodać pojazdu.';
    }
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Dodaj pojazd"
            description="Wprowadz dane nowego pojazdu szkoleniowego."
            eyebrow="Nowy pojazd"
        >
            <template #actions>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="vehiclesListRoute">
                        <ArrowLeft class="size-4" aria-hidden="true" />
                        Anuluj
                    </NuxtLink>
                </UiButton>
                <UiButton
                    type="submit"
                    :form="FORM_ID"
                    :disabled="isCreateLoading || schoolId === null"
                >
                    <Save class="size-4" aria-hidden="true" />
                    {{ isCreateLoading ? 'Zapisywanie...' : 'Zapisz pojazd' }}
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="schoolId === null"
            title="Brak kontekstu OSK"
            description="Otwórz te stronę z listy pojazdów, aby zachować identyfikator szkoły jazdy."
        >
            <template #action>
                <UiButton as-child variant="outline" class="bg-background">
                    <NuxtLink to="/vehicles">Wróć do listy</NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <FormSection
            v-else
            title="Dodaj pojazd"
            description="Formularz jest podzielony na logiczne pola bez zmiany walidacji i flow zapisu."
        >
            <VehicleForm
                :form-id="FORM_ID"
                mode="create"
                :initial-vehicle="null"
                :is-saving="isCreateLoading"
                :api-error="apiError"
                hide-default-actions
                @submit="handleVehicleSubmit"
            />

            <template #footer>
                <ActionGroup label="Akcje formularza" align="end">
                    <UiButton as-child variant="outline">
                        <NuxtLink :to="vehiclesListRoute">Anuluj</NuxtLink>
                    </UiButton>
                    <UiButton
                        type="submit"
                        :form="FORM_ID"
                        :disabled="isCreateLoading"
                    >
                        {{ isCreateLoading ? 'Zapisywanie...' : 'Zapisz' }}
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </div>
</template>
