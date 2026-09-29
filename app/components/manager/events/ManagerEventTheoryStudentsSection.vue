<script setup lang="ts">
import type {
    InstructorEvent,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import { formatStudentDisplayName } from '~/types/students/student';
import AppUserIdentity from '~/components/app/AppUserIdentity.vue';
import { theoryEligibleRowToStudentListItem } from '~/utils/events/theoryEventEligibleStudents';

const props = defineProps<{
    loadedEvent: InstructorEvent;
    linkedCourseLabel: string | null;
    theoryCapacitySummary: string | null;
    formCapacityInput: string | number;
    parseCapacity: (value: unknown) => number | null | false;
    studentAttendanceKnown: boolean;
    theoryEligibleNoCourse: boolean;
    isTheoryEligibleLoading: boolean;
    theoryEligibleError: string | null;
    theoryEligibleData: TheoryEventEligibleStudentsData | null;
    theoryStudentsError: string | null;
    isSaving: boolean;
    schoolId: string;
    isTheoryRowChecked: (
        row: ReturnType<typeof theoryEligibleRowToStudentListItem>,
    ) => boolean;
    isTheoryEligibleRowInteractive: (
        row: TheoryEventEligibleStudentRow,
    ) => boolean;
}>();

const emit = defineEmits<{
    toggleStudent: [row: TheoryEventEligibleStudentRow, checked: boolean];
    refreshEligible: [];
}>();

const allEligibleStudentsSelected = computed(() => {
    const rows = props.theoryEligibleData?.students;

    return Boolean(
        rows?.length &&
        rows.every((row) =>
            props.isTheoryRowChecked(theoryEligibleRowToStudentListItem(row)),
        ),
    );
});

function theoryStudentInitials(row: TheoryEventEligibleStudentRow): string {
    const first = row.firstName.trim().charAt(0);
    const last = row.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : 'K';
}
</script>

<template>
    <FormSection
        title="Kursanci (teoria)"
        description="Lista aktywnych uczestników kursu powiązanego z wydarzeniem."
    >
        <div class="space-y-6">
            <p
                v-if="loadedEvent.courseId?.trim()"
                class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                role="status"
            >
                <span class="text-foreground font-medium">Kurs:</span>
                {{ linkedCourseLabel ?? loadedEvent.courseId }}
            </p>

            <p
                v-if="theoryCapacitySummary"
                class="text-muted-foreground text-sm"
                role="status"
            >
                {{ theoryCapacitySummary }}
            </p>

            <p
                v-if="parseCapacity(formCapacityInput) === 0"
                class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                role="status"
            >
                Limit miejsc wynosi 0 — żaden kursant nie może zostać przypisany
                do tego bloku.
            </p>

            <p
                v-if="!studentAttendanceKnown"
                class="text-muted-foreground border-border space-y-2 rounded-md border border-dashed px-3 py-2 text-sm"
                role="status"
            >
                <span class="text-foreground block font-medium">
                    Brak listy zapisanych na ten blok
                </span>
                <span class="block">
                    Nie udało się ustalić aktualnych przypisań (np.
                    <span class="font-mono text-xs">
                        GET …/events/…/students
                    </span>
                    ). Bez tego nie można edytować składu grupy.
                </span>
            </p>

            <div v-else class="space-y-3">
                <p
                    v-if="theoryEligibleNoCourse"
                    class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                    role="status"
                >
                    Ten blok nie ma przypisanego kursu (
                    <code class="text-xs">courseId</code>
                    ) — lista kursantów jest niedostępna.
                </p>
                <p
                    v-else-if="isTheoryEligibleLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie listy kursantów…
                </p>
                <p
                    v-else-if="theoryEligibleError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ theoryEligibleError }}
                </p>
                <template
                    v-else-if="
                        theoryEligibleData &&
                        theoryEligibleData.students.length > 0
                    "
                >
                    <p
                        id="theory-event-students-instruction"
                        class="text-muted-foreground text-sm"
                    >
                        Zaznacz kursanta, aby dodać go do tego wydarzenia.
                        Odznacz, aby go usunąć. Wybór zatwierdź przyciskiem
                        „Zapisz zmiany”.
                    </p>
                    <ul
                        class="space-y-2"
                        role="list"
                        aria-label="Kursanci kursu — zaznacz uczestników wydarzenia"
                    >
                        <li
                            v-for="row in theoryEligibleData.students"
                            :key="row.userId"
                            class="border-input flex flex-col gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div class="flex min-w-0 flex-1 items-center gap-3">
                                <UiCheckbox
                                    :id="`theory-student-${row.userId}`"
                                    :model-value="
                                        isTheoryRowChecked(
                                            theoryEligibleRowToStudentListItem(
                                                row,
                                            ),
                                        )
                                    "
                                    :disabled="
                                        isSaving ||
                                        !schoolId ||
                                        !isTheoryEligibleRowInteractive(row)
                                    "
                                    :aria-label="`Zapis na wydarzenie: ${formatStudentDisplayName(theoryEligibleRowToStudentListItem(row))}`"
                                    aria-describedby="theory-event-students-instruction"
                                    @update:model-value="
                                        emit(
                                            'toggleStudent',
                                            row,
                                            $event === true,
                                        )
                                    "
                                />
                                <UiLabel
                                    :for="`theory-student-${row.userId}`"
                                    class="text-foreground min-w-0 flex-1 cursor-pointer text-sm leading-snug font-normal peer-disabled:cursor-not-allowed"
                                >
                                    <AppUserIdentity
                                        :avatar-src="row.avatarUrl"
                                        :initials="theoryStudentInitials(row)"
                                        :avatar-size="40"
                                    >
                                        <template #details>
                                            <span class="min-w-0">
                                                <span
                                                    class="block font-semibold wrap-anywhere"
                                                >
                                                    {{
                                                        formatStudentDisplayName(
                                                            theoryEligibleRowToStudentListItem(
                                                                row,
                                                            ),
                                                        )
                                                    }}
                                                </span>
                                                <span
                                                    v-if="row.email?.trim()"
                                                    class="text-muted-foreground mt-0.5 block text-sm font-normal wrap-anywhere"
                                                >
                                                    {{ row.email.trim() }}
                                                </span>
                                            </span>
                                        </template>
                                    </AppUserIdentity>
                                </UiLabel>
                            </div>
                            <div
                                class="flex shrink-0 flex-wrap gap-1 sm:justify-end"
                            >
                                <UiBadge
                                    v-if="row.hasScheduleConflict"
                                    variant="destructive"
                                >
                                    Kolizja grafiku
                                </UiBadge>
                                <UiBadge
                                    v-if="
                                        !row.hasScheduleConflict &&
                                        !isTheoryEligibleRowInteractive(row)
                                    "
                                    variant="secondary"
                                >
                                    Brak miejsc
                                </UiBadge>
                            </div>
                        </li>
                    </ul>
                    <div
                        v-if="allEligibleStudentsSelected && schoolId"
                        class="border-border bg-muted/30 rounded-md border px-4 py-3 text-sm"
                    >
                        <p>
                            Wszyscy kursanci z listy są już wybrani. Aby dodać
                            kolejną osobę, przypisz ją najpierw do tego kursu.
                        </p>
                        <NuxtLink
                            :to="{
                                path: '/manager/students',
                                query: { schoolId },
                            }"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-primary mt-2 inline-block font-medium underline underline-offset-2"
                        >
                            Otwórz listę kursantów w nowej karcie
                        </NuxtLink>
                        <p class="text-muted-foreground mt-2">
                            Po przypisaniu kursanta do kursu odśwież listę
                            poniżej.
                        </p>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="mt-3"
                            :disabled="isSaving || isTheoryEligibleLoading"
                            @click="emit('refreshEligible')"
                        >
                            Odśwież listę kursantów
                        </UiButton>
                    </div>
                </template>
                <p v-else class="text-muted-foreground text-sm" role="status">
                    Brak kursantów na kursie lub lista nie została wczytana.
                </p>
            </div>

            <p
                v-if="theoryStudentsError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ theoryStudentsError }}
            </p>
        </div>
    </FormSection>
</template>
