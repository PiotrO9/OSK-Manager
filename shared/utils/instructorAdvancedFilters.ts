import type { AdvancedFilterSegment } from './advancedFilters';

export const instructorAdvancedFilterMaxCount = 8;

export const instructorAdvancedFilterFields = [
    'email',
    'phone',
    'qualification',
    'hasQualifications',
] as const;

export type InstructorAdvancedFilterField =
    (typeof instructorAdvancedFilterFields)[number];

export type InstructorTextFilterOperator =
    | 'contains'
    | 'not_contains'
    | 'eq'
    | 'neq';
export type InstructorEmptyFilterOperator = 'is_empty' | 'is_not_empty';
export type InstructorAdvancedFilterOperator =
    | InstructorTextFilterOperator
    | InstructorEmptyFilterOperator;

export type InstructorAdvancedFilterRule =
    | {
          field: 'email';
          operator:
              | InstructorTextFilterOperator
              | InstructorEmptyFilterOperator;
          value?: string;
      }
    | {
          field: 'phone';
          operator: 'contains' | 'not_contains' | InstructorEmptyFilterOperator;
          value?: string;
      }
    | {
          field: 'qualification';
          operator: 'eq' | 'neq';
          value: string;
      }
    | {
          field: 'hasQualifications';
          operator: 'eq';
          value: boolean;
      };

export type InstructorAdvancedFilter = InstructorAdvancedFilterRule & {
    id: string;
};

export interface InstructorAdvancedFilterQualificationOption {
    id: string;
    code: string;
    name: string;
}

export interface InstructorAdvancedFilterFieldConfig {
    value: InstructorAdvancedFilterField;
    label: string;
    valueType: 'text' | 'qualification' | 'none';
}

export interface InstructorAdvancedFilterConditionOption {
    value: string;
    label: string;
    operator: InstructorAdvancedFilterOperator | 'eq' | 'neq';
    fixedValue?: boolean;
}

export interface InstructorAdvancedFilterDraft {
    id?: string;
    field: InstructorAdvancedFilterField;
    condition: string;
    value?: string | boolean;
}

export type InstructorAdvancedFilterLabelSegment = AdvancedFilterSegment;

export const instructorAdvancedFilterFieldConfigs: InstructorAdvancedFilterFieldConfig[] =
    [
        { value: 'email', label: 'E-mail', valueType: 'text' },
        { value: 'phone', label: 'Telefon', valueType: 'text' },
        {
            value: 'qualification',
            label: 'Kwalifikacja',
            valueType: 'qualification',
        },
        {
            value: 'hasQualifications',
            label: 'Kwalifikacje',
            valueType: 'none',
        },
    ];

const textConditions: InstructorAdvancedFilterConditionOption[] = [
    { value: 'contains', label: 'zawiera', operator: 'contains' },
    { value: 'not_contains', label: 'nie zawiera', operator: 'not_contains' },
    { value: 'eq', label: 'jest', operator: 'eq' },
    { value: 'neq', label: 'nie jest', operator: 'neq' },
    { value: 'is_empty', label: 'jest pusty', operator: 'is_empty' },
    {
        value: 'is_not_empty',
        label: 'nie jest pusty',
        operator: 'is_not_empty',
    },
];

const phoneConditions: InstructorAdvancedFilterConditionOption[] = [
    { value: 'contains', label: 'zawiera', operator: 'contains' },
    { value: 'not_contains', label: 'nie zawiera', operator: 'not_contains' },
    { value: 'is_empty', label: 'jest pusty', operator: 'is_empty' },
    {
        value: 'is_not_empty',
        label: 'nie jest pusty',
        operator: 'is_not_empty',
    },
];

const conditionsByField: Record<
    InstructorAdvancedFilterField,
    InstructorAdvancedFilterConditionOption[]
> = {
    email: textConditions,
    phone: phoneConditions,
    qualification: [
        { value: 'eq', label: 'jest', operator: 'eq' },
        { value: 'neq', label: 'nie jest', operator: 'neq' },
    ],
    hasQualifications: [
        { value: 'has', label: 'ma', operator: 'eq', fixedValue: true },
        {
            value: 'not_has',
            label: 'nie ma',
            operator: 'eq',
            fixedValue: false,
        },
    ],
};

export function getInstructorAdvancedFilterFieldLabel(
    field: InstructorAdvancedFilterField,
): string {
    return (
        instructorAdvancedFilterFieldConfigs.find(
            (item) => item.value === field,
        )?.label ?? field
    );
}

export function getInstructorAdvancedFilterConditions(
    field: InstructorAdvancedFilterField,
): InstructorAdvancedFilterConditionOption[] {
    return conditionsByField[field];
}

export function getDefaultInstructorAdvancedFilterDraft(): InstructorAdvancedFilterDraft {
    return {
        field: 'qualification',
        condition: 'eq',
    };
}

export function getInstructorAdvancedFilterDraftFromRule(
    rule: InstructorAdvancedFilter,
): InstructorAdvancedFilterDraft {
    if (rule.field === 'hasQualifications') {
        return {
            id: rule.id,
            field: rule.field,
            condition: rule.value ? 'has' : 'not_has',
        };
    }

    return {
        id: rule.id,
        field: rule.field,
        condition: rule.operator,
        value: 'value' in rule ? rule.value : undefined,
    };
}

