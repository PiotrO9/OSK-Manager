export const AUTH_LOGOUT_STORAGE_KEY = 'osk-auth-logout';

/** The storage event is delivered to other tabs of the same origin. */
export function signalLogoutToOtherTabs(): void {
    try {
        localStorage.setItem(AUTH_LOGOUT_STORAGE_KEY, String(Date.now()));
    } catch {
        // Private browsing settings may disable storage; local logout still works.
    }
}
