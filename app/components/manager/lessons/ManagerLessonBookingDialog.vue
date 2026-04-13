<script setup lang="ts">
import type { CourseListItem } from '~/types/course';
import type {
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessonBooking';
import type { StudentListItem } from '~/types/student';
import type { Vehicle } from '~/types/vehicle';
import { formatCourseKindLabel } from '~/types/course';
import {
    formatStudentCourseStatusLabel,
    formatStudentDisplayName,
} from '~/types/student';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/weeklyCalendarDates';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
    schoolCourses: readonly CourseListItem[];
}>();

const emit = defineEmits<{
    booked: [];
}>();

const open = defineModel<boolean>('open', { required: true });

const { addToast } = useAppToast();

const {
    loadModalData,
    loadStudentCoursesWithKind,
    createLesson,
    isLoadingModalData,
    isCreating,
    modalError: loadModalError,
} = useLessonBookingApi();

const students = ref<StudentListItem[]>([]);
const vehicles = ref<Vehicle[]>([]);
const studentCourses = ref<StudentCourseWithKind[]>([]);

const selectedInstructorId = ref('');
const selectedStudentUserId = ref('');
const selectedCourseId = ref('');
const selectedVehicleId = ref('');
const formError = ref<string | null>(null);
const loadCoursesError = ref<string | null>(null);

const DESCRIPTION_ID = 'lesson-booking-dialog-desc';

const resolvedInstructor = computed(
    (): LessonBookingInstructorOption | null => {
        const ctx = props.slotCtx;
        const id = selectedInstructorId.value.trim();

        if (!ctx || !id) {
            return null;
        }

        return ctx.availableInstructors.find((i) => i.id === id) ?? null;
    },
);

const instructorLabel = computed(() => {
    const ins = resolvedInstructor.value;

    if (!ins) {
        return '—';
    }

    return `${ins.firstName} ${ins.lastName}`.trim();
});

