export interface ManagerSchoolScheduleWeekDay {
    date: Date;
    dateStr: string;
    header: string;
    isToday: boolean;
}

export type ManagerSchoolScheduleWeekDirection = 'prev' | 'next';
