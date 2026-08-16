<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import {
    formatCourseKindLabel,
    type CourseCreatePayload,
    type CourseKind,
} from '~/types/courses/course';
import { formatInstructorDisplayName } from '~/types/instructors/instructor';

const props = defineProps<{
    id?: string;
    schoolId: string;
    /** Kategorie z oferty OSK (`GET /driving-schools` -> `offeredCourseTypes`). */
    offeredCourseTypes: OfferedCourseType[];
    /** Dozwolone rodzaje kursow z ustawien OSK - brak / pusto = pokazuj wszystkie (kompatybilnosc wsteczna). */
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

const {
    capacityModel,
    categoryModel,
    handleSubmit,
    hasOfferedCategoryList,
    instructorIdModel,
    isFormBlocked,
    isTheoryKind,
    kindModel,
    kindOptions,
    nameModel,
    qualifiedInstructors,
    showCapacityInvalid,
    showCategoryRequired,
    showKindRequired,
    showNameRequired,
    showNoEnabledKindsMessage,
    showNoOfferedCategoriesHint,
    showTheoryEndRequired,
    showTheoryRangeInvalid,
    showTheoryStartRequired,
    showTotalHoursInvalid,
    theoryEndModel,
    theoryStartModel,
    totalHoursModel,
} = useCourseCreateForm(props, (payload) => emit('submit', payload));
</script>

<template>
    <form
        :id="props.id"
        class="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
        novalidate
        @submit.prevent="handleSubmit"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-5"
        >
            <div class="min-w-0">
                <h2 class="text-foreground text-lg font-extrabold">
                    Dodaj kurs
                </h2>
                <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Formularz podzielony na logiczne sekcje, bez zmiany
                    walidacji i flow.
                </p>
            </div>
            <UiBadge
                variant="outline"
                class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700"
            >
                FormSection
            </UiBadge>
        </div>

        <div class="space-y-5 px-4 py-4 md:px-5">
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
                Brak listy kategorii z ustawień OSK w odpowiedzi serwera — wpisz
                kod kategorii ręcznie (np. B). Po skonfigurowaniu oferty w
                panelu szkoły pojawi się lista wyboru.
            </p>

            <p
                v-else-if="showNoEnabledKindsMessage"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                W ustawieniach tej szkoły nie włączono żadnego rodzaju kursu
                (teoria / praktyka / dodatkowy). Uzupełnij pole „włączone
                rodzaje kursów” w konfiguracji OSK.
            </p>

            <div class="grid gap-4 lg:grid-cols-2">
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
                            showNameRequired
                                ? 'course-create-name-error'
                                : undefined
                        "
                        :disabled="isSaving || isFormBlocked"
                        class="bg-background h-10 rounded-xl"
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
                            class="bg-background h-10 w-full rounded-xl"
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
                        class="bg-background h-10 rounded-xl"
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
                    <UiSelect
                        v-model="kindModel"
                        :disabled="isSaving || isFormBlocked"
                    >
                        <UiSelectTrigger
                            id="course-create-kind"
                            class="bg-background h-10 w-full rounded-xl"
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
                    <UiLabel for="course-create-hours"
                        >Łączna liczba godzin</UiLabel
                    >
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
                        class="bg-background h-10 rounded-xl"
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
                            trigger-class="h-10 w-full rounded-xl bg-background"
                            placeholder="Wybierz datę rozpoczęcia"
                            :aria-invalid="
                                showTheoryStartRequired ||
                                showTheoryRangeInvalid
                            "
                            :aria-describedby="
                                showTheoryStartRequired ||
                                showTheoryRangeInvalid
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
                            trigger-class="h-10 w-full rounded-xl bg-background"
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
                        Data zakończenia nie może być wcześniejsza niż data
                        rozpoczęcia.
                    </p>

                    <div class="space-y-2">
                        <UiLabel for="course-create-capacity"
                            >Limit miejsc (opcjonalnie — puste = brak
                            limitu)</UiLabel
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
                            class="bg-background h-10 rounded-xl"
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
                            class="bg-background h-10 w-full rounded-xl"
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
                        Brak instruktorów przypisanych do tej szkoły — możesz
                        utworzyć kurs bez instruktora.
                    </p>
                    <p
                        v-else-if="
                            !isInstructorsLoading &&
                            qualifiedInstructors.length === 0
                        "
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Brak instruktorów z uprawnieniem do wybranej kategorii -
                        możesz utworzyć kurs bez instruktora.
                    </p>
                </div>
            </div>

            <div class="space-y-2">
                <UiLabel for="course-create-description">Opis kursu</UiLabel>
                <UiTextarea
                    id="course-create-description"
                    class="bg-background min-h-24 rounded-xl"
                    placeholder="Krótki opis widoczny w panelu..."
                    disabled
                />
            </div>
        </div>

        <CourseCreateFormActions
            :school-id="props.schoolId"
            :is-saving="isSaving"
            :is-blocked="isFormBlocked"
        />
    </form>
</template>
