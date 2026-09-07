import type { StatusTone } from '~/types/ui';

export interface ManagerCourseInfoItem {
    label: string;
    description: string;
    badge: string;
    tone?: StatusTone;
}
