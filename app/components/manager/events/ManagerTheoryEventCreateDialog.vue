<script setup lang="ts">
import type { CourseListItem } from '~/types/course';
import type { LessonBookingSlotContext } from '~/types/lessonBooking';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/weeklyCalendarDates';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
    /** Do listy kursów (opcjonalny `courseId` przy POST THEORY). */
    schoolId: string;
}>();

const emit = defineEmits<{
    created: [payload: { eventId: string; capacity: number | null }];
}>();

const open = defineModel<boolean>('open', { required: true });

const { createInstructorEvent, isLoading } = useInstructorEventsApi();
const { fetchList: fetchCoursesList } = useCoursesApi();

const DESCRIPTION_ID = 'theory-event-create-desc';

const selectedInstructorId = ref('');
const theoryCourses = ref<CourseListItem[]>([]);
const isCoursesLoading = ref(false);
const coursesLoadError = ref<string | null>(null);
/** Puste = bez powiązania z kursem (POST bez courseId). */
const selectedCourseId = ref('');
/** `type="number"` + v-model może dać `number` lub `string`. */
const capacityInput = ref<string | number>('');
const formError = ref<string | null>(null);

const slotWhenLabel = computed((): string => {
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

const numberInputClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

watch(
    [open, () => props.slotCtx],
    ([isOpen, ctx]) => {
        if (!isOpen || !ctx) {
            return;
        }

        formError.value = null;
        capacityInput.value = '';
        selectedCourseId.value = '';
        selectedInstructorId.value =
            ctx.availableInstructors.length === 1
                ? (ctx.availableInstructors[0]?.id ?? '')
                : '';
    },
    { flush: 'post' },
);

watch(
    [open, () => props.schoolId.trim()],
    async ([isOpen, sid]) => {
        theoryCourses.value = [];
        coursesLoadError.value = null;

        if (!isOpen || !sid) {
            return;
        }

        isCoursesLoading.value = true;

        try {
            theoryCourses.value = await fetchCoursesList(sid);
        } catch (err: unknown) {
            coursesLoadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać listy kursów.',
            );
        } finally {
            isCoursesLoading.value = false;
        }
    },
    { flush: 'post' },
);

function parseCapacity(raw: unknown): number | null | false {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return null;
        }

        if (raw < 0) {
            return false;
        }

        return Math.trunc(raw);
    }

    const t = String(raw).trim();

    if (t === '') {
        return null;
    }

    const n = Number.parseInt(t, 10);

    if (!Number.isFinite(n) || n < 0) {
        return false;
    }

    return n;
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

    const instructorId = selectedInstructorId.value.trim();

    if (!instructorId) {
        formError.value = 'Wybierz instruktora.';

        return;
    }

    const capParsed = parseCapacity(capacityInput.value);

    if (capParsed === false) {
        formError.value =
            'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).';

        return;
    }

    const startIso = buildSlotIsoUTC(ctx.date, ctx.startTime);
    const endIso = buildSlotIsoUTC(ctx.date, ctx.endTime);

    try {
        const cid = selectedCourseId.value.trim();

        const event = await createInstructorEvent({
            instructorId,
            type: 'THEORY',
            startTime: startIso,
            endTime: endIso,
            capacity: capParsed,
            ...(cid ? { courseId: cid } : {}),
        });

        const cap =
            event.capacity !== undefined && event.capacity !== null
                ? event.capacity
                : capParsed;

        emit('created', { eventId: event.id, capacity: cap });
        open.value = false;
    } catch (err: unknown) {
        formError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się utworzyć bloku teorii.',
        );
    }
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isLoading"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Blok teorii (wiele kursantów)</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Utworzenie wydarzenia
                    <span class="font-mono">POST /api/events</span> (typ THEORY)
                    z limitem miejsc. Opcjonalnie powiąż z kursem — backend może
                    dopisać uczestników ACTIVE. Następnie przypisanie kursantów.
                </UiDialogDescription>
            </UiDialogHeader>

            <div
                v-if="slotCtx"
                class="bg-muted/40 space-y-1 rounded-lg border px-3 py-2 text-sm"
                role="status"
            >
                <p>
                    <span class="text-muted-foreground">Termin:</span>
                    {{ slotWhenLabel }}
                </p>
            </div>

            <form
                v-if="slotCtx"
                class="space-y-4"
                aria-label="Formularz bloku teorii"
                :aria-busy="isLoading"
                @submit.prevent="handleSubmit"
            >
                <div
                    v-if="slotCtx.availableInstructors.length > 1"
                    class="space-y-2"
                >
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-instructor"
                    >
                        Instruktor
                    </label>
                    <UiSelect
                        v-model="selectedInstructorId"
                        :disabled="isLoading"
                    >
                        <UiSelectTrigger
                            id="theory-event-instructor"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue
                                placeholder="— Wybierz instruktora —"
                            />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem value="">
                                    — Wybierz instruktora —
                                </UiSelectItem>
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

                <div v-if="schoolId.trim()" class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-course"
                    >
                        Kurs (opcjonalnie)
                    </label>
                    <p
                        v-if="isCoursesLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Wczytywanie kursów…
                    </p>
                    <p
                        v-else-if="coursesLoadError"
                        class="text-destructive text-xs"
                        role="alert"
                    >
                        {{ coursesLoadError }}
                    </p>
                    <UiSelect
                        v-model="selectedCourseId"
                        :disabled="isLoading || isCoursesLoading"
                    >
                        <UiSelectTrigger
                            id="theory-event-course"
                            class="w-full"
                            aria-label="Powiązanie bloku z kursem"
                        >
                            <UiSelectValue
                                placeholder="— Bez powiązania z kursem —"
                            />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem value="">
                                    — Bez powiązania z kursem —
                                </UiSelectItem>
                                <UiSelectItem
                                    v-for="c in theoryCourses"
                                    :key="c.id"
                                    :value="c.id"
                                >
                                    {{ c.name }} ({{ c.category }})
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <p class="text-muted-foreground text-xs">
                        Przy wyborze kursu backend może dopisać aktywnych
                        uczestników (wg limitu miejsc).
                    </p>
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-capacity"
                    >
                        Limit miejsc (opcjonalnie)
                    </label>
                    <input
                        id="theory-event-capacity"
                        v-model="capacityInput"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        :disabled="isLoading"
                        :class="numberInputClass"
                        placeholder="Puste = bez limitu"
                        aria-describedby="theory-event-capacity-hint"
                    />
                    <p
                        id="theory-event-capacity-hint"
                        class="text-muted-foreground text-xs"
                    >
                        Puste pole = brak limitu w MVP. Wpisz np. 20, aby
                        ograniczyć liczbę zapisów w UI i na backendzie.
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
                        :disabled="isLoading"
                        @click="handleClose"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton type="submit" :disabled="isLoading">
                        {{
                            isLoading
                                ? 'Tworzenie…'
                                : 'Utwórz blok i przypisz kursantów'
                        }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
