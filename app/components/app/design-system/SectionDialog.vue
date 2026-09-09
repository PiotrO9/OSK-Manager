<script setup lang="ts">
const isOpen = shallowRef(false);
</script>

<template>
    <FormSection
        title="Potwierdzenie operacji"
        description="Dialog zatrzymuje użytkownika tylko przy operacji wymagającej świadomej decyzji."
    >
        <UiDialog v-model:open="isOpen">
            <UiDialogTrigger as-child
                ><UiButton variant="destructive"
                    >Anuluj zaplanowaną jazdę</UiButton
                ></UiDialogTrigger
            >
            <UiDialogContent
                aria-describedby="design-system-dialog-description"
            >
                <UiDialogHeader
                    ><UiDialogTitle>Anulować jazdę?</UiDialogTitle
                    ><UiDialogDescription id="design-system-dialog-description"
                        >Termin 10 września, 08:00–09:30 zostanie zwolniony.
                        Kursant otrzyma informację zgodnie z ustawieniami
                        powiadomień.</UiDialogDescription
                    ></UiDialogHeader
                >
                <UiDialogFooter
                    ><UiButton variant="outline" @click="isOpen = false"
                        >Wróć</UiButton
                    ><UiButton variant="destructive" @click="isOpen = false"
                        >Anuluj jazdę</UiButton
                    ></UiDialogFooter
                >
            </UiDialogContent>
        </UiDialog>
    </FormSection>
</template>
