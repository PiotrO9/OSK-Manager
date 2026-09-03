<script setup lang="ts">
import { CalendarDays, Clock, Layers3, Plus } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ManagerInstructorEventType } from '~/composables/instructors/manager/useManagerInstructorSchedulePage';

defineProps<{
    schoolId: string;
    courses: CourseListItem[];
    coursesError: string | null;
    isCoursesLoading: boolean;
    vehicles: Vehicle[];
    vehiclesError: string | null;
    isVehiclesLoading: boolean;
    isEventSaving: boolean;
    eventFormError: string | null;
    backHref: RouteLocationRaw;
}>();

const emit = defineEmits<{
    submit: [];
}>();
const eventType = defineModel<ManagerInstructorEventType>('eventType', {
    required: true,
});
const eventStartLocal = defineModel<string>('eventStartLocal', {
    required: true,
});
const eventEndLocal = defineModel<string>('eventEndLocal', { required: true });
const eventVehicleId = defineModel<string>('eventVehicleId', {
    required: true,
});
const eventCourseId = defineModel<string>('eventCourseId', { required: true });
</script>

<template>
    <FormSection
        title="Dodaj blok czasu"
        description="Blok bez kursanta rezerwuje czas instruktora dla teorii albo jazdy."
    >
        <div id="event-block-heading" class="space-y-4">
            <div class="space-y-2">
                <UiLabel for="event-type">Typ</UiLabel>
                <UiSelect v-model="eventType">
                    <UiSelectTrigger
                        id="event-type"
                        class="w-full"
                        aria-label="Typ bloku: teoria lub jazda"
                    >
                        <UiSelectValue placeholder="Typ bloku" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem value="THEORY">Teoria</UiSelectItem>
                            <UiSelectItem value="DRIVE">Jazda</UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div v-if="eventType === 'THEORY' && schoolId" class="space-y-2">
                <UiLabel for="event-course">Kurs opcjonalnie</UiLabel>
                <p
                    v-if="isCoursesLoading"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Wczytywanie kursów...
                </p>
                <p
                    v-else-if="coursesError"
                    class="text-destructive text-xs"
                    role="alert"
                >
                    {{ coursesError }}
                </p>
                <UiSelect
                    v-model="eventCourseId"
                    :disabled="isCoursesLoading || isEventSaving"
                >
                    <UiSelectTrigger
                        id="event-course"
                        class="w-full"
                        aria-label="Powiązanie bloku teorii z kursem"
                    >
                        <UiSelectValue placeholder="Bez powiazania z kursem" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="c in courses"
                                :key="c.id"
                                :value="c.id"
                            >
                                {{ c.name }} ({{ c.category }})
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
                <p class="text-muted-foreground text-xs">
                    Powiązanie z kursem nie dodaje kursantów na ten blok.
                </p>
            </div>

            <div v-if="eventType === 'DRIVE'" class="space-y-2">
                <UiLabel for="event-vehicle">Pojazd</UiLabel>
                <p
                    v-if="isVehiclesLoading"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Wczytywanie pojazdów...
                </p>
                <p
                    v-else-if="vehiclesError"
                    class="text-destructive text-xs"
                    role="alert"
                >
                    {{ vehiclesError }}
                </p>
                <UiSelect
                    v-model="eventVehicleId"
                    :disabled="
                        !schoolId || vehicles.length === 0 || isVehiclesLoading
                    "
                >
                    <UiSelectTrigger
                        id="event-vehicle"
                        class="w-full"
                        aria-label="Pojazd dla bloku jazdy"
                    >
                        <UiSelectValue placeholder="Wybierz pojazd" />
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
            </div>

            <div class="space-y-2">
                <UiLabel for="event-start">Początek</UiLabel>
                <UiDateTimePicker
                    id="event-start"
                    v-model="eventStartLocal"
                    placeholder="Data i godzina początku"
                    :aria-required="true"
                />
            </div>

            <div class="space-y-2">
                <UiLabel for="event-end">Koniec</UiLabel>
                <UiDateTimePicker
                    id="event-end"
                    v-model="eventEndLocal"
                    placeholder="Data i godzina końca"
                    :aria-required="true"
                />
            </div>

            <p
                v-if="eventFormError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ eventFormError }}
            </p>

            <div
                class="border-border bg-muted/30 grid gap-3 rounded-xl border p-3 text-xs sm:grid-cols-3 xl:grid-cols-1"
            >
                <div class="flex items-center gap-2">
                    <Clock
                        class="text-primary size-4 shrink-0"
                        aria-hidden="true"
                    />
                    Walidacja czasu po stronie serwera
                </div>
                <div class="flex items-center gap-2">
                    <Layers3
                        class="text-primary size-4 shrink-0"
                        aria-hidden="true"
                    />
                    Brak kursanta w nowym bloku
                </div>
                <div class="flex items-center gap-2">
                    <CalendarDays
                        class="text-primary size-4 shrink-0"
                        aria-hidden="true"
                    />
                    Po zapisie odświeżam tydzien
                </div>
            </div>
        </div>

        <template #footer>
            <ActionGroup label="Akcje bloku czasu" align="end">
                <UiButton as-child variant="outline" type="button">
                    <NuxtLink :to="backHref">Szczegóły instruktora</NuxtLink>
                </UiButton>
                <UiButton
                    type="button"
                    :disabled="isEventSaving"
                    :aria-busy="isEventSaving"
                    class="gap-2"
                    @click="emit('submit')"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    {{ isEventSaving ? 'Zapisywanie...' : 'Dodaj blok' }}
                </UiButton>
            </ActionGroup>
        </template>
    </FormSection>
</template>
