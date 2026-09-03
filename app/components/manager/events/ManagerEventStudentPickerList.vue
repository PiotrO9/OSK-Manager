<script setup lang="ts">
import type { StudentListItem } from '~/types/students/student';
import { formatStudentDisplayName } from '~/types/students/student';
import { isEventStudentPickerRowSelectionBlocked } from '~/utils/events/eventStudentPickerStudents';

const props = defineProps<{
    students: StudentListItem[];
    selectedStudentUserIds: string[];
    isLoading: boolean;
    isAssigning: boolean;
    isCapacityReached: boolean;
    capacityNumber: number | null;
    loadError: string | null;
}>();

const emit = defineEmits<{
    toggleStudent: [userId: string];
}>();

function isStudentSelected(userId: string): boolean {
    return props.selectedStudentUserIds.includes(userId);
}

function isRowSelectionBlocked(userId: string): boolean {
    return isEventStudentPickerRowSelectionBlocked({
        userId,
        selectedUserIds: props.selectedStudentUserIds,
        isCapacityReached: props.isCapacityReached,
    });
}
</script>

<template>
    <div v-if="isLoading" class="space-y-2" role="status" aria-live="polite">
        <UiSkeleton class="h-9 w-full" />
        <UiSkeleton class="h-9 w-full" />
        <UiSkeleton class="h-9 w-full" />
    </div>

    <p v-else-if="loadError" class="text-destructive text-sm" role="alert">
        {{ loadError }}
    </p>

    <template v-else>
        <ul
            class="border-input max-h-64 overflow-y-auto rounded-md border p-2"
            role="listbox"
            aria-label="Lista kursantów do wyboru"
            aria-multiselectable="true"
        >
            <li
                v-for="student in students"
                :key="student.userId"
                class="hover:bg-muted/50 flex items-start gap-2 rounded-sm px-2 py-1.5"
                role="option"
                :aria-selected="isStudentSelected(student.userId)"
                :aria-disabled="isRowSelectionBlocked(student.userId)"
            >
                <input
                    :id="`event-student-cb-${student.userId}`"
                    type="checkbox"
                    class="accent-primary mt-0.5 size-4 shrink-0"
                    :checked="isStudentSelected(student.userId)"
                    :disabled="
                        isAssigning || isRowSelectionBlocked(student.userId)
                    "
                    :aria-label="`Wybierz kursanta ${formatStudentDisplayName(student)}`"
                    @change="emit('toggleStudent', student.userId)"
                />
                <label
                    class="min-w-0 flex-1 cursor-pointer text-sm leading-snug"
                    :for="`event-student-cb-${student.userId}`"
                >
                    <span class="font-medium">{{
                        formatStudentDisplayName(student)
                    }}</span>
                    <span class="text-muted-foreground block truncate text-xs">
                        {{ student.email }}
                    </span>
                </label>
            </li>
        </ul>

        <p
            v-if="students.length === 0"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak aktywnych kursantów pasujących do wyszukiwania.
        </p>

        <p
            v-if="
                isCapacityReached &&
                capacityNumber !== null &&
                capacityNumber > 0
            "
            class="text-muted-foreground text-xs"
            role="status"
        >
            Limit miejsc osiągnięty — odznacz kursanta, aby wybrać innego.
        </p>
    </template>
</template>
