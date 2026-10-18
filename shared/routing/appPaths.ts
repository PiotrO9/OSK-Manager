import { buildRoutePath } from './routePaths';

export const appPaths = {
    home: () => buildRoutePath('home'),
    login: () => buildRoutePath('login'),
    forgotPassword: () => buildRoutePath('forgotPassword'),
    resetPassword: () => buildRoutePath('resetPassword'),
    account: () => buildRoutePath('account'),
    events: () => buildRoutePath('events'),
    myLessons: () => buildRoutePath('myLessons'),
    myCourses: () => buildRoutePath('myCourses'),
    myPayments: () => buildRoutePath('myPayments'),
    myReviews: () => buildRoutePath('myReviews'),
    bookLesson: () => buildRoutePath('bookLesson'),
    vehicles: () => buildRoutePath('vehicles'),
    vehicleNew: () => buildRoutePath('vehicleNew'),
    vehicle: (id: string) => buildRoutePath('vehicle', { id }),
    vehicleEdit: (id: string) => buildRoutePath('vehicleEdit', { id }),
    managerSchools: () => buildRoutePath('managerSchools'),
    managerSchoolNew: () => buildRoutePath('managerSchoolNew'),
    managerAccounts: () => buildRoutePath('managerAccounts'),
    managerAccountObligations: (userId: string) =>
        buildRoutePath('managerAccountObligations', { userId }),
    managerSecurityLogs: () => buildRoutePath('managerSecurityLogs'),
    managerStudents: () => buildRoutePath('managerStudents'),
    managerStudent: (userId: string) =>
        buildRoutePath('managerStudent', { userId }),
    managerInstructors: () => buildRoutePath('managerInstructors'),
    managerInstructorNew: () => buildRoutePath('managerInstructorNew'),
    managerInstructor: (id: string) =>
        buildRoutePath('managerInstructor', { id }),
    managerInstructorAvailability: (id: string) =>
        buildRoutePath('managerInstructorAvailability', { id }),
    managerInstructorSchedule: (id: string) =>
        buildRoutePath('managerInstructorSchedule', { id }),
    managerInstructorSlots: (id: string) =>
        buildRoutePath('managerInstructorSlots', { id }),
    managerCourses: () => buildRoutePath('managerCourses'),
    managerCourseNew: () => buildRoutePath('managerCourseNew'),
    managerCourse: (id: string) => buildRoutePath('managerCourse', { id }),
    managerCourseEdit: (id: string) =>
        buildRoutePath('managerCourseEdit', { id }),
    managerSchedule: () => buildRoutePath('managerSchedule'),
    managerLessonEdit: (id: string) =>
        buildRoutePath('managerLessonEdit', { id }),
    managerEventEdit: (id: string) =>
        buildRoutePath('managerEventEdit', { id }),
    managerReviews: () => buildRoutePath('managerReviews'),
    designSystem: () => buildRoutePath('designSystem'),
};
