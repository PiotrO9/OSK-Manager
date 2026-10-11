<script setup lang="ts">
defineProps<{
    isSaving: boolean;
    isBlocked: boolean;
    isEditing?: boolean;
    cancelTo?: string;
}>();
</script>

<template>
    <div class="border-border bg-muted/20 border-t px-4 py-4 sm:px-6">
        <ActionGroup
            :label="isEditing ? 'Akcje edycji kursu' : 'Akcje tworzenia kursu'"
            align="end"
            class="max-sm:[&>*]:w-full"
        >
            <UiButton as-child variant="outline" class="h-11 sm:h-10">
                <NuxtLink :to="cancelTo ?? '/manager/courses'">
                    Anuluj
                </NuxtLink>
            </UiButton>
            <UiButton
                type="submit"
                class="h-11 sm:h-10"
                :disabled="isSaving || isBlocked"
                :aria-busy="isSaving"
            >
                {{
                    isSaving
                        ? 'Zapisywanie…'
                        : isEditing
                          ? 'Zapisz zmiany'
                          : 'Zapisz'
                }}
            </UiButton>
        </ActionGroup>
    </div>
</template>
