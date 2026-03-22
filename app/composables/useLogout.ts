export interface LogoutOptions {
    redirectTo?: string;
    showToast?: boolean;
}

export function useLogout() {
    const { session, logout } = useAuthSession();
    const { addToast } = useToast();

    async function handleLogout(options?: LogoutOptions) {
        const userName = session.value?.userName || 'User';
        const redirectPath = options?.redirectTo || '/login';
        const shouldShowToast = options?.showToast ?? true;

        await logout();

        if (shouldShowToast) {
            addToast({
                title: 'Wylogowano',
                description: `Do zobaczenia, ${userName}!`,
                variant: 'success',
            });
        }

        navigateTo(redirectPath);
    }

    return {
        handleLogout,
    };
}
