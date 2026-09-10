import type { RouteLocationRaw } from 'vue-router';
import type { StudentListItem } from './studentModels';

/** Shared presentation of a student in the desktop table and mobile cards. */
export interface StudentListRow {
    student: StudentListItem;
    name: string;
    initials: string;
    dateLabel: string;
    detailsTo: RouteLocationRaw | null;
}