export function getDefaultInstructorConditionForField(
    field: InstructorAdvancedFilterField,
): string {
    return conditionsByField[field][0]?.value ?? '';
}

function getCondition(
    field: InstructorAdvancedFilterField,
    condition: string,
): InstructorAdvancedFilterConditionOption | null {
    return (
        conditionsByField[field].find((item) => item.value === condition) ??
        null
    );
}

export function instructorAdvancedFilterRequiresValue(
    field: InstructorAdvancedFilterField,
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

function preserveValueForCondition(
    draft: InstructorAdvancedFilterDraft,
    condition: string,
): Pick<InstructorAdvancedFilterDraft, 'value'> {
    if (!instructorAdvancedFilterRequiresValue(draft.field, condition)) {
        return { value: undefined };
    }

    return {
        value: typeof draft.value === 'string' ? draft.value : undefined,
    };
}

export function getInstructorAdvancedFilterDraftForFieldChange(
    draft: InstructorAdvancedFilterDraft,
    field: InstructorAdvancedFilterField,
): InstructorAdvancedFilterDraft {
    return {
        id: draft.id,
        field,
        condition: getDefaultInstructorConditionForField(field),
        value: undefined,
    };
}

export function getInstructorAdvancedFilterDraftForConditionChange(
    draft: InstructorAdvancedFilterDraft,
    condition: string,
): InstructorAdvancedFilterDraft | null {
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

export function buildInstructorAdvancedFilterFromDraft(
    draft: InstructorAdvancedFilterDraft,
): InstructorAdvancedFilter | null {
    const condition = getCondition(draft.field, draft.condition);

    if (!condition) {
        return null;
    }

    const baseId = draft.id ?? crypto.randomUUID();

    if (draft.field === 'hasQualifications') {
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
        if (draft.field !== 'email' && draft.field !== 'phone') {
            return null;
        }

        return {
            id: baseId,
            field: draft.field,
            operator: condition.operator,
        } as InstructorAdvancedFilter;
    }

    if (typeof draft.value !== 'string' || draft.value.trim().length === 0) {
        return null;
    }

    if (draft.field === 'qualification') {
        if (condition.operator !== 'eq' && condition.operator !== 'neq') {
            return null;
        }

        return {
            id: baseId,
            field: draft.field,
            operator: condition.operator,
            value: draft.value.trim(),
        };
    }

    return {
        id: baseId,
        field: draft.field,
        operator: condition.operator as InstructorTextFilterOperator,
        value: draft.value.trim(),
    } as InstructorAdvancedFilter;
}

export function stripInstructorAdvancedFilterId(
    rule: InstructorAdvancedFilter,
): InstructorAdvancedFilterRule {
    const { id: _id, ...apiRule } = rule;

    return apiRule;
}

export function areInstructorAdvancedFiltersEqual(
    a: InstructorAdvancedFilterRule,
    b: InstructorAdvancedFilterRule,
): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function isDuplicateInstructorAdvancedFilter(
    filters: readonly InstructorAdvancedFilter[],
    candidate: InstructorAdvancedFilter,
): boolean {
    const candidateApi = stripInstructorAdvancedFilterId(candidate);

    return filters.some(
        (filter) =>
            filter.id !== candidate.id &&
            areInstructorAdvancedFiltersEqual(
                stripInstructorAdvancedFilterId(filter),
                candidateApi,
            ),
    );
}

function formatQualificationOptionLabel(
    value: string,
    qualifications: readonly InstructorAdvancedFilterQualificationOption[],
): string {
    const option = qualifications.find((item) => item.id === value);

    if (!option) {
        return value;
    }

    return option.name.trim() && option.name.trim() !== option.code.trim()
        ? `${option.code} - ${option.name}`
        : option.code;
}

export function formatInstructorAdvancedFilterLabel(
    rule: InstructorAdvancedFilterRule,
    qualifications: readonly InstructorAdvancedFilterQualificationOption[] = [],
): string {
    return formatInstructorAdvancedFilterSegments(rule, qualifications)
        .map((segment) => segment.label)
        .join(' ');
}

export function formatInstructorAdvancedFilterSegments(
    rule: InstructorAdvancedFilterRule,
    qualifications: readonly InstructorAdvancedFilterQualificationOption[] = [],
): InstructorAdvancedFilterLabelSegment[] {
    const fieldLabel = getInstructorAdvancedFilterFieldLabel(rule.field);
    const ruleCondition =
        rule.field === 'hasQualifications'
            ? conditionsByField.hasQualifications.find((item) =>
                  rule.value ? item.value === 'has' : item.value === 'not_has',
              )
            : getCondition(rule.field, rule.operator);
    const conditionLabel = ruleCondition?.label ?? rule.operator;

    if (!('value' in rule) || rule.field === 'hasQualifications') {
        return [
            { label: fieldLabel, tone: 'field' },
            { label: conditionLabel, tone: 'operator' },
        ];
    }

    return [
        { label: fieldLabel, tone: 'field' },
        { label: conditionLabel, tone: 'operator' },
        {
            label:
                rule.field === 'qualification'
                    ? formatQualificationOptionLabel(
                          String(rule.value),
                          qualifications,
                      )
                    : String(rule.value),
            tone: 'value',
        },
    ];
}
