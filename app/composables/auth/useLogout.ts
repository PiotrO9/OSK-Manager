export interface LogoutOptions {
    redirectTo?: string;
}

export function useLogout() {
    const { logout } = useAuthSession();

    async function handleLogout(options?: LogoutOptions) {
        const redirectPath = options?.redirectTo || '/login';

        await logout({ preserveSessionUntilNavigation: true });

        window.location.replace(redirectPath);
    }

    return {
        handleLogout,
    };
}
