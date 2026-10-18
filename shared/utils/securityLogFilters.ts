import { z } from 'zod';
import type { AdvancedFilterSegment } from './advancedFilters';

export const securityLogFilterFields = [
    'occurredAt',
    'type',
    'category',
    'severity',
    'outcome',
    'operationCode',
    'actorRole',
    'actorVisibility',
    'reasonCode',
    'httpStatus',
    'actorUserId',
    'targetUserId',
    'clientIp',
] as const;
export type SecurityLogFilterField = (typeof securityLogFilterFields)[number];
export type SecurityLogFilterOperator =
    | 'on'
    | 'before'
    | 'after'
    | 'between'
    | 'is'
    | 'isNot'
    | 'oneOf'
    | 'isEmpty';
export interface SecurityLogFilterRule {
    field: SecurityLogFilterField;
    operator: SecurityLogFilterOperator;
    value?: string | string[] | { from: string; to: string };
}
export interface SecurityLogFilter extends SecurityLogFilterRule {
    id: string;
}
export interface SecurityLogFilterDraft {
    id?: string;
    field: SecurityLogFilterField;
    operator: SecurityLogFilterOperator;
    value: string;
    valueTo: string;
}

export const securityLogFieldConfigs: readonly {
    value: SecurityLogFilterField;
    label: string;
    kind: 'date' | 'choice' | 'person' | 'text';
}[] = [
    { value: 'occurredAt', label: 'Data zdarzenia', kind: 'date' },
    { value: 'type', label: 'Typ zdarzenia', kind: 'choice' },
    { value: 'category', label: 'Kategoria', kind: 'choice' },
    { value: 'severity', label: 'Ważność', kind: 'choice' },
    { value: 'outcome', label: 'Wynik', kind: 'choice' },
    { value: 'operationCode', label: 'Operacja', kind: 'choice' },
    { value: 'actorRole', label: 'Rola wykonawcy', kind: 'choice' },
    { value: 'actorVisibility', label: 'Wykonawca', kind: 'choice' },
    { value: 'reasonCode', label: 'Powód odmowy', kind: 'choice' },
    { value: 'httpStatus', label: 'Kod HTTP', kind: 'choice' },
    { value: 'actorUserId', label: 'Osoba wykonująca', kind: 'person' },
    { value: 'targetUserId', label: 'Konto docelowe', kind: 'person' },
    { value: 'clientIp', label: 'Adres IP', kind: 'text' },
];

export const securityLogFilterChoices: Partial<
    Record<SecurityLogFilterField, readonly { value: string; label: string }[]>
