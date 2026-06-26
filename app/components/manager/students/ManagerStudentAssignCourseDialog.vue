<script setup lang="ts">
import type { CourseListItem } from '~/types/courses/course';

interface Props {
    open: boolean;
    studentDisplayName: string;
    courses: readonly CourseListItem[];
    isCoursesLoading: boolean;
    coursesLoadError: string | null;
    isSaving: boolean;
    apiError: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    submit: [courseId: string];
}>();

const DESCRIPTION_ID = 'student-assign-course-dialog-desc';

const selectedCourseId = ref('');

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handlePointerDownOutside(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

function resetWhenOpened() {
    selectedCourseId.value = '';
}

watch(
    () => props.open,
    (open) => {
        if (open) {
            resetWhenOpened();
        }
    },
);

function handleSubmit() {
    const id = selectedCourseId.value.trim();

    if (!id) {
        return;
    }

    emit('submit', id);
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="true"
            :aria-describedby="DESCRIPTION_ID"
            class="sm:max-w-md"
            @pointer-down-outside="handlePointerDownOutside"
        >
            <UiDialogHeader>
                <UiDialogTitle>Przypisz do kursu</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Wybierz kurs w bieżącej szkole jazdy dla kursanta
                    <span class="text-foreground font-medium">
                        „{{ studentDisplayName }}"
                    </span>
                    .
                </UiDialogDescription>
            </UiDialogHeader>

            <div class="space-y-3 py-2">
                <p
                    v-if="apiError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ apiError }}
                </p>

                <p
                    v-if="isCoursesLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie listy kursów…
                </p>
                <p
                    v-else-if="coursesLoadError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ coursesLoadError }}
                </p>
                <template v-else-if="courses.length > 0">
                    <UiLabel for="assign-course-select">Kurs</UiLabel>
                    <UiSelect v-model="selectedCourseId" :disabled="isSaving">
                        <UiSelectTrigger
                            id="assign-course-select"
                            class="w-full"
                            aria-required="true"
                            aria-label="Wybierz kurs do przypisania kursanta"
                        >
                            <UiSelectValue placeholder="— Wybierz kurs —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="c in courses"
                                    :key="c.id"
                                    :value="c.id"
                                >
                                    {{ c.name }} ({{ c.category }})
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </template>
                <p v-else class="text-muted-foreground text-sm" role="status">
                    Brak kursów w tej szkole. Utwórz kurs, aby móc przypisać
                    kursanta.
                </p>
            </div>

            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isSaving"
                    aria-label="Anuluj przypisanie do kursu"
                    @click="handleOpenChange(false)"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    type="button"
                    :disabled="
                        isSaving ||
                        isCoursesLoading ||
                        courses.length === 0 ||
                        selectedCourseId.trim().length === 0
                    "
                    :aria-label="`Przypisz ${studentDisplayName} do wybranego kursu`"
                    @click="handleSubmit"
                >
                    {{ isSaving ? 'Zapisywanie…' : 'Przypisz' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
