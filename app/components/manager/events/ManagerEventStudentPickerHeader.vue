<script setup lang="ts">
defineProps<{
    descriptionId: string;
}>();
</script>

<template>
    <UiDialogHeader>
        <UiDialogTitle>Przypisz kursantów do wydarzenia</UiDialogTitle>
        <UiDialogDescription :id="descriptionId">
            Możesz przypisać kursantów (aktywnych w OSK) albo pominąć wybór —
            wydarzenie zostanie utworzone bez uczestników. Liczba wybranych nie
            może przekroczyć limitu miejsc — backend waliduje konflikty i
            pojemność.
        </UiDialogDescription>
    </UiDialogHeader>
</template>
