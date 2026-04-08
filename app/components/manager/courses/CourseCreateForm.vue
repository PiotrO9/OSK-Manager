<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructor';
import type { OfferedCourseType } from '~/types/drivingSchool';
import {
    formatCourseKindLabel,
    type CourseCreatePayload,
    type CourseKind,
} from '~/types/course';
import { formatInstructorDisplayName } from '~/types/instructor';
import { cn } from '@/lib/utils';
import { buttonVariants } from '~/components/shadcn/button';

const props = defineProps<{
    schoolId: string;
    /** Kategorie z oferty OSK (`GET /driving-schools` → `offeredCourseTypes`). */
    offeredCourseTypes: OfferedCourseType[];
    /** Dozwolone rodzaje kursów z ustawień OSK — brak / pusto = pokazuj wszystkie (kompatybilność wsteczna). */
    enabledCourseKinds?: CourseKind[];
    isSchoolContextLoading: boolean;
    instructors: InstructorListItem[];
    isInstructorsLoading: boolean;
    isSaving: boolean;
    apiError: string | null;
}>();

const emit = defineEmits<{
    submit: [payload: CourseCreatePayload];
}>();

const SELECT_FIELD_CLASS =
    'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-lg rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const ALL_KINDS: CourseKind[] = ['THEORY_GROUP', 'PRACTICAL', 'EXTRA'];

const kindOptions = computed(() => {
    const allow = props.enabledCourseKinds;

    if (allow !== undefined && allow.length > 0) {
        const filtered = ALL_KINDS.filter((k) => allow.includes(k));

        if (filtered.length > 0) {
            return filtered;
        }
    }

    return ALL_KINDS;
});

const isFormBlocked = computed(
    () => props.isSchoolContextLoading || kindOptions.value.length === 0,
);

const hasOfferedCategoryList = computed(
    () => props.offeredCourseTypes.length > 0,
);

const showNoOfferedCategoriesHint = computed(
    () =>
        !props.isSchoolContextLoading && props.offeredCourseTypes.length === 0,
);

const showNoEnabledKindsMessage = computed(
    () =>
        !props.isSchoolContextLoading &&
        props.offeredCourseTypes.length > 0 &&
        kindOptions.value.length === 0,
);

const nameModel = ref('');
const categoryModel = ref<string>('');
const kindModel = ref<CourseKind>('THEORY_GROUP');
const totalHoursModel = ref('30');
const capacityModel = ref('');
const theoryStartModel = ref('');
const theoryEndModel = ref('');
const instructorIdModel = ref('');

watch(
    () => props.offeredCourseTypes,
    (types) => {
        if (types.length === 0) {
            return;
        }

        const codes = types.map((t) => t.code);

        if (!codes.includes(categoryModel.value)) {
            categoryModel.value = types[0]!.code;
        }
    },
    { immediate: true },
);

watch(
    kindOptions,
    (opts) => {
        if (opts.length === 0) {
            return;
        }

        if (!opts.includes(kindModel.value)) {
            kindModel.value = opts[0]!;
        }
    },
    { immediate: true },
);

const showNameRequired = ref(false);
const showCategoryRequired = ref(false);
const showKindRequired = ref(false);
const showTotalHoursInvalid = ref(false);
const showTheoryStartRequired = ref(false);
const showTheoryEndRequired = ref(false);
const showTheoryRangeInvalid = ref(false);
const showCapacityInvalid = ref(false);

const isTheoryKind = computed(() => kindModel.value === 'THEORY_GROUP');

watch(kindModel, () => {
    showTheoryStartRequired.value = false;
    showTheoryEndRequired.value = false;
    showTheoryRangeInvalid.value = false;
    showCapacityInvalid.value = false;
});

function numericFieldInputToTrimmedString(
    raw: string | number | null | undefined,
): string {
    if (raw === null || raw === undefined) {
        return '';
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return '';
        }

        return String(Math.trunc(raw));
    }

    return String(raw).trim();
}

