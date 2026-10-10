export function isPublicAuthPath(path: string): boolean {
    return (
        path === '/login' ||
        path.startsWith('/login/') ||
        path === '/forgot-password' ||
        path === '/reset-password'
    );
}
