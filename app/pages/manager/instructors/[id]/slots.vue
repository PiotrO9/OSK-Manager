<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import type { CourseListItem } from '~/types/courses/course';
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const router = useRouter();

function getInstructorId(): string {
    const raw = route.params.id;

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

const instructorId = computed(getInstructorId);
const {
    instructor,
    schoolId,
    isSchoolContextLoading,
    schoolContextError,
    loadInstructorSchoolContext,
} = useManagerInstructorSchoolContext({ instructorId });
const { fetchList: fetchCoursesList } = useCoursesApi();
const schoolCourses = ref<CourseListItem[]>([]);
const activeSlotCtx = shallowRef<LessonBookingSlotContext | null>(null);
const isBookingOpen = shallowRef(false);
const calendarRefreshKey = shallowRef(0);
let coursesLoadSeq = 0;

watch(
    instructorId,
    () => {
        void loadInstructorSchoolContext();
    },
    { immediate: true },
);

watch(
    schoolId,
    async (id) => {
        const seq = ++coursesLoadSeq;

        schoolCourses.value = [];

        if (!id) return;

        const courses = await fetchCoursesList(id).catch(() => []);

        if (seq === coursesLoadSeq) {
            schoolCourses.value = courses;
        }
    },
    { immediate: true },
);

function handleSelectSlot(slot: AvailabilitySlot): void {
    if (!schoolId.value || !instructor.value) return;

    activeSlotCtx.value = {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        schoolId: schoolId.value,
        availableInstructors: [
            {
                id: instructor.value.id,
                firstName: instructor.value.name,
                lastName: '',
            },
        ],
    };
    isBookingOpen.value = true;
}

function handleBooked(): void {
    calendarRefreshKey.value += 1;
}

const backToDetailHref = computed(() => {
    const id = instructorId.value;

    if (!id) {
        return '/manager/instructors';
    }

    return `/manager/instructors/${id}`;
});

const pageTitle = computed(() =>
    instructor.value?.name
        ? `Wolne sloty: ${instructor.value.name}`
        : 'Wolne sloty instruktora',
);

watch(
    () => route.query.schoolId,
    (schoolId) => {
        if (schoolId === undefined) {
            return;
        }

        void router.replace({ path: route.path, query: {} });
    },
    { immediate: true },
);

usePageMeta({
    title: () => 'Sloty instruktora',
    description: () =>
        'Tygodniowy widok dostępnych slotów czasowych instruktora.',
});
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="pageTitle"
            description="Kalendarz dostępnych okien do rezerwacji jazd."
        >
            <template #actions>
                <UiButton as-child variant="outline" class="gap-2">
                    <NuxtLink
                        :to="backToDetailHref"
                        aria-label="Wróć do szczegółów instruktora"
                    >
                        <ArrowLeft class="size-4" aria-hidden="true" />
                        Szczegóły
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="schoolContextError"
            title="Nie udało się wczytać instruktora"
            :description="schoolContextError"
            @retry="loadInstructorSchoolContext"
        />

        <ManagerInstructorWeeklyCalendar
            v-if="instructorId"
            :instructor-id="instructorId"
            :refresh-key="calendarRefreshKey"
            :bookable="Boolean(schoolId) && !isSchoolContextLoading"
            @select-slot="handleSelectSlot"
        />

        <p v-else class="text-destructive text-sm" role="alert">
            Nieprawidlowy identyfikator instruktora.
        </p>

        <ManagerLessonBookingDialog
            v-model:open="isBookingOpen"
            :slot-ctx="activeSlotCtx"
            :school-courses="schoolCourses"
            @booked="handleBooked"
        />
    </div>
</template>
