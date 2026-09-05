import { spawnSync } from 'node:child_process';

const smokeTestFiles = [
    // Auth/session.
    'app/composables/auth/useAuthReturnTo.test.ts',
    'app/composables/auth/useAuthSession.test.ts',
    'app/composables/auth/useLoginPage.test.ts',

    // Students.
    'app/types/students/student.test.ts',
    'app/composables/students/useStudentsApi.test.ts',
    'app/composables/students/useManagerStudentCourseAssignment.test.ts',
    'app/composables/students/useManagerStudentDetailsPage.test.ts',
    'app/composables/students/useManagerStudentPayments.test.ts',
    'app/composables/students/useManagerStudentProcessStatus.test.ts',
    'app/composables/students/useManagerStudentSchedule.test.ts',

    // Courses.
    'app/types/courses/course.test.ts',
    'app/composables/courses/useCourseCreateForm.test.ts',
    'app/composables/courses/useManagerCourseDetailData.test.ts',
    'app/composables/courses/useManagerCourseInstructorAssignment.test.ts',
    'app/composables/courses/useMyCoursesPresentation.test.ts',

    // Instructors.
    'app/types/instructors/instructor.test.ts',
    'app/composables/instructors/useManagerInstructorDetailsData.test.ts',
    'app/composables/instructors/useManagerInstructorDetailsEdit.test.ts',
    'app/composables/instructors/manager/useManagerInstructorsPage.test.ts',

    // Events/schedule.
    'app/composables/events/useEventsDayPage.test.ts',
    'app/composables/events/useInstructorEventsApi.test.ts',
    'app/composables/events/useManagerEventEditActions.test.ts',
    'app/composables/events/useManagerEventEditForm.test.ts',
    'app/composables/events/useManagerEventEditParticipantsSave.test.ts',
    'app/composables/events/useManagerTheoryEventCreateDialog.test.ts',
    'app/composables/schedule/useManagerSchoolScheduleCalendar.test.ts',

    // Lessons.
    'app/composables/lessons/useLessonBookingApi.test.ts',
    'app/composables/lessons/useManagerLessonEditForm.test.ts',
    'app/composables/lessons/useMyLessonsCancellation.test.ts',
    'app/composables/lessons/useMyLessonsRatings.test.ts',

    // Payments and BFF boundary.
    'app/composables/payments/usePaymentsApi.test.ts',
    'server/__tests__/bffAdapter.test.ts',
    'server/utils/bff/bffAdapterExecutor.test.ts',
    'server/utils/tests/mockBffAdapters.test.ts',
];

const result = spawnSync(
    process.execPath,
    ['node_modules/vitest/vitest.mjs', 'run', ...smokeTestFiles],
    {
        stdio: 'inherit',
        shell: false,
    },
);

if (result.error) {
    console.error(result.error);
}

process.exit(result.status ?? 1);
