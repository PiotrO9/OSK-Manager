export function useManagerCoursesSelectedSchoolId() {
    return useState<string>('manager-courses-selected-school-id', () => '');
}
