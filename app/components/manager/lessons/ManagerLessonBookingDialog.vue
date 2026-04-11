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

const lessonType = ref<'THEORY' | 'PRACTICE'>('PRACTICE');
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

const filteredCourses = computed((): StudentCourseWithKind[] => {
    const lt = lessonType.value;

    return studentCourses.value.filter((c) => {
        if (c.kind === null) {
            return true;
        }

        if (lt === 'PRACTICE') {
            return c.kind === 'PRACTICAL' || c.kind === 'EXTRA';
        }

        return c.kind === 'THEORY_GROUP';
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

watch(lessonType, () => {
    selectedCourseId.value = '';
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
    const lt = lessonType.value;

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

    if (lt === 'PRACTICE' && !vehicleId) {
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
        lessonType: lt,
        ...(lt === 'PRACTICE' ? { vehicleId } : {}),
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

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
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
                    Utworzenie lekcji przez
                    <span class="font-mono">POST /api/lessons</span>. Wybierz
                    kursanta, kurs i typ lekcji.
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
                    <select
                        id="lesson-booking-instructor"
                        v-model="selectedInstructorId"
                        required
                        :disabled="isCreating"
                        :class="fieldClass"
                        aria-required="true"
                    >
                        <option value="">— Wybierz instruktora —</option>
                        <option
                            v-for="ins in slotCtx.availableInstructors"
                            :key="ins.id"
                            :value="ins.id"
                        >
                            {{ ins.firstName }} {{ ins.lastName }}
                        </option>
                    </select>
                </div>

                <fieldset class="space-y-2">
                    <legend class="text-sm font-medium">Typ lekcji</legend>
                    <div class="flex flex-wrap gap-4">
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                v-model="lessonType"
                                type="radio"
                                name="lessonType"
                                value="THEORY"
                                class="accent-primary size-4"
                                :disabled="isCreating"
                            />
                            <span>Teoria</span>
                        </label>
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                v-model="lessonType"
                                type="radio"
                                name="lessonType"
                                value="PRACTICE"
                                class="accent-primary size-4"
                                :disabled="isCreating"
                            />
                            <span>Jazda praktyczna</span>
                        </label>
                    </div>
                </fieldset>

                <p
                    v-if="lessonType === 'PRACTICE'"
                    class="border-primary/30 bg-primary/5 text-primary rounded-md border px-3 py-2 text-xs"
                    role="note"
                >
                    Lekcja zostanie zaliczona do kursu praktycznego kursanta
                    (wybierz kurs typu praktyka lub dodatkowy).
                </p>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-student"
                    >
                        Kursant
                    </label>
                    <select
                        id="lesson-booking-student"
                        v-model="selectedStudentUserId"
                        required
                        :disabled="isCreating"
                        :class="fieldClass"
                        aria-required="true"
                    >
                        <option value="">— Wybierz kursanta —</option>
                        <option
                            v-for="s in students"
                            :key="s.userId"
                            :value="s.userId"
                        >
                            {{ formatStudentDisplayName(s) }}
                        </option>
                    </select>
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
                    <select
                        id="lesson-booking-course"
                        v-model="selectedCourseId"
                        required
                        :disabled="isCreating || filteredCourses.length === 0"
                        :class="fieldClass"
                        aria-required="true"
                    >
                        <option value="">— Wybierz kurs —</option>
                        <option
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
                            {{ formatStudentCourseStatusLabel(c.status) }}
                        </option>
                    </select>
                    <p
                        v-if="
                            selectedStudentUserId &&
                            filteredCourses.length === 0 &&
                            !loadCoursesError
                        "
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Brak kursów pasujących do wybranego typu lekcji.
                    </p>
                </div>

                <div v-if="lessonType === 'PRACTICE'" class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="lesson-booking-vehicle"
                    >
                        Pojazd (wolny w tym terminie)
                    </label>
                    <select
                        id="lesson-booking-vehicle"
                        v-model="selectedVehicleId"
                        required
                        :disabled="isCreating || vehicles.length === 0"
                        :class="fieldClass"
                        aria-required="true"
                    >
                        <option value="">— Wybierz pojazd —</option>
                        <option v-for="v in vehicles" :key="v.id" :value="v.id">
                            {{ v.name }} ({{ v.registrationNumber }})
                        </option>
                    </select>
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
