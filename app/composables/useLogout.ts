export interface LogoutOptions {
    redirectTo?: string;
    showToast?: boolean;
}

export function useLogout() {
    const { session, logout } = useAuthSession();
    const { addToast } = useToast();
    const { t } = useI18n();
    const localePath = useLocalePath();

    async function handleLogout(options?: LogoutOptions) {
        const userName = session.value?.userName || 'User';
        const redirectPath = options?.redirectTo || localePath('/login');
        const shouldShowToast = options?.showToast ?? true;

        await logout();

        if (shouldShowToast) {
            addToast({
                title: t('logoutTitle'),
                description: t('logoutSeeYouLater', { name: userName }),
                variant: 'success',
            });
        }

        navigateTo(redirectPath);
    }

    return {
        handleLogout,
    };
}