function handleSubmit() {
    if (isFormBlocked.value) {
        return;
    }

    const nameOk = nameModel.value.trim().length > 0;
    const catTrim = categoryModel.value.trim();
    const catOk =
        catTrim.length > 0 &&
        (props.offeredCourseTypes.length === 0
            ? true
            : props.offeredCourseTypes.some((t) => t.code === catTrim));
    const kindOk = kindOptions.value.includes(kindModel.value);

    const hoursStr = numericFieldInputToTrimmedString(totalHoursModel.value);
    const hoursParsed =
        hoursStr.length > 0 ? Number.parseInt(hoursStr, 10) : Number.NaN;
    const hoursOk =
        Number.isInteger(hoursParsed) &&
        Number.isFinite(hoursParsed) &&
        hoursParsed >= 1;

    showNameRequired.value = !nameOk;
    showCategoryRequired.value = !catOk;
    showKindRequired.value = !kindOk;
    showTotalHoursInvalid.value = !hoursOk;

    let theoryOk = true;

    if (kindModel.value === 'THEORY_GROUP') {
        const startOk = theoryStartModel.value.trim().length > 0;
        const endOk = theoryEndModel.value.trim().length > 0;

        showTheoryStartRequired.value = !startOk;
        showTheoryEndRequired.value = !endOk;

        const rangeOk =
            startOk &&
            endOk &&
            theoryEndModel.value
                .trim()
                .localeCompare(theoryStartModel.value.trim()) >= 0;

        showTheoryRangeInvalid.value = startOk && endOk && !rangeOk;

        const capStr = numericFieldInputToTrimmedString(capacityModel.value);

        if (capStr.length > 0) {
            const cap = Number.parseInt(capStr, 10);

            showCapacityInvalid.value =
                !Number.isInteger(cap) || !Number.isFinite(cap) || cap < 0;
        } else {
            showCapacityInvalid.value = false;
        }

        theoryOk = startOk && endOk && rangeOk && !showCapacityInvalid.value;
    } else {
        showTheoryStartRequired.value = false;
        showTheoryEndRequired.value = false;
        showTheoryRangeInvalid.value = false;
        showCapacityInvalid.value = false;
    }

    if (!nameOk || !catOk || !kindOk || !hoursOk || !theoryOk) {
        return;
    }

    const payload: CourseCreatePayload = {
        schoolId: props.schoolId,
        name: nameModel.value.trim(),
        category: catTrim,
        kind: kindModel.value,
        totalHours: hoursParsed,
    };

    if (kindModel.value === 'THEORY_GROUP') {
        payload.theoryStartDate = theoryStartModel.value.trim();
        payload.theoryEndDate = theoryEndModel.value.trim();

        const capStr = numericFieldInputToTrimmedString(capacityModel.value);

        if (capStr.length > 0) {
            payload.capacity = Number.parseInt(capStr, 10);
        } else {
            payload.capacity = null;
        }
    }

    const inst = instructorIdModel.value.trim();

    if (inst.length > 0) {
        payload.instructorId = inst;
    }

    emit('submit', payload);
}
</script>

