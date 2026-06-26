import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { CourseCreatePayload, CourseKind } from '~/types/courses/course';
import { instructorHasCourseCategoryQualification } from '~/types/instructors/instructor';

export interface CourseCreateFormProps {
    schoolId: string;
    offeredCourseTypes: OfferedCourseType[];
    enabledCourseKinds?: CourseKind[];
    isSchoolContextLoading: boolean;
    instructors: InstructorListItem[];
    isInstructorsLoading: boolean;
    isSaving: boolean;
    apiError: string | null;
}

const ALL_KINDS: CourseKind[] = ['THEORY_GROUP', 'PRACTICAL', 'EXTRA'];

function numericFieldInputToTrimmedString(
    raw: string | number | null | undefined,
): string {
    if (raw === null || raw === undefined) {
        return '';
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return '';
        }

        return String(Math.trunc(raw));
    }

    return String(raw).trim();
}

export function useCourseCreateForm(
    props: Readonly<CourseCreateFormProps>,
    submit: (payload: CourseCreatePayload) => void,
) {
    const nameModel = ref('');
    const categoryModel = ref<string>('');
    const kindModel = ref<CourseKind>('THEORY_GROUP');
    const totalHoursModel = ref('30');
    const capacityModel = ref('');
    const theoryStartModel = ref('');
    const theoryEndModel = ref('');
    const instructorIdModel = ref('');

    const showNameRequired = ref(false);
    const showCategoryRequired = ref(false);
    const showKindRequired = ref(false);
    const showTotalHoursInvalid = ref(false);
    const showTheoryStartRequired = ref(false);
    const showTheoryEndRequired = ref(false);
    const showTheoryRangeInvalid = ref(false);
    const showCapacityInvalid = ref(false);

    const kindOptions = computed(() => {
        const allow = props.enabledCourseKinds;

        if (allow !== undefined && allow.length > 0) {
            const filtered = ALL_KINDS.filter((k) => allow.includes(k));

            if (filtered.length > 0) {
                return filtered;
            }
        }

        return ALL_KINDS;
    });

    const isFormBlocked = computed(
        () => props.isSchoolContextLoading || kindOptions.value.length === 0,
    );

    const hasOfferedCategoryList = computed(
        () => props.offeredCourseTypes.length > 0,
    );

    const showNoOfferedCategoriesHint = computed(
        () =>
            !props.isSchoolContextLoading &&
            props.offeredCourseTypes.length === 0,
    );

    const showNoEnabledKindsMessage = computed(
        () =>
            !props.isSchoolContextLoading &&
            props.offeredCourseTypes.length > 0 &&
            kindOptions.value.length === 0,
    );

    const qualifiedInstructors = computed((): InstructorListItem[] => {
        const categoryCode = categoryModel.value.trim();

        if (!categoryCode) {
            return [];
        }

        return props.instructors.filter((instructor) =>
            instructorHasCourseCategoryQualification(instructor, categoryCode),
        );
    });

    const isTheoryKind = computed(() => kindModel.value === 'THEORY_GROUP');

    watch(qualifiedInstructors, (items) => {
        const selected = instructorIdModel.value.trim();

        if (!selected) {
            return;
        }

        if (!items.some((item) => item.id === selected)) {
            instructorIdModel.value = '';
        }
    });

    watch(
        () => props.offeredCourseTypes,
        (types) => {
            if (types.length === 0) {
                return;
            }

            const codes = types.map((t) => t.code);

            if (!codes.includes(categoryModel.value)) {
                categoryModel.value = types[0]!.code;
            }
        },
        { immediate: true },
    );

    watch(
        kindOptions,
        (opts) => {
            if (opts.length === 0) {
                return;
            }

            if (!opts.includes(kindModel.value)) {
                kindModel.value = opts[0]!;
            }
        },
        { immediate: true },
    );

    watch(kindModel, () => {
        showTheoryStartRequired.value = false;
        showTheoryEndRequired.value = false;
        showTheoryRangeInvalid.value = false;
        showCapacityInvalid.value = false;
    });

    function handleSubmit() {
        if (isFormBlocked.value) {
            return;
        }

        const nameOk = nameModel.value.trim().length > 0;
        const catTrim = categoryModel.value.trim();
        const catOk =
            catTrim.length > 0 &&
            (props.offeredCourseTypes.length === 0
                ? true
                : props.offeredCourseTypes.some((t) => t.code === catTrim));
        const kindOk = kindOptions.value.includes(kindModel.value);

        const hoursStr = numericFieldInputToTrimmedString(
            totalHoursModel.value,
        );
        const hoursParsed =
            hoursStr.length > 0 ? Number.parseInt(hoursStr, 10) : Number.NaN;
        const hoursOk =
            Number.isInteger(hoursParsed) &&
            Number.isFinite(hoursParsed) &&
            hoursParsed >= 1;

        showNameRequired.value = !nameOk;
        showCategoryRequired.value = !catOk;
        showKindRequired.value = !kindOk;
        showTotalHoursInvalid.value = !hoursOk;

        let theoryOk = true;

        if (kindModel.value === 'THEORY_GROUP') {
            const startOk = theoryStartModel.value.trim().length > 0;
            const endOk = theoryEndModel.value.trim().length > 0;

            showTheoryStartRequired.value = !startOk;
            showTheoryEndRequired.value = !endOk;

            const rangeOk =
                startOk &&
                endOk &&
                theoryEndModel.value
                    .trim()
                    .localeCompare(theoryStartModel.value.trim()) >= 0;

            showTheoryRangeInvalid.value = startOk && endOk && !rangeOk;

            const capStr = numericFieldInputToTrimmedString(
                capacityModel.value,
            );

            if (capStr.length > 0) {
                const cap = Number.parseInt(capStr, 10);

                showCapacityInvalid.value =
                    !Number.isInteger(cap) || !Number.isFinite(cap) || cap < 0;
            } else {
                showCapacityInvalid.value = false;
            }

            theoryOk =
                startOk && endOk && rangeOk && !showCapacityInvalid.value;
        } else {
            showTheoryStartRequired.value = false;
            showTheoryEndRequired.value = false;
            showTheoryRangeInvalid.value = false;
            showCapacityInvalid.value = false;
        }

        if (!nameOk || !catOk || !kindOk || !hoursOk || !theoryOk) {
            return;
        }

        const payload: CourseCreatePayload = {
            schoolId: props.schoolId,
            name: nameModel.value.trim(),
            category: catTrim,
            kind: kindModel.value,
            totalHours: hoursParsed,
        };

        if (kindModel.value === 'THEORY_GROUP') {
            payload.theoryStartDate = theoryStartModel.value.trim();
            payload.theoryEndDate = theoryEndModel.value.trim();

            const capStr = numericFieldInputToTrimmedString(
                capacityModel.value,
            );

            payload.capacity =
                capStr.length > 0 ? Number.parseInt(capStr, 10) : null;
        }

        const inst = instructorIdModel.value.trim();

        if (inst.length > 0) {
            payload.instructorId = inst;
        }

        submit(payload);
    }

    return {
        capacityModel,
        categoryModel,
        handleSubmit,
        hasOfferedCategoryList,
        instructorIdModel,
        isFormBlocked,
        isTheoryKind,
        kindModel,
        kindOptions,
        nameModel,
        qualifiedInstructors,
        showCapacityInvalid,
        showCategoryRequired,
        showKindRequired,
        showNameRequired,
        showNoEnabledKindsMessage,
        showNoOfferedCategoriesHint,
        showTheoryEndRequired,
        showTheoryRangeInvalid,
        showTheoryStartRequired,
        showTotalHoursInvalid,
        theoryEndModel,
        theoryStartModel,
        totalHoursModel,
    };
}
