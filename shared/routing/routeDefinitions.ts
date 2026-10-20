/** Stable page contracts; API paths and query keys are deliberately separate. */
export const routeDefinitions = [
    {
        key: 'home',
        en: '/',
        pl: '/',
        file: 'index.vue',
    },
    {
        key: 'login',
        en: '/login',
        pl: '/logowanie',
        file: 'login.vue',
    },
    {
        key: 'forgotPassword',
        en: '/forgot-password',
        pl: '/przypomnij-haslo',
        file: 'forgot-password.vue',
    },
    {
        key: 'resetPassword',
        en: '/reset-password',
        pl: '/ustaw-haslo',
        file: 'reset-password.vue',
    },
    {
        key: 'account',
        en: '/account',
        pl: '/konto',
        file: 'account/index.vue',
    },
    {
        key: 'events',
        en: '/events',
        pl: '/wydarzenia',
        file: 'events/index.vue',
    },
    {
        key: 'myLessons',
        en: '/my-lessons',
        pl: '/moje-lekcje',
        file: 'my-lessons.vue',
    },
    {
        key: 'myCourses',
        en: '/my-courses',
        pl: '/moje-kursy',
        file: 'my-courses.vue',
    },
    {
        key: 'myPayments',
        en: '/my-payments',
        pl: '/moje-oplaty',
        file: 'my-payments.vue',
    },
    {
        key: 'myReviews',
        en: '/my-reviews',
        pl: '/moje-opinie',
        file: 'my-reviews.vue',
    },
    {
        key: 'bookLesson',
        en: '/book-lesson',
        pl: '/rezerwuj-jazde',
        file: 'book-lesson.vue',
    },
    {
        key: 'vehicles',
        en: '/vehicles',
        pl: '/pojazdy',
        file: 'vehicles/index.vue',
    },
    {
        key: 'vehicleNew',
        en: '/vehicles/new',
        pl: '/pojazdy/dodaj',
        file: 'vehicles/new.vue',
    },
    {
        key: 'vehicle',
        en: '/vehicles/:id',
        pl: '/pojazdy/:id',
        file: 'vehicles/[id]/index.vue',
    },
    {
        key: 'vehicleEdit',
        en: '/vehicles/:id/edit',
        pl: '/pojazdy/:id/edytuj',
        file: 'vehicles/[id]/edit.vue',
    },
    {
        key: 'managerSchools',
        en: '/manager/osk',
        pl: '/menedzer/osrodki',
        file: 'manager/osk/index.vue',
    },
    {
        key: 'managerSchoolNew',
        en: '/manager/osk/new',
        pl: '/menedzer/osrodki/dodaj',
        file: 'manager/osk/new.vue',
    },
    {
        key: 'managerSchoolEdit',
        en: '/manager/osk/:id/edit',
        pl: '/menedzer/osrodki/:id/edytuj',
        file: 'manager/osk/[id]/edit.vue',
    },
    {
        key: 'managerAccounts',
        en: '/manager/accounts',
        pl: '/menedzer/konta',
        file: 'manager/accounts/index.vue',
    },
    {
        key: 'managerAccountObligations',
        en: '/manager/accounts/:userId/archive-obligations',
        pl: '/menedzer/konta/:userId/zobowiazania-archiwizacji',
        file: 'manager/accounts/[userId]/archive-obligations.vue',
    },
    {
        key: 'managerSecurityLogs',
        en: '/manager/security-logs',
        pl: '/menedzer/logi-bezpieczenstwa',
        file: 'manager/security-logs/index.vue',
    },
    {
        key: 'managerStudents',
        en: '/manager/students',
        pl: '/menedzer/kursanci',
        file: 'manager/students/index.vue',
    },
    {
        key: 'managerStudent',
        en: '/manager/students/:userId',
        pl: '/menedzer/kursanci/:userId',
        file: 'manager/students/[userId].vue',
    },
    {
        key: 'managerInstructors',
        en: '/manager/instructors',
        pl: '/menedzer/instruktorzy',
        file: 'manager/instructors/index.vue',
    },
    {
        key: 'managerInstructorNew',
        en: '/manager/instructors/new',
        pl: '/menedzer/instruktorzy/dodaj',
        file: 'manager/instructors/new.vue',
    },
    {
        key: 'managerInstructor',
        en: '/manager/instructors/:id',
        pl: '/menedzer/instruktorzy/:id',
        file: 'manager/instructors/[id]/index.vue',
    },
    {
        key: 'managerInstructorAvailability',
        en: '/manager/instructors/:id/availability',
        pl: '/menedzer/instruktorzy/:id/dostepnosc',
        file: 'manager/instructors/[id]/availability.vue',
    },
    {
        key: 'managerInstructorSchedule',
        en: '/manager/instructors/:id/schedule',
        pl: '/menedzer/instruktorzy/:id/terminarz',
        file: 'manager/instructors/[id]/schedule.vue',
    },
    {
        key: 'managerInstructorSlots',
        en: '/manager/instructors/:id/slots',
        pl: '/menedzer/instruktorzy/:id/wolne-terminy',
        file: 'manager/instructors/[id]/slots.vue',
    },
    {
        key: 'managerCourses',
        en: '/manager/courses',
        pl: '/menedzer/kursy',
        file: 'manager/courses/index.vue',
    },
    {
        key: 'managerCourseNew',
        en: '/manager/courses/new',
        pl: '/menedzer/kursy/dodaj',
        file: 'manager/courses/new.vue',
    },
    {
        key: 'managerCourse',
        en: '/manager/courses/:id',
        pl: '/menedzer/kursy/:id',
        file: 'manager/courses/[id].vue',
    },
    {
        key: 'managerCourseEdit',
        en: '/manager/courses/:id/edit',
        pl: '/menedzer/kursy/:id/edytuj',
        file: 'manager/courses/[id]/edit.vue',
    },
    {
        key: 'managerSchedule',
        en: '/manager/schedule',
        pl: '/menedzer/harmonogram',
        file: 'manager/schedule/index.vue',
    },
    {
        key: 'managerLessonEdit',
        en: '/manager/lessons/:id/edit',
        pl: '/menedzer/lekcje/:id/edytuj',
        file: 'manager/lessons/[id]/edit.vue',
    },
    {
        key: 'managerEventEdit',
        en: '/manager/events/:id/edit',
        pl: '/menedzer/wydarzenia/:id/edytuj',
        file: 'manager/events/[id]/edit.vue',
    },
    {
        key: 'managerReviews',
        en: '/manager/reviews',
        pl: '/menedzer/opinie',
        file: 'manager/reviews/index.vue',
    },
    {
        key: 'designSystem',
        en: '/design-system',
        pl: '/system-projektowy',
        file: 'design-system.vue',
    },
] as const;

export type AppRouteKey = (typeof routeDefinitions)[number]['key'];
export type RouteVariant = 'en' | 'pl';

// Replaced at build time in both Vite and Nitro; tests default to the target release.
declare const __OSK_ROUTE_VARIANT__: RouteVariant;
export const canonicalRouteVariant: RouteVariant =
    typeof __OSK_ROUTE_VARIANT__ === 'undefined' ? 'pl' : __OSK_ROUTE_VARIANT__;
