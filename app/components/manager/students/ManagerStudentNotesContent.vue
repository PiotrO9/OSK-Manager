<script setup lang="ts">
withDefaults(
    defineProps<{
        notes: string | null;
        schoolId: string;
        isEditing?: boolean;
        draftNotes?: string;
        isSaving?: boolean;
        saveError?: string | null;
    }>(),
    { isEditing: false, draftNotes: '', isSaving: false, saveError: null },
);
const emit = defineEmits<{
    'update:draftNotes': [value: string];
    edit: [];
    save: [];
    cancel: [];
}>();
const NOTES_MAX_LEN = 5000;
const sectionHeadingId = useId();
</script>

<template>
    <section
        class="border-border bg-card rounded-lg border shadow-xs"
        :aria-labelledby="sectionHeadingId"
        :data-context-school-id="schoolId.trim() || undefined"
    >
        <div
            class="border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4"
        >
            <div class="min-w-0">
                <h2
                    :id="sectionHeadingId"
                    class="text-foreground text-base font-semibold"
                >
                    Notatka o kursancie
                </h2>
                <p class="text-muted-foreground mt-1 text-sm">
                    Wewnętrzny kontekst dla obsługi kursanta.
                </p>
            </div>
            <UiButton
                v-if="!isEditing"
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0 rounded-lg"
                aria-label="Edytuj notatkę o kursancie"
                @click="emit('edit')"
            >
                Edytuj
            </UiButton>
        </div>

        <div class="p-5">
            <template v-if="!isEditing">
                <p
                    class="text-foreground min-h-16 text-sm whitespace-pre-wrap"
                    :class="{
                        'text-muted-foreground': !notes?.trim(),
                    }"
                >
                    {{ notes?.trim() || 'Brak notatki.' }}
                </p>
            </template>

            <template v-else>
                <div class="space-y-3">
                    <UiTextarea
                        :model-value="draftNotes"
                        :maxlength="NOTES_MAX_LEN"
                        rows="6"
                        class="min-h-32"
                        aria-label="Treść notatki o kursancie"
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:draftNotes', String($event))
                        "
                        @keydown.esc.prevent="emit('cancel')"
                    />
                    <p class="text-muted-foreground text-xs" aria-live="polite">
                        {{ draftNotes.length }} / {{ NOTES_MAX_LEN }} znaków
                    </p>
                    <p
                        v-if="saveError"
                        class="text-destructive text-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        {{ saveError }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                        <UiButton
                            type="button"
                            :disabled="isSaving"
                            aria-label="Zapisz notatkę"
                            @click="emit('save')"
                        >
                            {{ isSaving ? 'Zapisywanie…' : 'Zapisz' }}
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            :disabled="isSaving"
                            aria-label="Anuluj edycję notatki"
                            @click="emit('cancel')"
                        >
                            Anuluj
                        </UiButton>
                    </div>
                </div>
            </template>
        </div>
    </section>
</template>
