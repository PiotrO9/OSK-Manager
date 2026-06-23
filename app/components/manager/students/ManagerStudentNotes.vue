<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:notes': [value: string | null];
}>();

const NOTES_MAX_LEN = 5000;

interface Props {
    userId: string;
    schoolId: string;
    initialNotes: string | null;
}

const { addToast } = useAppToast();

const isEditing = ref(false);
const draftNotes = ref('');
const isSaving = ref(false);
const saveError = ref<string | null>(null);

const sectionHeadingId = 'student-notes-heading';

function readNotesFromPatchData(data: unknown): string | null | undefined {
    if (data === null || typeof data !== 'object') {
        return undefined;
    }

    const o = data as Record<string, unknown>;

    if (!('notes' in o)) {
        return undefined;
    }

    const v = o.notes;

    if (v === null || v === undefined) {
        return null;
    }

    const s = String(v).trim();

    return s.length > 0 ? s : null;
}

function getDisplayNotes(): string {
    const n = props.initialNotes;

    if (n === null || n === undefined) {
        return '';
    }

    return String(n);
}

function getReadModeLabel(): string {
    const t = getDisplayNotes().trim();

    if (t.length === 0) {
        return 'Brak notatki.';
    }

    return t;
}

function handleStartEdit() {
    saveError.value = null;
    draftNotes.value = getDisplayNotes();
    isEditing.value = true;
}

function handleCancelEdit() {
    saveError.value = null;
    isEditing.value = false;
    draftNotes.value = '';
}

async function handleSaveNotes() {
    const uid = props.userId.trim();

    if (!uid) {
        saveError.value = 'Brak identyfikatora kursanta.';

        return;
    }

    const t = draftNotes.value.trim();
    const notesPayload = t.length === 0 ? null : t;

    if (notesPayload !== null && notesPayload.length > NOTES_MAX_LEN) {
        saveError.value = `Notatka nie może przekraczać ${NOTES_MAX_LEN} znaków.`;

        return;
    }

    isSaving.value = true;
    saveError.value = null;

    try {
        const url = resolveBffEndpoint(
            `/api/students/${encodeURIComponent(uid)}`,
        );

        const raw = await $fetch<unknown>(url, {
            method: 'PATCH',
            credentials: 'include',
            body: { notes: notesPayload },
        });

        const data = unwrapApiSuccessData<unknown>(raw);
        const saved = readNotesFromPatchData(data);

        if (saved === undefined) {
            throw new Error(
                'Nieprawidłowa odpowiedź serwera po zapisie notatki.',
            );
        }

        emit('update:notes', saved);
        isEditing.value = false;
        draftNotes.value = '';

        addToast({
            title: 'Zapisano notatkę',
            variant: 'success',
        });
    } catch (err: unknown) {
        saveError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się zapisać notatki.',
        );

        addToast({
            title: 'Błąd zapisu notatki',
            description: saveError.value,
            variant: 'error',
            durationMs: 5000,
        });
    } finally {
        isSaving.value = false;
    }
}

function handleDraftKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
        return;
    }

    event.preventDefault();
    handleCancelEdit();
}
</script>

<template>
    <section
        class="border-border border-t pt-6"
        :aria-labelledby="sectionHeadingId"
        :data-context-school-id="schoolId.trim() || undefined"
    >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2
                :id="sectionHeadingId"
                class="text-foreground text-lg font-semibold"
            >
                Notatka o kursancie
            </h2>
            <UiButton
                v-if="!isEditing"
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0"
                aria-label="Edytuj notatkę o kursancie"
                @click="handleStartEdit"
            >
                Edytuj
            </UiButton>
        </div>

        <template v-if="!isEditing">
            <p
                class="text-foreground min-h-16 text-sm whitespace-pre-wrap"
                :class="{
                    'text-muted-foreground':
                        getDisplayNotes().trim().length === 0,
                }"
            >
                {{ getReadModeLabel() }}
            </p>
        </template>

        <template v-else>
            <div class="space-y-3">
                <UiTextarea
                    v-model="draftNotes"
                    :maxlength="NOTES_MAX_LEN"
                    rows="6"
                    class="min-h-32"
                    aria-label="Treść notatki o kursancie"
                    :disabled="isSaving"
                    @keydown="handleDraftKeydown"
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
                        @click="handleSaveNotes"
                    >
                        {{ isSaving ? 'Zapisywanie…' : 'Zapisz' }}
                    </UiButton>
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        aria-label="Anuluj edycję notatki"
                        @click="handleCancelEdit"
                    >
                        Anuluj
                    </UiButton>
                </div>
            </div>
        </template>
    </section>
</template>
