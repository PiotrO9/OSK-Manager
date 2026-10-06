import type {
    StudentPaymentItem,
    StudentPaymentsSummary,
} from '~/types/payments/payment';
import type {
    StudentListItem,
    StudentProcessStatusStep,
    StudentDetail,
} from '~/types/students/student';
import type {
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
} from '~/types/lessons/lessonBooking';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type {
    CourseListItem,
    CurrentUserCourseItem,
} from '~/types/courses/course';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { getMyPaymentDisplayStatus } from '~/utils/payments/myPaymentsPage';

/** Fixed reference day keeps demonstrations independent of the current clock. */
export const designSystemReferenceDate = new Date('2026-09-10T10:00:00Z');

export const designSystemStudents: readonly StudentListItem[] = [
    {
        id: 'student-1',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Kowalska',
        email: 'anna.kowalska@example.com',
        phone: '+48 500 100 200',
        avatarUrl: null,
        pkkNumber: '12345678901234567890',
        isActive: true,
        createdAt: '2026-08-18T10:00:00Z',
    },
    {
        id: 'student-2',
        userId: 'user-2',
        firstName: 'Michał',
        lastName: 'Zieliński',
        email: 'michal.zielinski@example.com',
        phone: '+48 500 200 300',
        avatarUrl: null,
        pkkNumber: null,
        isActive: true,
        createdAt: '2026-08-25T12:30:00Z',
    },
    {
        id: 'student-3',
        userId: 'user-3',
        firstName: 'Aleksandra',
        lastName: 'Wojciechowska-Kaczmarek',
        email: 'aleksandra.wojciechowska@example.com',
        phone: null,
        avatarUrl: null,
        pkkNumber: '98765432109876543210',
        isActive: false,
        createdAt: '2026-07-11T08:15:00Z',
    },
] as const;

export const designSystemPayments: readonly StudentPaymentItem[] = [
    {
        id: 'payment-1',
        courseId: 'course-1',
        courseName: 'Kurs prawa jazdy kat. B',
        paymentPlanId: 'plan-1',
        amount: '1250.00',
        currency: 'PLN',
        status: 'PAID',
        date: '2026-08-20',
        dueDate: '2026-08-20',
        paidAt: '2026-08-19',
        method: 'Przelew',
    },
    {
        id: 'payment-2',
        courseId: 'course-1',
        courseName: 'Kurs prawa jazdy kat. B',
        paymentPlanId: 'plan-2',
        amount: '850.00',
        currency: 'PLN',
        status: 'UNPAID',
        date: null,
        dueDate: '2026-09-15',
        paidAt: null,
        method: null,
    },
    {
        id: 'payment-3',
        courseId: 'course-1',
        courseName: 'Kurs prawa jazdy kat. B',
        paymentPlanId: 'plan-3',
        amount: '350.00',
        currency: 'PLN',
        status: 'UNPAID',
        date: null,
        dueDate: '2026-09-08',
        paidAt: null,
        method: null,
    },
] as const;

export function buildDesignSystemPaymentsSummary(
    payments: readonly StudentPaymentItem[],
    referenceDate = designSystemReferenceDate,
): StudentPaymentsSummary {
    const paid = payments.filter((payment) => payment.status === 'PAID');
    const unpaid = payments.filter((payment) => payment.status === 'UNPAID');
    const overdue = unpaid.filter(
        (payment) =>
            getMyPaymentDisplayStatus(payment, referenceDate) === 'OVERDUE',
    );
    const amount = (items: readonly StudentPaymentItem[]) =>
        (
            items.reduce(
                (sum, item) => sum + Math.round(Number(item.amount) * 100),
                0,
            ) / 100
        ).toFixed(2);
    const upcomingDates = unpaid
        .filter(
            (payment) =>
                getMyPaymentDisplayStatus(payment, referenceDate) !== 'OVERDUE',
        )
        .map((payment) => payment.dueDate)
        .filter((date): date is string => Boolean(date))
        .sort();

    return {
        paidAmount: amount(paid),
        unpaidAmount: amount(unpaid),
        overdueAmount: amount(overdue),
        overdueCount: overdue.length,
        nextDueDate: upcomingDates[0] ?? null,
        currency: 'PLN',
    };
}

