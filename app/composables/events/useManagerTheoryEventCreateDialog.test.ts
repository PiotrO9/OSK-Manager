import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';
import {
    parseTheoryEventCapacity,
    useManagerTheoryEventCreateDialog,
} from './useManagerTheoryEventCreateDialog';

const createInstructorEvent = vi.fn();
const fetchCoursesList = vi.fn();
const fetchInstructorsList = vi.fn();

function installGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useInstructorEventsApi', () => ({
        createInstructorEvent,
        isLoading: ref(false),
    }));
    vi.stubGlobal('useCoursesApi', () => ({
        fetchList: fetchCoursesList,
    }));
    vi.stubGlobal('useInstructorsApi', () => ({
        fetchList: fetchInstructorsList,
    }));
}

function slotCtx(
    availableInstructors: LessonBookingSlotContext['availableInstructors'] = [
        {
            id: 'instructor-1',
            firstName: 'Jan',
            lastName: 'Kowalski',
        },
    ],
): LessonBookingSlotContext {
    return {
        date: '2026-08-20',
        startTime: '10:00',
        endTime: '11:30',
        schoolId: 'school-1',
        availableInstructors,
    };
}

function course(overrides: Partial<CourseListItem> = {}): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: {
            id: 'type-b',
            code: 'B',
            name: 'B',
        },
        type: 'THEORY_GROUP',
        totalHours: 30,
        instructor: null,
        ...overrides,
    };
}

function instructor(
    overrides: Partial<InstructorListItem> = {},
): InstructorListItem {
    return {
        id: 'instructor-1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        qualifiedCourseTypes: [
            {
                id: 'type-b',
                code: 'B',
                name: 'B',
            },
        ],
        ...overrides,
    };
}

describe('parseTheoryEventCapacity', () => {
    it('normalizes optional non-negative integer capacity', () => {
        expect(parseTheoryEventCapacity('')).toBeNull();
        expect(parseTheoryEventCapacity(null)).toBeNull();
        expect(parseTheoryEventCapacity('20')).toBe(20);
        expect(parseTheoryEventCapacity(12.9)).toBe(12);
    });

    it('rejects negative or non-numeric capacity', () => {
        expect(parseTheoryEventCapacity('-1')).toBe(false);
        expect(parseTheoryEventCapacity('abc')).toBe(false);
    });
});

describe('useManagerTheoryEventCreateDialog', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        fetchCoursesList.mockResolvedValue([]);
        fetchInstructorsList.mockResolvedValue([]);
        createInstructorEvent.mockResolvedValue({
            id: 'event-1',
            capacity: null,
        });
        installGlobals();
    });

    it('preselects instructor when the slot has exactly one available instructor', async () => {
        const open = ref(false);
        const emitCreated = vi.fn();
        const page = useManagerTheoryEventCreateDialog({
            open,
            schoolId: ref('school-1'),
            slotCtx: ref(slotCtx()),
            emitCreated,
        });

        open.value = true;
        await nextTick();

        expect(page.selectedInstructorId.value).toBe('instructor-1');
    });

    it('filters available instructors by selected theory course qualification', async () => {
        const open = ref(true);
        const page = useManagerTheoryEventCreateDialog({
            open,
            schoolId: ref('school-1'),
            slotCtx: ref(
                slotCtx([
                    {
                        id: 'instructor-1',
                        firstName: 'Jan',
                        lastName: 'Kowalski',
                    },
                    {
                        id: 'instructor-2',
                        firstName: 'Anna',
                        lastName: 'Nowak',
                    },
                ]),
            ),
            emitCreated: vi.fn(),
        });

        page.theoryCourses.value = [course()];
        page.selectedCourseId.value = 'course-1';
        page.schoolInstructors.value = [
            instructor({ id: 'instructor-1' }),
            instructor({
                id: 'instructor-2',
                qualifiedCourseTypes: [
                    {
                        id: 'type-a',
                        code: 'A',
                        name: 'A',
                    },
                ],
            }),
        ];

        await nextTick();

        expect(page.filteredAvailableInstructors.value).toEqual([
            {
                id: 'instructor-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
            },
        ]);
    });

    it('creates theory event with selected course and parsed capacity', async () => {
        const open = ref(true);
        const emitCreated = vi.fn();

        createInstructorEvent.mockResolvedValue({
            id: 'event-1',
            capacity: 20,
        });
        const page = useManagerTheoryEventCreateDialog({
            open,
            schoolId: ref('school-1'),
            slotCtx: ref(slotCtx()),
            emitCreated,
        });

        page.selectedInstructorId.value = ' instructor-1 ';
        page.selectedCourseId.value = ' course-1 ';
        page.capacityInput.value = '20';

        await page.handleSubmit();

        expect(createInstructorEvent).toHaveBeenCalledWith({
            instructorId: 'instructor-1',
            type: 'THEORY',
            startTime: '2026-08-20T10:00:00.000Z',
            endTime: '2026-08-20T11:30:00.000Z',
            capacity: 20,
            courseId: 'course-1',
        });
        expect(emitCreated).toHaveBeenCalledWith({
            eventId: 'event-1',
            capacity: 20,
        });
        expect(open.value).toBe(false);
    });

    it('validates instructor and capacity before creating event', async () => {
        const page = useManagerTheoryEventCreateDialog({
            open: ref(true),
            schoolId: ref('school-1'),
            slotCtx: ref(slotCtx()),
            emitCreated: vi.fn(),
        });

        page.selectedInstructorId.value = '';
        await page.handleSubmit();
        expect(page.formError.value).toBe('Wybierz instruktora.');

        page.selectedInstructorId.value = 'instructor-1';
        page.capacityInput.value = '-1';
        await page.handleSubmit();

        expect(page.formError.value).toBe(
            'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).',
        );
        expect(createInstructorEvent).not.toHaveBeenCalled();
    });
});
