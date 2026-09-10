import { z } from 'zod';
import type { AdvancedFilterSegment } from './advancedFilters';

export const studentAdvancedFilterMaxCount = 8;
export const studentAdvancedFiltersMaxBytes = 4096;

export const studentAdvancedFilterFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'pkkNumber',
    'isActive',
    'courseId',
    'hasOverduePayments',
    'hasUpcomingLesson',
    'createdAt',
] as const;

export type StudentAdvancedFilterField =
    (typeof studentAdvancedFilterFields)[number];

export type StudentTextFilterOperator =
    | 'contains'
    | 'not_contains'
    | 'eq'
    | 'neq';
export type StudentEmptyFilterOperator = 'is_empty' | 'is_not_empty';
export type StudentAdvancedFilterOperator =
    | StudentTextFilterOperator
    | StudentEmptyFilterOperator
    | 'before'
    | 'after'
    | 'between';

export type StudentAdvancedFilterApiRule =
    | {
          field: 'firstName' | 'lastName' | 'email';
          operator: StudentTextFilterOperator;
          value: string;
      }
    | {
          field: 'phone';
          operator: 'contains' | 'not_contains';
          value: string;
      }
    | { field: 'phone'; operator: StudentEmptyFilterOperator }
    | {
          field: 'pkkNumber';
          operator: StudentTextFilterOperator;
          value: string;
      }
    | { field: 'pkkNumber'; operator: StudentEmptyFilterOperator }
    | {
          field: 'isActive';
          operator: 'eq' | 'neq';
          value: boolean;
      }
    | {
          field: 'courseId';
          operator: 'eq' | 'neq';
          value: string;
      }
    | { field: 'courseId'; operator: StudentEmptyFilterOperator }
    | {
          field: 'hasOverduePayments' | 'hasUpcomingLesson';
          operator: 'eq';
          value: boolean;
      }
    | {
          field: 'createdAt';
          operator: 'before' | 'after';
          value: string;
      }
    | {
          field: 'createdAt';
          operator: 'between';
          value: [string, string];
      };

export type StudentAdvancedFilter = StudentAdvancedFilterApiRule & {
    id: string;
};

export interface StudentAdvancedFilterCourseOption {
    id: string;
    name: string;
    category?: string | null;
}

export interface StudentAdvancedFilterFieldConfig {
    value: StudentAdvancedFilterField;
    label: string;
    valueType: 'text' | 'boolean' | 'course' | 'date' | 'none';
}

export interface StudentAdvancedFilterConditionOption {
    value: string;
    label: string;
    operator: StudentAdvancedFilterOperator | 'eq' | 'neq';
    fixedValue?: boolean;
}

export interface StudentAdvancedFilterDraft {
    id?: string;
    field: StudentAdvancedFilterField;
    condition: string;
    value?: string | boolean;
    valueTo?: string;
}

export type StudentAdvancedFilterLabelSegment = AdvancedFilterSegment;

const textFields = ['firstName', 'lastName', 'email'] as const;
const relationBooleanFields = [
    'hasOverduePayments',
    'hasUpcomingLesson',
] as const;
const textOperators = ['contains', 'not_contains', 'eq', 'neq'] as const;
const phoneOperators = ['contains', 'not_contains'] as const;
const emptyOperators = ['is_empty', 'is_not_empty'] as const;

const dateValueSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const uuidLikeSchema = z.string().trim().min(1).max(80);

const textRuleSchema = z
    .object({
        field: z.enum(textFields),
        operator: z.enum(textOperators),
        value: z.string().trim().min(1).max(120),
    })
    .strict();

const phoneTextRuleSchema = z
    .object({
        field: z.literal('phone'),
        operator: z.enum(phoneOperators),
        value: z.string().trim().min(1).max(80),
    })
    .strict();

const phoneEmptyRuleSchema = z
    .object({
        field: z.literal('phone'),
        operator: z.enum(emptyOperators),
    })
    .strict();

const pkkTextRuleSchema = z
    .object({
        field: z.literal('pkkNumber'),
        operator: z.enum(textOperators),
        value: z.string().trim().min(1).max(20),
    })
    .strict();

