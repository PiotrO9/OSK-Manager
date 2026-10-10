import { signalLogoutToOtherTabs } from '~/utils/auth/authLogoutSignal';

export interface LogoutOptions {
    redirectTo?: string;
}

export function useLogout() {
    const { logout } = useAuthSession();
    const { addToast } = useAppToast();
    const isLoggingOut = useState<boolean>('auth_logging_out', () => false);

    async function handleLogout(options?: LogoutOptions) {
        if (isLoggingOut.value) return;

        const redirectPath = options?.redirectTo || '/login';

        isLoggingOut.value = true;
        const succeeded = await logout({
            preserveSessionUntilNavigation: true,
        });

        if (!succeeded) {
            isLoggingOut.value = false;
            addToast({
                title: 'Nie udało się wylogować',
                description: 'Sprawdź połączenie i spróbuj ponownie.',
                variant: 'error',
            });

            return;
        }

        signalLogoutToOtherTabs();
        window.location.replace(redirectPath);
    }

    return {
        handleLogout,
        isLoggingOut: readonly(isLoggingOut),
    };
}
