import type {
    SecurityLogItem,
    SecurityLogPerson,
} from '~/types/security-logs/securityLog';
import { securityLogFilterChoices } from '~~/shared/utils/securityLogFilters';

const eventLabels = Object.fromEntries(
    (securityLogFilterChoices.type ?? []).map((item) => [
        item.value,
        item.label,
    ]),
);

export function eventLabel(type: string): string {
    return (
        eventLabels[type] ?? type.replaceAll('_', ' ').toLocaleLowerCase('pl')
    );
}

export function severityLabel(severity: string): string {
    return (
        (
            {
                INFO: 'Informacja',
                WARNING: 'Ostrzeżenie',
                HIGH: 'Wysoka',
                CRITICAL: 'Krytyczna',
            } as Record<string, string>
        )[severity] ?? severity
    );
}

export function severityTone(
    severity: string,
): 'neutral' | 'info' | 'warning' | 'danger' {
    return severity === 'CRITICAL' || severity === 'HIGH'
        ? 'danger'
        : severity === 'WARNING'
          ? 'warning'
          : severity === 'INFO'
            ? 'info'
            : 'neutral';
}

export function outcomeLabel(outcome: string): string {
    return (
        (
            {
                SUCCESS: 'Sukces',
                DENIED: 'Odmowa',
                FAILURE: 'Niepowodzenie',
                DETECTED: 'Wykryto',
            } as Record<string, string>
        )[outcome] ?? outcome
    );
}

export function personLabel(person?: SecurityLogPerson | null): string {
    if (!person || person.visibility === 'UNKNOWN') return 'Nieustalony';

    if (person.visibility === 'EXTERNAL') return 'Osoba spoza OSK';

    return person.displayName?.trim() || 'Nieustalony';
}

export function targetLabel(person?: SecurityLogPerson | null): string {
    if (!person?.userId && !person?.displayName) return '—';

    return personLabel(person);
}

export function operationLabel(item: SecurityLogItem): string {
    return item.operationLabel?.trim() || item.operationCode?.trim() || '—';
}

export function eventDate(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('pl-PL', {
              dateStyle: 'medium',
              timeStyle: 'medium',
              timeZone: 'Europe/Warsaw',
          }).format(date);
}
