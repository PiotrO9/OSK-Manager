<script setup lang="ts">
import type { AssignStudentsToEventResponse } from '~/types/events/event';
import type { StudentListItem } from '~/types/students/student';
import { getEventStudentPickerCapacitySummary } from '~/utils/events/eventStudentPickerCapacity';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    filterEventStudentPickerStudents,
    getEventStudentPickerExcludedUserIds,
    getEventStudentPickerStudentsFetchLimit,
    isEventStudentPickerRowSelectionBlocked,
} from '~/utils/events/eventStudentPickerStudents';
import {
    getAssignStudentsToEventSuccessDescription,
    getEventStudentPickerPrimarySubmitLabel,
    isEventStudentPickerSubmitDisabled,
} from '~/utils/events/eventStudentPickerSubmit';

const props = defineProps<{
    eventId: string;
    /** null = brak limitu (MVP backend). */
    capacity: number | null;
    schoolId: string;
    /** Kursanci już przypisani — ukryci na liście (tryb dopisywania). */
    excludeStudentUserIds?: string[];
}>();

const emit = defineEmits<{
    assigned: [result: AssignStudentsToEventResponse];
}>();

const open = defineModel<boolean>('open', { required: true });

const { addToast } = useAppToast();
const { fetchList, isListLoading } = useStudentsApi();
const { assignStudentsToEvent, isAssigning } = useEventApi();

const DESCRIPTION_ID = 'event-student-picker-desc';

const students = ref<StudentListItem[]>([]);
const searchQuery = ref('');
const selectedStudentUserIds = ref<string[]>([]);
const loadError = ref<string | null>(null);
const submitError = ref<string | null>(null);

let loadSeq = 0;

const selectedCount = computed(() => selectedStudentUserIds.value.length);

const capacitySummary = computed(() =>
    getEventStudentPickerCapacitySummary({
        capacity: props.capacity,
        selectedCount: selectedCount.value,
    }),
);

const capacityNumber = computed(() => capacitySummary.value.capacityNumber);

const isCapacityReached = computed(() => {
    return capacitySummary.value.isCapacityReached;
});

const remainingSlots = computed(() => {
    return capacitySummary.value.remainingSlots;
});

const capacityBadgeVariant = computed(() => {
    return capacitySummary.value.badgeVariant;
});

const capacityBadgeLabel = computed((): string => {
    return capacitySummary.value.badgeLabel;
});

/** GET /students — limit 1–100 (BFF); przy braku limitu wydarzenia = 100. */
const studentsFetchLimit = computed((): number => {
    return getEventStudentPickerStudentsFetchLimit(capacityNumber.value);
});

const excludedUserIdSet = computed((): Set<string> => {
    return getEventStudentPickerExcludedUserIds(props.excludeStudentUserIds);
});

const filteredStudents = computed((): StudentListItem[] => {
    return filterEventStudentPickerStudents({
        students: students.value,
        query: searchQuery.value,
        excludedUserIds: excludedUserIdSet.value,
    });
});

function isRowSelectionBlocked(userId: string): boolean {
    return isEventStudentPickerRowSelectionBlocked({
        userId,
        selectedUserIds: selectedStudentUserIds.value,
        isCapacityReached: isCapacityReached.value,
    });
}

function handleToggleStudent(userId: string): void {
    const uid = userId.trim();

    if (!uid) {
        return;
    }

    const idx = selectedStudentUserIds.value.indexOf(uid);

    if (idx >= 0) {
        selectedStudentUserIds.value = selectedStudentUserIds.value.filter(
            (x) => x !== uid,
        );

        return;
    }

    if (isRowSelectionBlocked(uid)) {
        return;
    }

    selectedStudentUserIds.value = [...selectedStudentUserIds.value, uid];
}

function handleClose(): void {
    open.value = false;
}

