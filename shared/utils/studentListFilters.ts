export const studentListViews = [
    'all',
    'without-pkk',
    'without-course',
    'overdue',
    'without-lesson',
] as const;
export type StudentListView = (typeof studentListViews)[number];

export function isStudentListView(value: string): value is StudentListView {
    return studentListViews.some((view) => view === value);
}