const slotWhenLabel = computed(() => {
    const s = props.slotCtx;

    if (!s) {
        return '';
    }

    const d = new Date(`${s.date}T12:00:00`);

    if (Number.isNaN(d.getTime())) {
        return `${s.date}, ${s.startTime}–${s.endTime}`;
    }

    const dateStr = d.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${dateStr}, ${s.startTime}–${s.endTime}`;
});

/** Rezerwacja slotu 1:1 — tylko kursy pod jazdę (teoria jest grupowa). */
const filteredCourses = computed((): StudentCourseWithKind[] => {
    return studentCourses.value.filter((c) => {
        if (c.kind === null) {
            return true;
        }

        return c.kind === 'PRACTICAL' || c.kind === 'EXTRA';
    });
});

let loadSeq = 0;

watch(
    [open, () => props.slotCtx],
    async ([isOpen, ctx]) => {
        if (!isOpen || !ctx) {
            return;
        }

        const seq = ++loadSeq;

        students.value = [];
        vehicles.value = [];
        studentCourses.value = [];
        selectedInstructorId.value =
            ctx.availableInstructors.length === 1
                ? (ctx.availableInstructors[0]?.id ?? '')
                : '';
        selectedStudentUserId.value = '';
        selectedCourseId.value = '';
        selectedVehicleId.value = '';
        formError.value = null;
        loadCoursesError.value = null;

        try {
            const data = await loadModalData(ctx);

            if (seq !== loadSeq) {
                return;
            }

            students.value = data.students;
            vehicles.value = data.vehicles;
        } catch {
            /* komunikat w isLoadingModalData / błąd ogólny */
        }
    },
    { flush: 'post' },
);

watch(selectedStudentUserId, async (userId) => {
    selectedCourseId.value = '';
    studentCourses.value = [];
    loadCoursesError.value = null;

    const sid = props.slotCtx?.schoolId.trim();
    const uid = userId.trim();

    if (!uid || !sid) {
        return;
    }

    try {
        studentCourses.value = await loadStudentCoursesWithKind(
            uid,
            sid,
            props.schoolCourses,
        );
    } catch (err: unknown) {
        loadCoursesError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać kursów kursanta.',
        );
    }
});

function readFetchStatusCode(err: unknown): number | undefined {
    if (err !== null && typeof err === 'object' && 'statusCode' in err) {
        const c = (err as { statusCode: unknown }).statusCode;

        if (typeof c === 'number') {
            return c;
        }
    }

    return undefined;
}

function handleClose(): void {
    open.value = false;
}

async function handleSubmit(): Promise<void> {
    formError.value = null;

    const ctx = props.slotCtx;

    if (!ctx) {
        formError.value = 'Brak kontekstu slotu.';

        return;
    }

    const studentUserId = selectedStudentUserId.value.trim();
    const courseId = selectedCourseId.value.trim();

    if (!studentUserId) {
        formError.value = 'Wybierz kursanta.';

        return;
    }

    if (!courseId) {
        formError.value = 'Wybierz kurs.';

        return;
    }

    const instructorId = selectedInstructorId.value.trim();

    if (!instructorId) {
        formError.value = 'Wybierz instruktora.';

        return;
    }

    const vehicleId = selectedVehicleId.value.trim();

    if (!vehicleId) {
        formError.value = 'Wybierz pojazd dla jazdy praktycznej.';

        return;
    }

    const startIso = buildSlotIsoUTC(ctx.date, ctx.startTime);
    const endIso = buildSlotIsoUTC(ctx.date, ctx.endTime);

    const body = {
        courseId,
        studentId: studentUserId,
        instructorId,
        startTime: startIso,
        endTime: endIso,
        lessonType: 'PRACTICE' as const,
        vehicleId,
    };

    try {
        await createLesson(body);

        addToast({
            title: 'Rezerwacja utworzona',
            description: 'Lekcja została zapisana w systemie.',
            variant: 'success',
        });

        emit('booked');
        open.value = false;
    } catch (err: unknown) {
        const code = readFetchStatusCode(err);

        if (code === 409) {
            formError.value =
                'Slot lub pojazd został już zajęty. Odśwież kalendarz i spróbuj ponownie.';
        } else {
            formError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się utworzyć rezerwacji.',
            );
        }
    }
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isCreating"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Rezerwuj lekcję</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Utworzenie jazdy praktycznej przez
                    <span class="font-mono">POST /api/lessons</span>. Wybierz
                    kursanta, kurs praktyczny lub dodatkowy oraz pojazd. Lekcji
                    teoretycznych nie planuje się w tym oknie — są grupowe.
                </UiDialogDescription>
            </UiDialogHeader>

            <div
                v-if="slotCtx"
                class="bg-muted/40 space-y-1 rounded-lg border px-3 py-2 text-sm"
                role="status"
            >
                <p v-if="slotCtx.availableInstructors.length === 1">
                    <span class="text-muted-foreground">Instruktor:</span>
                    {{ instructorLabel }}
                </p>
                <p v-else>
                    <span class="text-muted-foreground"
                        >Dostępnych instruktorów w tym oknie:</span
                    >
                    {{ slotCtx.availableInstructors.length }}
                </p>
                <p>
                    <span class="text-muted-foreground">Termin:</span>
                    {{ slotWhenLabel }}
                </p>
            </div>

            <div
                v-if="isLoadingModalData"
                class="space-y-2"
                role="status"
                aria-live="polite"
            >
                <UiSkeleton class="h-9 w-full" />
                <UiSkeleton class="h-9 w-full" />
                <UiSkeleton class="h-9 w-full" />
            </div>

            <p
                v-else-if="loadModalError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ loadModalError }}
            </p>

            <form
                v-else-if="slotCtx"
                class="space-y-4"
                aria-label="Formularz rezerwacji lekcji"
                :aria-busy="isCreating"
                @submit.prevent="handleSubmit"
            >
                <div
                    v-if="slotCtx.availableInstructors.length > 1"
                    class="space-y-2"
                >
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-instructor"
                    >
                        Instruktor
                    </label>
                    <UiSelect
                        v-model="selectedInstructorId"
                        :disabled="isCreating"
                    >
                        <UiSelectTrigger
                            id="lesson-booking-instructor"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue
                                placeholder="— Wybierz instruktora —"
                            />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="ins in slotCtx.availableInstructors"
                                    :key="ins.id"
                                    :value="ins.id"
                                >
                                    {{ ins.firstName }} {{ ins.lastName }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>

                <p
                    class="border-primary/30 bg-primary/5 text-primary rounded-md border px-3 py-2 text-xs"
                    role="note"
                >
                    Ta rezerwacja dotyczy wyłącznie jazdy praktycznej — lekcja
                    zostanie zaliczona do kursu praktycznego lub dodatkowego
                    kursanta.
                </p>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-student"
                    >
                        Kursant
                    </label>
                    <UiSelect
                        v-model="selectedStudentUserId"
                        :disabled="isCreating"
                    >
                        <UiSelectTrigger
                            id="lesson-booking-student"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue placeholder="— Wybierz kursanta —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="s in students"
                                    :key="s.userId"
                                    :value="s.userId"
                                >
                                    {{ formatStudentDisplayName(s) }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>

                <p
                    v-if="loadCoursesError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ loadCoursesError }}
                </p>

                <div v-if="selectedStudentUserId" class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-course"
                    >
                        Kurs
                    </label>
                    <UiSelect
                        v-model="selectedCourseId"
                        :disabled="isCreating || filteredCourses.length === 0"
                    >
                        <UiSelectTrigger
                            id="lesson-booking-course"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue placeholder="— Wybierz kurs —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="c in filteredCourses"
                                    :key="c.id"
                                    :value="c.id"
                                    :disabled="c.status === 'FINISHED'"
                                    :title="
                                        c.status === 'FINISHED'
                                            ? 'Kurs zakończony — wybierz inny lub odznacz'
                                            : undefined
                                    "
                                >
                                    {{ c.name }} ({{ c.category }})
                                    <template v-if="c.kind">
                                        — {{ formatCourseKindLabel(c.kind) }}
                                    </template>
                                    —
                                    {{
                                        formatStudentCourseStatusLabel(c.status)
                                    }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <p
                        v-if="
                            selectedStudentUserId &&
                            filteredCourses.length === 0 &&
                            !loadCoursesError
                        "
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Brak kursów praktycznych lub dodatkowych dla tego
                        kursanta.
                    </p>
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-vehicle"
                    >
                        Pojazd (wolny w tym terminie)
                    </label>
                    <UiSelect
                        v-model="selectedVehicleId"
                        :disabled="isCreating || vehicles.length === 0"
                    >
                        <UiSelectTrigger
                            id="lesson-booking-vehicle"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue placeholder="— Wybierz pojazd —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="v in vehicles"
                                    :key="v.id"
                                    :value="v.id"
                                >
                                    {{ v.name }} ({{ v.registrationNumber }})
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <p
                        v-if="vehicles.length === 0"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Brak wolnych pojazdów w tym oknie — wybierz inny slot
                        lub sprawdź flotę OSK.
                    </p>
                </div>

                <p
                    v-if="formError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ formError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isCreating"
                        @click="handleClose"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton type="submit" :disabled="isCreating">
                        {{ isCreating ? 'Zapisywanie…' : 'Zarezerwuj lekcję' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
