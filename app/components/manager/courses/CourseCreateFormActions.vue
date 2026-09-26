<script setup lang="ts">
defineProps<{
    schoolId: string;
    isSaving: boolean;
    isBlocked: boolean;
}>();
</script>

<template>
    <div class="border-border bg-muted/20 border-t px-4 py-4 sm:px-6">
        <ActionGroup
            label="Akcje tworzenia kursu"
            align="end"
            class="max-sm:[&>*]:w-full"
        >
            <UiButton as-child variant="outline" class="h-11 sm:h-10">
                <NuxtLink
                    :to="{
                        path: '/manager/courses',
                        query: { schoolId },
                    }"
                >
                    Anuluj
                </NuxtLink>
            </UiButton>
            <UiButton
                type="submit"
                class="h-11 sm:h-10"
                :disabled="isSaving || isBlocked"
                :aria-busy="isSaving"
            >
                {{ isSaving ? 'Tworzenie…' : 'Zapisz' }}
            </UiButton>
        </ActionGroup>
    </div>
</template>
