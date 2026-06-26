export type KeyboardActivationKey = 'Enter' | ' ';

export function isEnterOrSpaceKey(event: KeyboardEvent): boolean {
    if (!event) return false;

    return event.key === 'Enter' || event.key === ' ';
}
