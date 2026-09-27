import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { formatDateOnly, getMonday } from '~/utils/date/weeklyCalendarDates';
import { polishSlotToIso } from '~/utils/date/polishScheduleTime';

type DemoSpec = Omit<ScheduleLessonItem, 'startTime' | 'endTime'> & {
    day: number;
    start: string;
    end: string;
};

const instructors = [
    { id: 'demo-instructor-marek', firstName: 'Marek', lastName: 'Nowak' },
    { id: 'demo-instructor-joanna', firstName: 'Joanna', lastName: 'Lis' },
    { id: 'demo-instructor-piotr', firstName: 'Piotr', lastName: 'Wiśniewski' },
    { id: 'demo-instructor-alicja', firstName: 'Alicja', lastName: 'Kamińska' },
];
const vehicles = [
    {
        id: 'demo-vehicle-yaris',
        name: 'Toyota Yaris',
        registrationNumber: 'EZG 4K21',
    },
    { id: 'demo-vehicle-rio', name: 'Kia Rio', registrationNumber: 'DW 00002' },
    {
        id: 'demo-vehicle-skoda',
        name: 'Skoda Fabia',
        registrationNumber: 'DW 00003',
    },
    {
        id: 'demo-vehicle-hyundai',
        name: 'Hyundai i20',
        registrationNumber: 'DW 00004',
    },
];

function practice(
    id: number,
    day: number,
    start: string,
    end: string,
    studentName: [string, string],
    instructorIndex: number,
    vehicleIndex: number,
    status = 'SCHEDULED',
): DemoSpec {
    return {
        id: `demo-lesson-${id}`,
        day,
        start,
        end,
        type: 'PRACTICE',
        status,
        student: {
            id: `demo-student-${id}`,
            firstName: studentName[0],
            lastName: studentName[1],
        },
        instructor: instructors[instructorIndex],
        vehicle: vehicles[vehicleIndex],
        categoryCode: 'B',
    };
}

const demoSpecs: readonly DemoSpec[] = [
    practice(1, 0, '08:00', '09:30', ['Anna', 'Kowalska'], 0, 0),
    practice(2, 0, '09:00', '10:30', ['Michał', 'Zieliński'], 2, 1),
    practice(3, 0, '09:00', '10:00', ['Ewa', 'Mazur'], 1, 2),
    practice(4, 0, '09:00', '10:00', ['Jan', 'Krawczyk'], 3, 3, 'COMPLETED'),
    practice(5, 0, '10:00', '11:30', ['Ola', 'Wójcik'], 1, 2),
    {
        id: 'demo-theory-1',
        day: 0,
        start: '13:00',
        end: '14:30',
        kind: 'instructor_event',
        type: 'THEORY',
        status: 'SCHEDULED',
        instructor: instructors[1],
        capacity: 12,
        participantCount: 8,
    },
    practice(6, 1, '08:00', '09:30', ['Kasia', 'Pawłowska'], 0, 1),
    {
        id: 'demo-break-1',
        day: 1,
        start: '10:00',
        end: '11:00',
        kind: 'instructor_event',
        type: 'BREAK',
        status: 'SCHEDULED',
        instructor: instructors[0],
    },
    practice(7, 2, '11:00', '12:30', ['Ania', 'Nowicka'], 1, 0),
    practice(8, 2, '11:00', '12:00', ['Tomasz', 'Lis'], 2, 1),
    {
        id: 'demo-theory-2',
        day: 3,
        start: '09:00',
        end: '10:00',
        kind: 'instructor_event',
        type: 'THEORY',
        status: 'SCHEDULED',
        instructor: instructors[1],
        capacity: 10,
        participantCount: 6,
    },
    practice(9, 4, '15:00', '16:30', ['Olaf', 'Kowalski'], 0, 1),
    practice(10, 4, '16:00', '17:30', ['Zofia', 'Malinowska'], 2, 0),
];

/** Dane demonstracyjne przesuwają się razem z tygodniem kalendarza. */
export function buildDesignSystemScheduleItems(
    weekStart: Date,
): ScheduleLessonItem[] {
    const monday = getMonday(weekStart);

    return demoSpecs.map(({ day, start, end, ...lesson }) => {
        const date = formatDateOnly(
            new Date(
                monday.getFullYear(),
                monday.getMonth(),
                monday.getDate() + day,
            ),
        );
        const startTime = polishSlotToIso(date, start);
        const endTime = polishSlotToIso(date, end);

        if (!startTime || !endTime) {
            throw new Error(`Nieprawidłowy termin demonstracyjny: ${date}`);
        }

        return { ...lesson, startTime, endTime };
    });
}