const pkkEmptyRuleSchema = z
    .object({
        field: z.literal('pkkNumber'),
        operator: z.enum(emptyOperators),
    })
    .strict();

const activeRuleSchema = z
    .object({
        field: z.literal('isActive'),
        operator: z.enum(['eq', 'neq']),
        value: z.boolean(),
    })
    .strict();

const courseValueRuleSchema = z
    .object({
        field: z.literal('courseId'),
        operator: z.enum(['eq', 'neq']),
        value: uuidLikeSchema,
    })
    .strict();

const courseEmptyRuleSchema = z
    .object({
        field: z.literal('courseId'),
        operator: z.enum(emptyOperators),
    })
    .strict();

const relationBooleanRuleSchema = z
    .object({
        field: z.enum(relationBooleanFields),
        operator: z.literal('eq'),
        value: z.boolean(),
    })
    .strict();

const dateSingleRuleSchema = z
    .object({
        field: z.literal('createdAt'),
        operator: z.enum(['before', 'after']),
        value: dateValueSchema,
    })
    .strict();

const dateBetweenRuleSchema = z
    .object({
        field: z.literal('createdAt'),
        operator: z.literal('between'),
        value: z.tuple([dateValueSchema, dateValueSchema]),
    })
    .strict()
    .superRefine((rule, ctx) => {
        if (rule.value[0] > rule.value[1]) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Data od musi być wcześniejsza lub równa dacie do.',
                path: ['value'],
            });
        }
    });

export const studentAdvancedFilterApiRuleSchema = z.union([
    textRuleSchema,
    phoneTextRuleSchema,
    phoneEmptyRuleSchema,
    pkkTextRuleSchema,
    pkkEmptyRuleSchema,
    activeRuleSchema,
    courseValueRuleSchema,
    courseEmptyRuleSchema,
    relationBooleanRuleSchema,
    dateSingleRuleSchema,
    dateBetweenRuleSchema,
]);

export const studentAdvancedFiltersApiSchema = z
    .array(studentAdvancedFilterApiRuleSchema)
    .max(studentAdvancedFilterMaxCount);

export const studentAdvancedFilterFieldConfigs: StudentAdvancedFilterFieldConfig[] =
    [
        { value: 'firstName', label: 'Imię', valueType: 'text' },
        { value: 'lastName', label: 'Nazwisko', valueType: 'text' },
        { value: 'email', label: 'E-mail', valueType: 'text' },
        { value: 'phone', label: 'Telefon', valueType: 'text' },
        { value: 'pkkNumber', label: 'Numer PKK', valueType: 'text' },
        { value: 'isActive', label: 'Status konta', valueType: 'boolean' },
        { value: 'courseId', label: 'Kurs', valueType: 'course' },
        {
            value: 'hasOverduePayments',
            label: 'Zaległości',
            valueType: 'boolean',
        },
        {
            value: 'hasUpcomingLesson',
            label: 'Zaplanowana jazda',
            valueType: 'boolean',
        },
        { value: 'createdAt', label: 'Data dodania', valueType: 'date' },
    ];

const conditionsByField: Record<
    StudentAdvancedFilterField,
    StudentAdvancedFilterConditionOption[]
