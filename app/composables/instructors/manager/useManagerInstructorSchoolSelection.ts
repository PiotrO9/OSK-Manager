export function useManagerInstructorSchoolSelection() {
    const activeSchoolId = useState<string>(
        'manager-instructors-active-school-id',
        () => '',
    );

    return { activeSchoolId };
}
