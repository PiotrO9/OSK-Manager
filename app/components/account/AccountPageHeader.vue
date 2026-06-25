<script setup lang="ts">
import { Pencil, Save, X } from 'lucide-vue-next';

defineProps<{
    canEditInlineProfile: boolean;
    inlineProfileEditing: boolean;
    isInlineProfileSaving: boolean;
}>();

defineEmits<{
    cancelEdit: [];
    save: [];
    startEdit: [];
}>();
</script>

<template>
    <div
        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
    >
        <div>
            <h1
                class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
            >
                Konto uĹĽytkownika
            </h1>
            <p
                class="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed"
            >
                Dane profilu, rola i ustawienia konta w jednym miejscu.
            </p>
        </div>

        <div v-if="canEditInlineProfile" class="flex flex-wrap gap-2">
            <UiButton
                v-if="!inlineProfileEditing"
                type="button"
                variant="outline"
                class="gap-2"
                :disabled="isInlineProfileSaving"
                aria-label="WĹ‚Ä…cz edycjÄ™ profilu"
                @click="$emit('startEdit')"
            >
                <Pencil class="size-4" aria-hidden="true" />
                Edytuj profil
            </UiButton>
            <UiButton
                v-if="inlineProfileEditing"
                type="button"
                variant="outline"
                class="gap-2"
                :disabled="isInlineProfileSaving"
                aria-label="Anuluj edycjÄ™ profilu"
                @click="$emit('cancelEdit')"
            >
                <X class="size-4" aria-hidden="true" />
                Anuluj
            </UiButton>
            <UiButton
                v-if="inlineProfileEditing"
                type="button"
                class="gap-2"
                :disabled="isInlineProfileSaving"
                :aria-busy="isInlineProfileSaving"
                aria-label="Zapisz profil"
                @click="$emit('save')"
            >
                <Save class="size-4" aria-hidden="true" />
                {{ isInlineProfileSaving ? 'Zapisywanie...' : 'Zapisz' }}
            </UiButton>
        </div>
    </div>
</template>
