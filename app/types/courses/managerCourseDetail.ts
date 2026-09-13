import type { StatusTone } from '~/types/ui';

export interface ManagerCourseInfoItem {
    label: string;
    description: string;
    badge: string;
    tone?: StatusTone;
}

export interface ManagerCourseCapacityInsight {
    participantCount: number | null;
    capacity: number | null;
    fillPercentage: number | null;
    freeSeats: number | null;
    valueLabel: string;
    helperLabel: string;
    badgeLabel: string;
    badgeTone: StatusTone;
    hasCapacity: boolean;
    isOverCapacity: boolean;
}
