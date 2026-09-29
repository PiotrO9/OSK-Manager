<script setup lang="ts">
import { Pencil } from 'lucide-vue-next';

defineProps<{
    canEditInlineProfile: boolean;
    inlineProfileEditing: boolean;
    isInlineProfileSaving: boolean;
}>();

defineEmits<{
    startEdit: [];
}>();
</script>

<template>
    <PageHeader
        title="Konto użytkownika"
        description="Dane profilu, kontakt i ustawienia konta."
    >
        <template #actions>
            <StatusBadge
                v-if="inlineProfileEditing"
                label="Tryb edycji"
                tone="info"
                subtle
            />
            <UiButton
                v-else-if="canEditInlineProfile"
                type="button"
                variant="outline"
                :disabled="isInlineProfileSaving"
                @click="$emit('startEdit')"
            >
                <Pencil class="size-4" aria-hidden="true" />
                Edytuj profil
            </UiButton>
        </template>
    </PageHeader>
</template>