> = {
    firstName: [
        { value: 'contains', label: 'zawiera', operator: 'contains' },
        {
            value: 'not_contains',
            label: 'nie zawiera',
            operator: 'not_contains',
        },
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
    ],
    lastName: [
        { value: 'contains', label: 'zawiera', operator: 'contains' },
        {
            value: 'not_contains',
            label: 'nie zawiera',
            operator: 'not_contains',
        },
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
    ],
    email: [
        { value: 'contains', label: 'zawiera', operator: 'contains' },
        {
            value: 'not_contains',
            label: 'nie zawiera',
            operator: 'not_contains',
        },
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
    ],
    phone: [
        { value: 'contains', label: 'zawiera', operator: 'contains' },
        {
            value: 'not_contains',
            label: 'nie zawiera',
            operator: 'not_contains',
        },
        { value: 'is_empty', label: 'jest pusty', operator: 'is_empty' },
        {
            value: 'is_not_empty',
            label: 'nie jest pusty',
            operator: 'is_not_empty',
        },
    ],
    pkkNumber: [
        { value: 'contains', label: 'zawiera', operator: 'contains' },
        {
            value: 'not_contains',
            label: 'nie zawiera',
            operator: 'not_contains',
        },
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
        { value: 'is_empty', label: 'jest pusty', operator: 'is_empty' },
        {
            value: 'is_not_empty',
            label: 'nie jest pusty',
            operator: 'is_not_empty',
        },
    ],
    isActive: [
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
    ],
    courseId: [
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
        {
            value: 'is_not_empty',
            label: 'ma dowolny kurs',
            operator: 'is_not_empty',
        },
        { value: 'is_empty', label: 'nie ma kursu', operator: 'is_empty' },
    ],
    hasOverduePayments: [
        { value: 'has', label: 'ma', operator: 'eq', fixedValue: true },
        {
            value: 'not_has',
            label: 'nie ma',
            operator: 'eq',
            fixedValue: false,
        },
    ],
    hasUpcomingLesson: [
        { value: 'has', label: 'ma', operator: 'eq', fixedValue: true },
        {
            value: 'not_has',
            label: 'nie ma',
            operator: 'eq',
            fixedValue: false,
        },
    ],
    createdAt: [
        { value: 'before', label: 'przed', operator: 'before' },
        { value: 'after', label: 'po', operator: 'after' },
        { value: 'between', label: 'pomiędzy', operator: 'between' },
    ],
};

export function getStudentAdvancedFilterFieldLabel(
    field: StudentAdvancedFilterField,
): string {
    return (
        studentAdvancedFilterFieldConfigs.find((item) => item.value === field)
            ?.label ?? field
    );
}

export function getStudentAdvancedFilterConditions(
    field: StudentAdvancedFilterField,
): StudentAdvancedFilterConditionOption[] {
    return conditionsByField[field];
}

export function getDefaultStudentAdvancedFilterDraft(): StudentAdvancedFilterDraft {
    return {
        field: 'pkkNumber',
        condition: 'is_empty',
    };
}

export function getStudentAdvancedFilterDraftFromRule(
    rule: StudentAdvancedFilter,
): StudentAdvancedFilterDraft {
    if (
        rule.field === 'hasOverduePayments' ||
        rule.field === 'hasUpcomingLesson'
    ) {
        return {
            id: rule.id,
            field: rule.field,
            condition: rule.value ? 'has' : 'not_has',
        };
    }

    if (rule.field === 'createdAt' && rule.operator === 'between') {
        return {
            id: rule.id,
            field: rule.field,
            condition: rule.operator,
            value: rule.value[0],
            valueTo: rule.value[1],
        };
    }

    return {
        id: rule.id,
        field: rule.field,
        condition: rule.operator,
        value: 'value' in rule ? rule.value : undefined,
    };
}

export function getDefaultConditionForField(
    field: StudentAdvancedFilterField,
): string {
    return conditionsByField[field][0]?.value ?? '';
}

function getCondition(
    field: StudentAdvancedFilterField,
    condition: string,
): StudentAdvancedFilterConditionOption | null {
    return (
        conditionsByField[field].find((item) => item.value === condition) ??
        null
    );
}

export function studentAdvancedFilterRequiresValue(
    field: StudentAdvancedFilterField,
    condition: string,
): boolean {
    const item = getCondition(field, condition);

    return Boolean(
        item &&
        item.operator !== 'is_empty' &&
        item.operator !== 'is_not_empty' &&
        item.fixedValue === undefined,
    );
}

function getInitialValueForField(
    field: StudentAdvancedFilterField,
): string | boolean | undefined {
    if (field === 'isActive') {
        return true;
    }

    return undefined;
}

