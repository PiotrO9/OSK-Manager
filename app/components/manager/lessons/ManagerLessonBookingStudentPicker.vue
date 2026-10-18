<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import type { LessonBookingEligibleStudent } from '~/types/lessons/lessonBooking';

const props = defineProps<{
    students: readonly LessonBookingEligibleStudent[];
    disabled: boolean;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
}>();

const emit = defineEmits<{ loadMore: [] }>();
const search = defineModel<string>('search', { required: true });
const selectedStudentUserId = defineModel<string>('selectedStudentUserId', {
    required: true,
});

const listOpen = ref(false);
const activeIndex = ref(-1);
const pointerInsideResults = ref<boolean>(false);
const pickerElement = useTemplateRef<HTMLElement>('pickerElement');
const listId = 'lesson-booking-student-results';
const selectedStudent = computed(() =>
    props.students.find(
        (student) => student.userId === selectedStudentUserId.value,
    ),
);
const activeOptionId = computed(() =>
    listOpen.value && activeIndex.value >= 0
        ? `${listId}-${activeIndex.value}`
        : undefined,
);

watch([search, () => props.students], () => {
    activeIndex.value = -1;
});
onClickOutside(pickerElement, () => {
    listOpen.value = false;
});

function moveActive(direction: 1 | -1): void {
    if (!listOpen.value) {
        listOpen.value = true;
    }

    if (!props.students.length) return;

    activeIndex.value =
        (activeIndex.value + direction + props.students.length) %
        props.students.length;
    document.getElementById(activeOptionId.value ?? '')?.scrollIntoView({
        block: 'nearest',
    });
}

function selectStudent(student: LessonBookingEligibleStudent): void {
    selectedStudentUserId.value = student.userId;
    listOpen.value = false;
    activeIndex.value = -1;
}

function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && listOpen.value) {
        event.preventDefault();

        const student = props.students[activeIndex.value];

        if (student) selectStudent(student);
    } else if (event.key === 'Escape' && listOpen.value) {
        event.preventDefault();
        listOpen.value = false;
    }
}

function handleFocusOut(event: FocusEvent): void {
    if (pointerInsideResults.value) return;

    if (
        event.relatedTarget instanceof Node &&
        pickerElement.value?.contains(event.relatedTarget)
    ) {
        return;
    }

    listOpen.value = false;
}
</script>

<template>
    <div ref="pickerElement" class="space-y-2" @focusout="handleFocusOut">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-student-search"
        >
            Kursant
        </label>
        <UiInput
            id="lesson-booking-student-search"
            v-model="search"
            type="search"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="listOpen"
            :aria-controls="listOpen && students.length ? listId : undefined"
            :aria-activedescendant="activeOptionId"
            aria-required="true"
            placeholder="Szukaj po imieniu, nazwisku lub e-mailu"
            :disabled="disabled"
            @focus="listOpen = true"
            @input="listOpen = true"
            @keydown="handleKeydown"
        />

        <div
            v-if="listOpen"
            class="border-border bg-popover text-popover-foreground rounded-md border shadow-md"
            @pointerdown="pointerInsideResults = true"
            @pointerup="pointerInsideResults = false"
            @pointercancel="pointerInsideResults = false"
        >
            <ul
                v-if="students.length"
                :id="listId"
                role="listbox"
                aria-label="Wyniki wyszukiwania kursantów"
                class="max-h-56 overflow-y-auto p-1"
            >
                <li
                    v-for="(student, index) in students"
                    :id="`${listId}-${index}`"
                    :key="student.userId"
                    role="option"
                    :aria-selected="selectedStudentUserId === student.userId"
                    :class="[
                        'cursor-pointer rounded-sm px-3 py-2 text-sm',
                        index === activeIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground',
                    ]"
                    @click="selectStudent(student)"
                    @pointerenter="activeIndex = index"
                >
                    <span class="block font-medium">
                        {{ `${student.firstName} ${student.lastName}`.trim() }}
                    </span>
                    <span class="text-muted-foreground block truncate text-xs">
                        {{ student.email }}
                    </span>
                </li>
            </ul>
            <p
                v-if="error"
                class="text-destructive px-3 py-2 text-xs"
                role="alert"
            >
                {{ error }}
            </p>
            <p
                v-else-if="isLoading"
                class="text-muted-foreground px-3 py-2 text-xs"
                role="status"
            >
                Wczytywanie kursantów…
            </p>
            <p
                v-else-if="!students.length"
                class="text-muted-foreground px-3 py-2 text-xs"
                role="status"
            >
                {{
                    search.trim()
                        ? 'Nie znaleziono pasujących kursantów.'
                        : 'Brak kursantów z kursami, które może prowadzić dostępny instruktor.'
                }}
            </p>
            <div v-if="hasMore" class="border-border border-t p-1">
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="w-full"
                    :disabled="disabled || isLoading"
                    @click="emit('loadMore')"
                >
                    Pokaż kolejnych kursantów
                </UiButton>
            </div>
        </div>

        <p
            v-if="selectedStudent"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Wybrano: {{ selectedStudent.firstName }}
            {{ selectedStudent.lastName }} ({{ selectedStudent.email }})
        </p>
    </div>
</template>