> = {
    type: [
        { value: 'LOGIN_SUCCEEDED', label: 'Udane logowanie' },
        { value: 'LOGIN_FAILED', label: 'Nieudane logowanie' },
        { value: 'LOGIN_DENIED', label: 'Odmowa logowania' },
        { value: 'LOGIN_PROVIDER_ERROR', label: 'Błąd dostawcy logowania' },
        { value: 'LOGIN_RATE_LIMITED', label: 'Ograniczenie prób logowania' },
        {
            value: 'REPEATED_LOGIN_FAILURES',
            label: 'Wielokrotne nieudane logowania',
        },
        { value: 'LOGOUT_SUCCEEDED', label: 'Wylogowanie' },
        {
            value: 'LOGOUT_PROVIDER_REVOCATION_FAILED',
            label: 'Nieudane unieważnienie sesji u dostawcy',
        },
        { value: 'SESSION_REVOKED', label: 'Unieważnienie sesji' },
        { value: 'REVOKED_SESSION_USED', label: 'Użycie unieważnionej sesji' },
        { value: 'AUTHENTICATION_REQUIRED', label: 'Wymagane logowanie' },
        { value: 'SESSION_REJECTED', label: 'Odrzucona sesja' },
        { value: 'SESSION_REFRESH_FAILED', label: 'Nieudane odnowienie sesji' },
        { value: 'ACCESS_DENIED', label: 'Odmowa dostępu' },
        { value: 'PASSWORD_RESET_REQUESTED', label: 'Żądanie resetu hasła' },
        { value: 'PASSWORD_RESET_FAILED', label: 'Nieudany reset hasła' },
        { value: 'PASSWORD_CHANGED', label: 'Zmiana hasła' },
        { value: 'PASSWORD_CHANGE_STARTED', label: 'Rozpoczęcie zmiany hasła' },
        {
            value: 'PASSWORD_CHANGE_COMPLETED',
            label: 'Zakończenie zmiany hasła',
        },
        {
            value: 'PASSWORD_CHANGE_REPAIR_REQUIRED',
            label: 'Zmiana hasła wymaga sprawdzenia',
        },
        { value: 'ACCOUNT_CREATED', label: 'Utworzenie konta' },
        { value: 'ACCOUNT_BLOCKED', label: 'Zablokowanie konta' },
        { value: 'ACCOUNT_UNBLOCKED', label: 'Odblokowanie konta' },
        { value: 'ACCOUNT_ARCHIVED', label: 'Archiwizacja konta' },
        {
            value: 'ACCOUNT_EMAIL_CHANGE_REQUESTED',
            label: 'Żądanie zmiany e-maila',
        },
        { value: 'ACCOUNT_EMAIL_CHANGED', label: 'Zmiana e-maila konta' },
        { value: 'ACCOUNT_CHANGE_FAILED', label: 'Nieudana zmiana konta' },
        {
            value: 'ACCOUNT_CHANGE_REPAIR_REQUIRED',
            label: 'Zmiana konta wymaga sprawdzenia',
        },
    ],
    category: [
        { value: 'AUTH', label: 'Logowanie i hasła' },
        { value: 'SESSION', label: 'Sesje' },
        { value: 'ACCESS', label: 'Uprawnienia' },
        { value: 'ACCOUNT', label: 'Konta' },
        { value: 'DETECTION', label: 'Wykryte zagrożenia' },
    ],
    severity: [
        { value: 'INFO', label: 'Informacja' },
        { value: 'WARNING', label: 'Ostrzeżenie' },
        { value: 'HIGH', label: 'Wysoka' },
    ],
    outcome: [
        { value: 'SUCCESS', label: 'Sukces' },
        { value: 'DENIED', label: 'Odmowa' },
        { value: 'FAILURE', label: 'Niepowodzenie' },
        { value: 'DETECTED', label: 'Wykryto' },
    ],
    actorRole: [
        { value: 'MANAGER', label: 'Manager' },
        { value: 'ADMIN', label: 'Administrator' },
        { value: 'INSTRUCTOR', label: 'Instruktor' },
        { value: 'STUDENT', label: 'Kursant' },
    ],
    actorVisibility: [
        { value: 'KNOWN', label: 'Znany' },
        { value: 'UNKNOWN', label: 'Nieustalony' },
        { value: 'EXTERNAL', label: 'Zewnętrzny' },
    ],
};

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function validCalendarDate(value: string): boolean {
    if (!date.safeParse(value).success) return false;

    const parsed = new Date(`${value}T12:00:00Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
    );
}

const field = z.enum(securityLogFilterFields);
const ruleSchema = z
    .object({
        field,
        operator: z.enum([
            'on',
            'before',
            'after',
            'between',
            'is',
            'isNot',
            'oneOf',
            'isEmpty',
        ]),
        value: z
            .union([
                z.string().max(120),
                z.array(z.string().min(1).max(120)).min(1).max(20),
                z.object({ from: date, to: date }).strict(),
            ])
            .optional(),
    })
    .strict()
    .superRefine((rule, context) => {
        const isDate = rule.field === 'occurredAt';
        const isPerson =
            rule.field === 'actorUserId' || rule.field === 'targetUserId';
        const operators = isDate
            ? ['on', 'before', 'after', 'between']
            : rule.field === 'clientIp'
              ? ['is', 'isNot', 'isEmpty']
              : isPerson
                ? ['is', 'isNot']
                : ['is', 'isNot', 'oneOf'];

        if (!operators.includes(rule.operator))
            context.addIssue({
                code: 'custom',
                message: 'Nieprawidłowy operator.',
            });

        if (rule.operator === 'isEmpty') {
            if (rule.value !== undefined)
                context.addIssue({
                    code: 'custom',
                    message: 'Filtr pustej wartości nie przyjmuje wartości.',
                });
        } else if (rule.operator === 'between') {
            if (
                !rule.value ||
                typeof rule.value !== 'object' ||
                Array.isArray(rule.value) ||
                rule.value.from > rule.value.to ||
                !validCalendarDate(rule.value.from) ||
                !validCalendarDate(rule.value.to)
            )
                context.addIssue({
                    code: 'custom',
                    message: 'Nieprawidłowy zakres dat.',
                });
        } else if (rule.operator === 'oneOf') {
            if (
                !Array.isArray(rule.value) ||
                new Set(rule.value).size !== rule.value.length
            )
                context.addIssue({
                    code: 'custom',
                    message: 'Wybierz różne wartości.',
                });
        } else if (
            typeof rule.value !== 'string' ||
            !rule.value.trim() ||
            (isDate && !validCalendarDate(rule.value)) ||
            (rule.field === 'httpStatus' && !/^[1-5]\d\d$/.test(rule.value))
        ) {
            context.addIssue({
                code: 'custom',
                message: 'Wpisz poprawną wartość.',
            });
        }
    });

export const securityLogFiltersSchema = z
    .object({ rules: z.array(ruleSchema).max(10) })
    .strict();

export function parseSecurityLogFilters(
    raw: string,
): { rules: SecurityLogFilterRule[] } | null {
    if (new TextEncoder().encode(raw).length > 4096) return null;

    try {
        const parsed = securityLogFiltersSchema.safeParse(JSON.parse(raw));

        if (!parsed.success) return null;

        const rules = parsed.data.rules as SecurityLogFilterRule[];

        if (
            new Set(rules.map((rule) => JSON.stringify(rule))).size !==
            rules.length
        )
            return null;

        return { rules };
    } catch {
        return null;
    }
}

export function createSecurityLogFilterDraft(
    filter?: SecurityLogFilter,
): SecurityLogFilterDraft {
    return {
        id: filter?.id,
        field: filter?.field ?? 'occurredAt',
        operator: filter?.operator ?? 'on',
        value: Array.isArray(filter?.value)
            ? filter.value.join(', ')
            : typeof filter?.value === 'string'
              ? filter.value
              : (filter?.value?.from ?? ''),
        valueTo:
            typeof filter?.value === 'object' && !Array.isArray(filter.value)
                ? filter.value.to
                : '',
    };
}

export function buildSecurityLogFilter(
    draft: SecurityLogFilterDraft,
): SecurityLogFilter | null {
    const value =
        draft.operator === 'isEmpty'
            ? undefined
            : draft.operator === 'between'
              ? { from: draft.value, to: draft.valueTo }
              : draft.operator === 'oneOf'
                ? draft.value
                      .split(',')
                      .map((part) => part.trim())
                      .filter(Boolean)
                : draft.value.trim();
    const candidate = {
        field: draft.field,
        operator: draft.operator,
        ...(value !== undefined ? { value } : {}),
    };

    if (!ruleSchema.safeParse(candidate).success) return null;

    return {
        ...candidate,
        id: draft.id ?? crypto.randomUUID(),
    } as SecurityLogFilter;
}

export function securityLogFilterLabel(rule: SecurityLogFilterRule): string {
    const fieldLabel =
        securityLogFieldConfigs.find((item) => item.value === rule.field)
            ?.label ?? rule.field;
    const operatorLabel: Record<SecurityLogFilterOperator, string> = {
        on: 'dnia',
        before: 'przed',
        after: 'po',
        between: 'pomiędzy',
        is: 'jest',
        isNot: 'nie jest',
        oneOf: 'jeden z',
        isEmpty: 'brak danych',
    };
    const choiceLabels = new Map(
        (securityLogFilterChoices[rule.field] ?? []).map((choice) => [
            choice.value,
            choice.label,
        ]),
    );
    const displayChoice = (value: string) => choiceLabels.get(value) ?? value;
    const value =
        rule.value &&
        typeof rule.value === 'object' &&
        !Array.isArray(rule.value)
            ? `${rule.value.from} – ${rule.value.to}`
            : Array.isArray(rule.value)
              ? rule.value.map(displayChoice).join(', ')
              : typeof rule.value === 'string'
                ? displayChoice(rule.value)
                : '';

    return `${fieldLabel} ${operatorLabel[rule.operator]} ${value}`.trim();
}

export function securityLogFilterSegments(
    rule: SecurityLogFilterRule,
): AdvancedFilterSegment[] {
    const label = securityLogFilterLabel(rule);
    const fieldLabel =
        securityLogFieldConfigs.find((item) => item.value === rule.field)
            ?.label ?? rule.field;

    return [
        { tone: 'field', label: fieldLabel },
        { tone: 'value', label: label.slice(fieldLabel.length).trim() },
    ];
}