<template>
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <p
            v-if="apiError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ apiError }}
        </p>

        <p
            v-if="isSchoolContextLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie oferty kategorii i ustawień szkoły…
        </p>

        <p
            v-else-if="showNoOfferedCategoriesHint"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak listy kategorii z ustawień OSK w odpowiedzi serwera — wpisz kod
            kategorii ręcznie (np. B). Po skonfigurowaniu oferty w panelu szkoły
            pojawi się lista wyboru.
        </p>

        <p
            v-else-if="showNoEnabledKindsMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            W ustawieniach tej szkoły nie włączono żadnego rodzaju kursu (teoria
            / praktyka / dodatkowy). Uzupełnij pole „włączone rodzaje kursów” w
            konfiguracji OSK.
        </p>

        <div class="space-y-2">
            <UiLabel for="course-create-name">Nazwa kursu</UiLabel>
            <UiInput
                id="course-create-name"
                v-model="nameModel"
                type="text"
                name="name"
                autocomplete="off"
                required
                :aria-invalid="showNameRequired"
                :aria-describedby="
                    showNameRequired ? 'course-create-name-error' : undefined
                "
                :disabled="isSaving || isFormBlocked"
            />
            <p
                v-if="showNameRequired"
                id="course-create-name-error"
                class="text-destructive text-sm"
                role="alert"
            >
                Nazwa jest wymagana.
            </p>
        </div>

        <div class="space-y-2">
            <UiLabel for="course-create-category">{{
                hasOfferedCategoryList
                    ? 'Kategoria (oferta OSK)'
                    : 'Kategoria (kod, np. B)'
            }}</UiLabel>
            <select
                v-if="hasOfferedCategoryList"
                id="course-create-category"
                v-model="categoryModel"
                name="category"
                :class="SELECT_FIELD_CLASS"
                :disabled="isSaving || isFormBlocked"
                :aria-invalid="showCategoryRequired"
                :aria-describedby="
                    showCategoryRequired
                        ? 'course-create-category-error'
                        : undefined
                "
            >
                <option
                    v-for="t in offeredCourseTypes"
                    :key="t.id"
                    :value="t.code"
                >
                    {{ t.code
                    }}{{ t.name && t.name !== t.code ? ` — ${t.name}` : '' }}
                </option>
            </select>
            <UiInput
                v-else
                id="course-create-category"
                v-model="categoryModel"
                type="text"
                name="category"
                autocomplete="off"
                placeholder="Np. B, CE"
                :disabled="isSaving || isFormBlocked"
                :aria-invalid="showCategoryRequired"
                :aria-describedby="
                    showCategoryRequired
                        ? 'course-create-category-error'
                        : undefined
                "
            />
            <p
                v-if="showCategoryRequired"
                id="course-create-category-error"
                class="text-destructive text-sm"
                role="alert"
            >
                {{
                    hasOfferedCategoryList
                        ? 'Wybierz kategorię z oferty szkoły.'
                        : 'Podaj kod kategorii.'
                }}
            </p>
        </div>

        <div class="space-y-2">
            <UiLabel for="course-create-kind">Rodzaj kursu</UiLabel>
            <select
                id="course-create-kind"
                v-model="kindModel"
                name="kind"
                :class="SELECT_FIELD_CLASS"
                :disabled="isSaving || isFormBlocked"
                :aria-invalid="showKindRequired"
                :aria-describedby="
                    showKindRequired ? 'course-create-kind-error' : undefined
                "
            >
                <option v-for="k in kindOptions" :key="k" :value="k">
                    {{ formatCourseKindLabel(k) }}
                </option>
            </select>
            <p
                v-if="showKindRequired"
                id="course-create-kind-error"
                class="text-destructive text-sm"
                role="alert"
            >
                Wybierz rodzaj kursu.
            </p>
        </div>

        <div class="space-y-2">
            <UiLabel for="course-create-hours">Łączna liczba godzin</UiLabel>
            <UiInput
                id="course-create-hours"
                v-model="totalHoursModel"
                type="number"
                name="totalHours"
                inputmode="numeric"
                min="1"
                step="1"
                autocomplete="off"
                :aria-invalid="showTotalHoursInvalid"
                :aria-describedby="
                    showTotalHoursInvalid
                        ? 'course-create-hours-error'
                        : undefined
                "
                :disabled="isSaving || isFormBlocked"
            />
            <p
                v-if="showTotalHoursInvalid"
                id="course-create-hours-error"
                class="text-destructive text-sm"
                role="alert"
            >
                Podaj liczbę całkowitą co najmniej 1.
            </p>
        </div>

        <template v-if="isTheoryKind">
            <div class="space-y-2">
                <UiLabel for="course-create-theory-start"
                    >Data rozpoczęcia teorii</UiLabel
                >
                <UiInput
                    id="course-create-theory-start"
                    v-model="theoryStartModel"
                    type="date"
                    name="theoryStartDate"
                    :disabled="isSaving || isFormBlocked"
                    :aria-invalid="
                        showTheoryStartRequired || showTheoryRangeInvalid
                    "
                    :aria-describedby="
                        showTheoryStartRequired || showTheoryRangeInvalid
                            ? 'course-create-theory-error'
                            : undefined
                    "
                />
            </div>

            <div class="space-y-2">
                <UiLabel for="course-create-theory-end"
                    >Data zakończenia teorii</UiLabel
                >
                <UiInput
                    id="course-create-theory-end"
                    v-model="theoryEndModel"
                    type="date"
                    name="theoryEndDate"
                    :disabled="isSaving || isFormBlocked"
                    :aria-invalid="
                        showTheoryEndRequired || showTheoryRangeInvalid
                    "
                    :aria-describedby="
                        showTheoryEndRequired || showTheoryRangeInvalid
                            ? 'course-create-theory-error'
                            : undefined
                    "
                />
            </div>

            <p
                v-if="showTheoryStartRequired || showTheoryEndRequired"
                id="course-create-theory-error"
                class="text-destructive text-sm"
                role="alert"
            >
                <span v-if="showTheoryStartRequired"
                    >Data rozpoczęcia jest wymagana.</span
                >
                <span v-else-if="showTheoryEndRequired"
                    >Data zakończenia jest wymagana.</span
                >
            </p>
            <p
                v-else-if="showTheoryRangeInvalid"
                class="text-destructive text-sm"
                role="alert"
            >
                Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.
            </p>

            <div class="space-y-2">
                <UiLabel for="course-create-capacity"
                    >Limit miejsc (opcjonalnie — puste = brak limitu)</UiLabel
                >
                <UiInput
                    id="course-create-capacity"
                    v-model="capacityModel"
                    type="number"
                    name="capacity"
                    inputmode="numeric"
                    min="0"
                    step="1"
                    autocomplete="off"
                    :aria-invalid="showCapacityInvalid"
                    :aria-describedby="
                        showCapacityInvalid
                            ? 'course-create-capacity-error'
                            : undefined
                    "
                    :disabled="isSaving || isFormBlocked"
                />
                <p
                    v-if="showCapacityInvalid"
                    id="course-create-capacity-error"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    Podaj liczbę całkowitą od 0 lub zostaw puste.
                </p>
            </div>
        </template>

        <div class="space-y-2">
            <UiLabel for="course-create-instructor"
                >Instruktor (opcjonalnie)</UiLabel
            >
            <p
                v-if="isInstructorsLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy instruktorów…
            </p>
            <select
                v-else
                id="course-create-instructor"
                v-model="instructorIdModel"
                name="instructorId"
                :class="SELECT_FIELD_CLASS"
                :disabled="isSaving || isFormBlocked"
                aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
            >
                <option value="">— Brak instruktora —</option>
                <option
                    v-for="ins in instructors"
                    :key="ins.id"
                    :value="ins.id"
                >
                    {{ formatInstructorDisplayName(ins)
                    }}{{
                        ins.email && ins.email.length > 0
                            ? ` (${ins.email})`
                            : ''
                    }}
                </option>
            </select>
            <p
                v-if="!isInstructorsLoading && instructors.length === 0"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak instruktorów przypisanych do tej szkoły — możesz utworzyć
                kurs bez instruktora.
            </p>
        </div>

        <button
            type="submit"
            :class="cn(buttonVariants(), 'w-full sm:w-auto')"
            :disabled="isSaving || isFormBlocked"
        >
            {{ isSaving ? 'Tworzenie…' : 'Utwórz kurs' }}
        </button>
    </form>
</template>