function preserveValueForCondition(
    draft: StudentAdvancedFilterDraft,
    condition: string,
): Pick<StudentAdvancedFilterDraft, 'value' | 'valueTo'> {
    if (!studentAdvancedFilterRequiresValue(draft.field, condition)) {
        return {
            value: undefined,
            valueTo: undefined,
        };
    }

    if (draft.field === 'isActive') {
        return {
            value:
                typeof draft.value === 'boolean'
                    ? draft.value
                    : getInitialValueForField(draft.field),
            valueTo: undefined,
        };
    }

    if (draft.field === 'createdAt') {
        return {
            value: typeof draft.value === 'string' ? draft.value : undefined,
            valueTo:
                condition === 'between' && typeof draft.valueTo === 'string'
                    ? draft.valueTo
                    : undefined,
        };
    }

    return {
        value: typeof draft.value === 'string' ? draft.value : undefined,
        valueTo: undefined,
    };
}

export function getStudentAdvancedFilterDraftForFieldChange(
    draft: StudentAdvancedFilterDraft,
    field: StudentAdvancedFilterField,
): StudentAdvancedFilterDraft {
    return {
        id: draft.id,
        field,
        condition: getDefaultConditionForField(field),
        value: getInitialValueForField(field),
        valueTo: undefined,
    };
}

export function getStudentAdvancedFilterDraftForConditionChange(
    draft: StudentAdvancedFilterDraft,
    condition: string,
): StudentAdvancedFilterDraft | null {
    const option = getCondition(draft.field, condition);

    if (!option) {
        return null;
    }

    return {
        id: draft.id,
        field: draft.field,
        condition,
        ...preserveValueForCondition(draft, condition),
    };
}

export function buildStudentAdvancedFilterFromDraft(
    draft: StudentAdvancedFilterDraft,
): StudentAdvancedFilter | null {
    const condition = getCondition(draft.field, draft.condition);

    if (!condition) {
        return null;
    }

    const baseId = draft.id ?? crypto.randomUUID();

    if (
        draft.field === 'hasOverduePayments' ||
        draft.field === 'hasUpcomingLesson'
    ) {
        if (condition.fixedValue === undefined) return null;

        return {
            id: baseId,
            field: draft.field,
            operator: 'eq',
            value: condition.fixedValue,
        };
    }

    if (
        condition.operator === 'is_empty' ||
        condition.operator === 'is_not_empty'
    ) {
        if (
            draft.field !== 'phone' &&
            draft.field !== 'pkkNumber' &&
            draft.field !== 'courseId'
        ) {
            return null;
        }

        return {
            id: baseId,
            field: draft.field,
            operator: condition.operator,
        } as StudentAdvancedFilter;
    }

    if (draft.field === 'isActive') {
        if (condition.operator !== 'eq' && condition.operator !== 'neq')
            return null;

        if (typeof draft.value !== 'boolean') return null;

        return {
            id: baseId,
            field: draft.field,
            operator: condition.operator,
            value: draft.value,
        };
    }

    if (draft.field === 'courseId') {
        if (condition.operator !== 'eq' && condition.operator !== 'neq')
            return null;

        if (
            typeof draft.value !== 'string' ||
            draft.value.trim().length === 0
        ) {
            return null;
        }

        return {
            id: baseId,
            field: draft.field,
            operator: condition.operator,
            value: draft.value.trim(),
        };
    }

    if (draft.field === 'createdAt') {
        if (condition.operator === 'before' || condition.operator === 'after') {
            if (
                typeof draft.value !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(draft.value)
            ) {
                return null;
            }

            return {
                id: baseId,
                field: draft.field,
                operator: condition.operator,
                value: draft.value,
            };
        }

        if (condition.operator === 'between') {
            if (
                typeof draft.value !== 'string' ||
                typeof draft.valueTo !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(draft.value) ||
                !/^\d{4}-\d{2}-\d{2}$/.test(draft.valueTo) ||
                draft.value > draft.valueTo
            ) {
                return null;
            }

            return {
                id: baseId,
                field: draft.field,
                operator: 'between',
                value: [draft.value, draft.valueTo],
            };
        }

        return null;
    }

    if (typeof draft.value !== 'string' || draft.value.trim().length === 0) {
        return null;
    }

    return {
        id: baseId,
        field: draft.field,
        operator: condition.operator as StudentTextFilterOperator,
        value: draft.value.trim(),
    } as StudentAdvancedFilter;
}

export function stripStudentAdvancedFilterId(
    rule: StudentAdvancedFilter,
): StudentAdvancedFilterApiRule {
    const { id: _id, ...apiRule } = rule;

    return apiRule;
}

