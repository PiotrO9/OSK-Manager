import { matchAppRoute } from '../routing/routePaths';

export function isPublicAuthPath(path: string): boolean {
    const key = matchAppRoute(path)?.definition.key;

    return (
        key === 'login' || key === 'forgotPassword' || key === 'resetPassword'
    );
}
