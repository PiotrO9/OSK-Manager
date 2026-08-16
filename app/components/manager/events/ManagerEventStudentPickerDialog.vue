<script setup lang="ts">
import type { AssignStudentsToEventResponse } from '~/types/events/event';
import type { StudentListItem } from '~/types/students/student';
import { formatStudentDisplayName } from '~/types/students/student';
import { getEventStudentPickerCapacitySummary } from '~/utils/events/eventStudentPickerCapacity';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

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
    const cap = capacityNumber.value;

    if (cap === null) {
        return 100;
    }

    return Math.min(100, Math.max(1, cap));
});

const excludedUserIdSet = computed((): Set<string> => {
    const raw = props.excludeStudentUserIds ?? [];
    const out = new Set<string>();

    for (const id of raw) {
        const t = id.trim();

        if (t) {
            out.add(t);
        }
    }

    return out;
});

const filteredStudents = computed((): StudentListItem[] => {
    const q = searchQuery.value.trim().toLowerCase();
    const ex = excludedUserIdSet.value;

    return students.value.filter((s) => {
        if (ex.has(s.userId.trim())) {
            return false;
        }

        if (!s.isActive) {
            return false;
        }

        if (!q) {
            return true;
        }

        const name = formatStudentDisplayName(s).toLowerCase();
        const email = s.email.toLowerCase();

        return name.includes(q) || email.includes(q);
    });
});

function isStudentSelected(userId: string): boolean {
    return selectedStudentUserIds.value.includes(userId);
}

function isRowSelectionBlocked(userId: string): boolean {
    if (!isCapacityReached.value) {
        return false;
    }

    return !isStudentSelected(userId);
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

        const parts: string[] = [`Dopisano: ${result.assigned}.`];

        if (result.skipped > 0) {
            parts.push(`Pominięto już zapisanych: ${result.skipped}.`);
        }

        addToast({
            title: 'Kursanci przypisani',
            description: parts.join(' '),
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

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

const isSubmitDisabled = computed((): boolean => {
    if (isAssigning.value) {
        return true;
    }

    const cap = capacityNumber.value;

    if (cap === 0) {
        return true;
    }

    return false;
});

const primarySubmitLabel = computed((): string => {
    if (isAssigning.value) {
        return 'Zapisywanie…';
    }

    const n = selectedCount.value;

    if (n === 0) {
        return 'Kontynuuj bez kursantów';
    }

    return `Zapisz (${n}) kursantów`;
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
                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="event-student-picker-search"
                    >
                        Szukaj kursanta
                    </label>
                    <input
                        id="event-student-picker-search"
                        v-model="searchQuery"
                        type="search"
                        autocomplete="off"
                        :disabled="isAssigning"
                        :class="fieldClass"
                        placeholder="Imię, nazwisko lub e-mail…"
                        aria-label="Filtruj listę kursantów"
                    />
                </div>

                <div
                    v-if="isListLoading"
                    class="space-y-2"
                    role="status"
                    aria-live="polite"
                >
                    <UiSkeleton class="h-9 w-full" />
                    <UiSkeleton class="h-9 w-full" />
                    <UiSkeleton class="h-9 w-full" />
                </div>

                <p
                    v-else-if="loadError"
                    class="text-destructive text-sm"
                    role="alert"
                >
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
                            v-for="student in filteredStudents"
                            :key="student.userId"
                            class="hover:bg-muted/50 flex items-start gap-2 rounded-sm px-2 py-1.5"
                            role="option"
                            :aria-selected="isStudentSelected(student.userId)"
                            :aria-disabled="
                                isRowSelectionBlocked(student.userId)
                            "
                        >
                            <input
                                :id="`event-student-cb-${student.userId}`"
                                type="checkbox"
                                class="accent-primary mt-0.5 size-4 shrink-0"
                                :checked="isStudentSelected(student.userId)"
                                :disabled="
                                    isAssigning ||
                                    isRowSelectionBlocked(student.userId)
                                "
                                :aria-label="`Wybierz kursanta ${formatStudentDisplayName(student)}`"
                                @change="handleToggleStudent(student.userId)"
                            />
                            <label
                                class="min-w-0 flex-1 cursor-pointer text-sm leading-snug"
                                :for="`event-student-cb-${student.userId}`"
                            >
                                <span class="font-medium">{{
                                    formatStudentDisplayName(student)
                                }}</span>
                                <span
                                    class="text-muted-foreground block truncate text-xs"
                                    >{{ student.email }}</span
                                >
                            </label>
                        </li>
                    </ul>

                    <p
                        v-if="
                            !isListLoading &&
                            !loadError &&
                            filteredStudents.length === 0
                        "
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
                        Limit miejsc osiągnięty — odznacz kursanta, aby wybrać
                        innego.
                    </p>
                </template>
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
