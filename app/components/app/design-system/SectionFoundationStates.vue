<script setup lang="ts">
import { Save } from 'lucide-vue-next';

const fields = [
    { id: 'school-name-demo', label: 'Nazwa OSK', value: 'OSK Zgierz' },
    { id: 'school-city-demo', label: 'Miasto', value: 'Zgierz' },
];
</script>

<template>
    <section class="space-y-4" aria-labelledby="foundation-states-heading">
        <div class="flex flex-col gap-1">
            <StatusBadge label="Stany systemu" tone="success" subtle />
            <h2
                id="foundation-states-heading"
                class="text-foreground text-xl font-bold tracking-tight"
            >
                Stany i formularze
            </h2>
            <p class="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                Te elementy mają stabilizować układ i ujednolicić komunikaty w
                widokach operacyjnych.
            </p>
        </div>

        <div class="grid min-w-0 gap-4 lg:grid-cols-3">
            <LoadingState
                title="Wczytywanie kursantów"
                description="Szkielet utrzymuje miejsce dla docelowego układu."
            />
            <ErrorState
                title="Nie udało się pobrać listy"
                description="Komunikat błędu pozostaje blisko danych, których dotyczy."
            />
            <EmptyState
                title="Brak kursantów"
                description="Pusty stan może zawierać konkretną akcję."
            >
                <template #action>
                    <UiButton type="button" size="sm">Dodaj kursanta</UiButton>
                </template>
            </EmptyState>
        </div>

        <FormSection
            title="Dane podstawowe"
            description="Sekcja formularza grupuje powiązane pola i utrzymuje stałe miejsce akcji."
        >
            <div class="grid gap-4 md:grid-cols-2">
                <div v-for="field in fields" :key="field.id" class="space-y-2">
                    <UiLabel :for="field.id">{{ field.label }}</UiLabel>
                    <UiInput
                        :id="field.id"
                        :model-value="field.value"
                        readonly
                    />
                </div>
            </div>

            <template #footer>
                <ActionGroup label="Akcje formularza" align="end">
                    <UiButton type="button" variant="outline">Anuluj</UiButton>
                    <UiButton type="button">
                        <Save aria-hidden="true" />
                        Zapisz
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </section>
</template>
