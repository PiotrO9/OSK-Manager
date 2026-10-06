<script setup lang="ts">
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

const { updateNotes } = useStudentsApi();

function getDisplayNotes(): string {
    const n = props.initialNotes;

    if (n === null || n === undefined) {
        return '';
    }

    return String(n);
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
        const saved = await updateNotes({
            userId: uid,
            notes: notesPayload,
        });

        emit('update:notes', saved);
        isEditing.value = false;
        draftNotes.value = '';

        addToast({
            title: 'Zapisano notatkę',
            variant: 'success',
        });
    } catch (err: unknown) {
        saveError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się zapisać notatki.';

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
</script>

<template>
    <ManagerStudentNotesContent
        v-model:draft-notes="draftNotes"
        :notes="initialNotes"
        :school-id="schoolId"
        :is-editing="isEditing"
        :is-saving="isSaving"
        :save-error="saveError"
        @edit="handleStartEdit"
        @save="handleSaveNotes"
        @cancel="handleCancelEdit"
    />
</template>