watch(
    [open, () => props.schoolId, () => props.capacity],
    async ([isOpen]) => {
        if (!isOpen) {
            return;
        }

        const seq = ++loadSeq;

        students.value = [];
        searchQuery.value = '';
        selectedStudentUserIds.value = [];
        loadError.value = null;
        submitError.value = null;

        const sid = props.schoolId.trim();

        if (!sid) {
            loadError.value = 'Brak identyfikatora szkoły.';

            return;
        }

        try {
            const page = await fetchList({
                schoolId: sid,
                page: 1,
                limit: studentsFetchLimit.value,
            });

            if (seq !== loadSeq) {
                return;
            }

            students.value = page.items;
        } catch (err: unknown) {
            if (seq !== loadSeq) {
                return;
            }

            loadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać listy kursantów.',
            );
        }
    },
    { flush: 'post' },
);

watch(
    () => capacityNumber.value,
    (cap) => {
        if (cap === null) {
            return;
        }

        if (selectedStudentUserIds.value.length <= cap) {
            return;
        }

        selectedStudentUserIds.value = selectedStudentUserIds.value.slice(
            0,
            cap,
        );
    },
);

watch(
    () => props.eventId,
    () => {
        selectedStudentUserIds.value = [];
        submitError.value = null;
    },
);

async function handleSubmit(): Promise<void> {
    submitError.value = null;

    const eid = props.eventId.trim();

    if (!eid) {
        submitError.value = 'Brak identyfikatora wydarzenia.';

        return;
    }

    if (selectedStudentUserIds.value.length === 0) {
        open.value = false;

        return;
    }

    try {
        const result = await assignStudentsToEvent(
            eid,
            selectedStudentUserIds.value,
        );

        addToast({
            title: 'Kursanci przypisani',
            description: getAssignStudentsToEventSuccessDescription(result),
            variant: 'success',
        });

        emit('assigned', result);
        open.value = false;
    } catch (err: unknown) {
        submitError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się przypisać kursantów.',
        );
    }
}

const isSubmitDisabled = computed((): boolean => {
    return isEventStudentPickerSubmitDisabled({
        isAssigning: isAssigning.value,
        capacityNumber: capacityNumber.value,
    });
});

const primarySubmitLabel = computed((): string => {
    return getEventStudentPickerPrimarySubmitLabel({
        isAssigning: isAssigning.value,
        selectedCount: selectedCount.value,
    });
});
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isAssigning"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Przypisz kursantów do wydarzenia</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Możesz przypisać kursantów (aktywnych w OSK) albo pominąć
                    wybór — wydarzenie zostanie utworzone bez uczestników.
                    Liczba wybranych nie może przekroczyć limitu miejsc —
                    backend waliduje konflikty i pojemność.
                </UiDialogDescription>
            </UiDialogHeader>

            <ManagerEventStudentPickerCapacitySummary
                :badge-variant="capacityBadgeVariant"
                :badge-label="capacityBadgeLabel"
                :capacity-number="capacityNumber"
                :remaining-slots="remainingSlots"
            />

            <div v-if="capacityNumber !== 0" class="space-y-3">
                <ManagerEventStudentPickerSearch
                    v-model:query="searchQuery"
                    :disabled="isAssigning"
                />

                <ManagerEventStudentPickerList
                    :students="filteredStudents"
                    :selected-student-user-ids="selectedStudentUserIds"
                    :is-loading="isListLoading"
                    :is-assigning="isAssigning"
                    :is-capacity-reached="isCapacityReached"
                    :capacity-number="capacityNumber"
                    :load-error="loadError"
                    @toggle-student="handleToggleStudent"
                />
            </div>

            <p v-if="submitError" class="text-destructive text-sm" role="alert">
                {{ submitError }}
            </p>

            <UiDialogFooter class="gap-2 sm:gap-2">
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isAssigning"
                    @click="handleClose"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    type="button"
                    :disabled="isSubmitDisabled"
                    @click="handleSubmit"
                >
                    {{ primarySubmitLabel }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