export function validateStudentAdvancedFilters(
    input: unknown,
): StudentAdvancedFilterApiRule[] {
    return studentAdvancedFiltersApiSchema.parse(input);
}

export function parseStudentAdvancedFiltersParam(
    raw: string | null | undefined,
): StudentAdvancedFilterApiRule[] {
    const value = raw?.trim() ?? '';

    if (!value) {
        return [];
    }

    if (value.length > studentAdvancedFiltersMaxBytes) {
        throw new Error('Parametr filters jest za długi.');
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(value);
    } catch {
        throw new Error('Parametr filters musi być poprawnym JSON.');
    }

    return validateStudentAdvancedFilters(parsed);
}

export function serializeStudentAdvancedFilters(
    filters: readonly StudentAdvancedFilter[],
): string | null {
    if (filters.length === 0) {
        return null;
    }

    const payload = filters.map(stripStudentAdvancedFilterId);
    const normalized = validateStudentAdvancedFilters(payload);
    const json = JSON.stringify(normalized);

    if (json.length > studentAdvancedFiltersMaxBytes) {
        throw new Error('Parametr filters jest za długi.');
    }

    return json;
}

export function areStudentAdvancedFiltersEqual(
    a: StudentAdvancedFilterApiRule,
    b: StudentAdvancedFilterApiRule,
): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function isDuplicateStudentAdvancedFilter(
    filters: readonly StudentAdvancedFilter[],
    candidate: StudentAdvancedFilter,
): boolean {
    const candidateApi = stripStudentAdvancedFilterId(candidate);

    return filters.some(
        (filter) =>
            filter.id !== candidate.id &&
            areStudentAdvancedFiltersEqual(
                stripStudentAdvancedFilterId(filter),
                candidateApi,
            ),
    );
}

export function formatStudentAdvancedFilterLabel(
    rule: StudentAdvancedFilterApiRule,
    courses: readonly StudentAdvancedFilterCourseOption[] = [],
): string {
    return formatStudentAdvancedFilterSegments(rule, courses)
        .map((segment) => segment.label)
        .join(' ');
}

export function formatStudentAdvancedFilterSegments(
    rule: StudentAdvancedFilterApiRule,
    courses: readonly StudentAdvancedFilterCourseOption[] = [],
): StudentAdvancedFilterLabelSegment[] {
    const fieldLabel = getStudentAdvancedFilterFieldLabel(rule.field);
    const ruleCondition = getCondition(rule.field, rule.operator);
    const conditionLabel =
        rule.field === 'hasOverduePayments' ||
        rule.field === 'hasUpcomingLesson'
            ? rule.value
                ? 'ma'
                : 'nie ma'
            : (ruleCondition?.label ?? rule.operator);

    if (
        !('value' in rule) ||
        rule.field === 'hasOverduePayments' ||
        rule.field === 'hasUpcomingLesson'
    ) {
        return [
            { label: fieldLabel, tone: 'field' },
            { label: conditionLabel, tone: 'operator' },
        ];
    }

    if (rule.field === 'isActive') {
        return [
            { label: fieldLabel, tone: 'field' },
            { label: conditionLabel, tone: 'operator' },
            {
                label: rule.value ? 'Aktywny' : 'Nieaktywny',
                tone: 'value',
            },
        ];
    }

    if (rule.field === 'courseId') {
        const course = courses.find((item) => item.id === rule.value);
        const label = course
            ? `${course.name}${course.category ? ` (${course.category})` : ''}`
            : rule.value;

        return [
            { label: fieldLabel, tone: 'field' },
            { label: conditionLabel, tone: 'operator' },
            { label, tone: 'value' },
        ];
    }

    if (rule.field === 'createdAt' && rule.operator === 'between') {
        return [
            { label: fieldLabel, tone: 'field' },
            { label: conditionLabel, tone: 'operator' },
            { label: `${rule.value[0]} - ${rule.value[1]}`, tone: 'value' },
        ];
    }

    return [
        { label: fieldLabel, tone: 'field' },
        { label: conditionLabel, tone: 'operator' },
        { label: String(rule.value), tone: 'value' },
    ];
}
