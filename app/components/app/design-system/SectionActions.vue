<script setup lang="ts">
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-vue-next';
</script>

<template>
    <section class="space-y-5" aria-label="Przyciski i akcje">
        <FormSection
            title="Hierarchia akcji"
            description="Jedna główna akcja w grupie; pozostałe zachowują spokojniejszą wagę."
        >
            <div class="space-y-5">
                <ActionGroup label="Warianty przycisków">
                    <UiButton><Plus aria-hidden="true" /> Dodaj jazdę</UiButton>
                    <UiButton variant="outline"
                        ><Pencil aria-hidden="true" /> Edytuj</UiButton
                    >
                    <UiButton variant="ghost">Szczegóły</UiButton>
                    <UiButton variant="destructive"
                        ><Trash2 aria-hidden="true" /> Usuń</UiButton
                    >
                    <UiButton variant="link">Przejdź do profilu</UiButton>
                </ActionGroup>
                <ActionGroup label="Rozmiary przycisków">
                    <UiButton size="sm">Mały</UiButton
                    ><UiButton>Standardowy</UiButton
                    ><UiButton size="lg">Duży</UiButton>
                    <UiButton
                        size="icon"
                        variant="outline"
                        aria-label="Edytuj kursanta"
                        ><Pencil aria-hidden="true"
                    /></UiButton>
                </ActionGroup>
                <ActionGroup label="Stany przycisków">
                    <UiButton class="!cursor-wait" disabled
                        ><LoaderCircle
                            class="animate-spin"
                            aria-hidden="true"
                        />
                        Zapisywanie</UiButton
                    >
                    <UiButton
                        class="!cursor-not-allowed"
                        variant="outline"
                        disabled
                    >
                        Brak uprawnień</UiButton
                    >
                </ActionGroup>
            </div>
            <template #footer
                ><ActionGroup label="Akcje formularza" align="end"
                    ><UiButton variant="ghost">Anuluj</UiButton
                    ><UiButton>Zapisz zmiany</UiButton></ActionGroup
                ></template
            >
        </FormSection>
    </section>
</template>