export const designSystemPaymentsSummary =
    buildDesignSystemPaymentsSummary(designSystemPayments);

export const designSystemProcessSteps: readonly StudentProcessStatusStep[] = [
    {
        name: 'Dane i PKK',
        completed: true,
        description: 'Profil kursanta jest kompletny.',
    },
    {
        name: 'Teoria',
        completed: true,
        description: '30 godzin zrealizowanych.',
    },
    {
        name: 'Jazdy',
        completed: false,
        description: '18 z 30 godzin zrealizowanych.',
    },
    {
        name: 'Egzamin wewnętrzny',
        completed: false,
        description: 'Termin nie został jeszcze ustalony.',
    },
] as const;

export const designSystemInstructors: readonly LessonBookingInstructorOption[] =
    [
        { id: 'instructor-1', firstName: 'Marek', lastName: 'Nowak' },
        { id: 'instructor-2', firstName: 'Joanna', lastName: 'Lis' },
    ] as const;

export const designSystemSlot: LessonBookingSlotContext = {
    date: '2026-09-10',
    startTime: '08:00',
    endTime: '09:30',
    schoolId: 'design-system',
    availableInstructors: [...designSystemInstructors],
};

export const designSystemVehicles: readonly Vehicle[] = [
    {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'EZG 4K21',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: true,
        inspectionDate: '2027-04-12',
        insuranceDate: '2027-02-08',
        modelYear: 2023,
        mileageKm: 18400,
    },
    {
        id: 'vehicle-2',
        name: 'Kia Rio',
        registrationNumber: 'EZG 8P10',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: '2027-01-22',
        insuranceDate: '2026-12-14',
        modelYear: 2022,
        mileageKm: 26700,
    },
] as const;

export const designSystemSchool = {
    id: 'design-system',
    name: 'OSK Przykładowa',
    city: 'Zgierz',
};
export const designSystemCourses: CourseListItem[] = [
    {
        id: 'course-1',
        name: 'Kurs prawa jazdy kat. B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
    },
];
export const designSystemStudentProfile: StudentDetail = {
    id: 'student-1',
    userId: 'user-1',
    schoolId: 'design-system',
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'anna.kowalska@example.com',
    pkkNumber: '12345678901234567890',
    notes: 'Parkowanie równoległe do przećwiczenia. Kolejna jazda: trasa egzaminacyjna.',
    courses: [
        {
            id: 'course-1',
            name: 'Kurs prawa jazdy kat. B',
            category: 'B',
            status: 'ACTIVE',
        },
    ],
};
export const designSystemBookingCourses: CurrentUserCourseItem[] = [
    {
        id: 'course-1',
        schoolId: 'design-system',
        name: 'Kurs prawa jazdy kat. B',
        status: 'ACTIVE',
        type: 'PRACTICAL',
        totalHours: 30,
        progress: 18,
    },
];

export function buildDesignSystemBookingSlots(
    monday: Date,
): SchoolAvailabilitySlot[] {
    const date = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 3,
    );
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    return [
        {
            instructorId: 'instructor-1',
            instructorFirstName: 'Marek',
            instructorLastName: 'Nowak',
            date: dateKey,
            startTime: '08:00',
            endTime: '09:30',
        },
        {
            instructorId: 'instructor-2',
            instructorFirstName: 'Joanna',
            instructorLastName: 'Lis',
            date: dateKey,
            startTime: '08:30',
            endTime: '10:00',
        },
        {
            instructorId: 'instructor-1',
            instructorFirstName: 'Marek',
            instructorLastName: 'Nowak',
            date: dateKey,
            startTime: '10:00',
            endTime: '11:00',
        },
    ];
}
