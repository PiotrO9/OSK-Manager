<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructor';
import type { OfferedCourseType } from '~/types/drivingSchool';
import {
    formatCourseKindLabel,
    type CourseCreatePayload,
    type CourseKind,
} from '~/types/course';
import {
    formatInstructorDisplayName,
    instructorHasCourseCategoryQualification,
} from '~/types/instructor';
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

const qualifiedInstructors = computed((): InstructorListItem[] => {
    const categoryCode = categoryModel.value.trim();

    if (!categoryCode) {
        return [];
    }

    return props.instructors.filter((instructor) =>
        instructorHasCourseCategoryQualification(instructor, categoryCode),
    );
});

watch(qualifiedInstructors, (items) => {
    const selected = instructorIdModel.value.trim();

    if (!selected) {
        return;
    }

    if (!items.some((item) => item.id === selected)) {
        instructorIdModel.value = '';
    }
});

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
            <UiSelect
                v-if="hasOfferedCategoryList"
                v-model="categoryModel"
                :disabled="isSaving || isFormBlocked"
            >
                <UiSelectTrigger
                    id="course-create-category"
                    class="w-full max-w-lg"
                    :aria-invalid="showCategoryRequired"
                    :aria-describedby="
                        showCategoryRequired
                            ? 'course-create-category-error'
                            : undefined
                    "
                >
                    <UiSelectValue placeholder="Wybierz kategorię" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="t in offeredCourseTypes"
                            :key="t.id"
                            :value="t.code"
                        >
                            {{ t.code
                            }}{{
                                t.name && t.name !== t.code
                                    ? ` — ${t.name}`
                                    : ''
                            }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
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
            <UiSelect v-model="kindModel" :disabled="isSaving || isFormBlocked">
                <UiSelectTrigger
                    id="course-create-kind"
                    class="w-full max-w-lg"
                    :aria-invalid="showKindRequired"
                    :aria-describedby="
                        showKindRequired
                            ? 'course-create-kind-error'
                            : undefined
                    "
                >
                    <UiSelectValue placeholder="Rodzaj kursu" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="k in kindOptions"
                            :key="k"
                            :value="k"
                        >
                            {{ formatCourseKindLabel(k) }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
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
                <UiDatePicker
                    id="course-create-theory-start"
                    v-model="theoryStartModel"
                    :disabled="isSaving || isFormBlocked"
                    placeholder="Wybierz datę rozpoczęcia"
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
                <UiDatePicker
                    id="course-create-theory-end"
                    v-model="theoryEndModel"
                    :disabled="isSaving || isFormBlocked"
                    placeholder="Wybierz datę zakończenia"
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
            <UiSelect
                v-else
                v-model="instructorIdModel"
                :disabled="isSaving || isFormBlocked"
            >
                <UiSelectTrigger
                    id="course-create-instructor"
                    class="w-full max-w-lg"
                    aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
                >
                    <UiSelectValue placeholder="— Brak instruktora —" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="ins in qualifiedInstructors"
                            :key="ins.id"
                            :value="ins.id"
                        >
                            {{ formatInstructorDisplayName(ins)
                            }}{{
                                ins.email && ins.email.length > 0
                                    ? ` (${ins.email})`
                                    : ''
                            }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
            <p
                v-if="!isInstructorsLoading && instructors.length === 0"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak instruktorów przypisanych do tej szkoły — możesz utworzyć
                kurs bez instruktora.
            </p>
            <p
                v-else-if="
                    !isInstructorsLoading && qualifiedInstructors.length === 0
                "
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak instruktorow z uprawnieniem do wybranej kategorii - mozesz
                utworzyc kurs bez instruktora.
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
