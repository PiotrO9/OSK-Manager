export type KeyboardShortcutKey = 'Enter' | ' ' | 'Escape';

export function useKeyboardShortcut(
    key: KeyboardShortcutKey | KeyboardShortcutKey[],
    handler: (event: KeyboardEvent) => void,
) {
    function handleKeyDown(event: KeyboardEvent) {
        if (!event) return;

        const keys = Array.isArray(key) ? key : [key];

        if (keys.includes('Enter') || keys.includes(' ')) {
            if (isEnterOrSpaceKey(event)) {
                event.preventDefault();
                handler(event);

                return;
            }
        }

        if (keys.includes('Escape') && event.key === 'Escape') {
            event.preventDefault();
            handler(event);

            return;
        }

        if (keys.includes(event.key as KeyboardShortcutKey)) {
            event.preventDefault();
            handler(event);
        }
    }

    return {
        handleKeyDown,
    };
}
