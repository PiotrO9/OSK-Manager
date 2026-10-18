import { canonicalRouteVariant, routeDefinitions } from './routeDefinitions';
import type { AppRouteKey, RouteVariant } from './routeDefinitions';

export function buildRoutePath(
    key: AppRouteKey,
    params: Record<string, string> = {},
    variant: RouteVariant = canonicalRouteVariant,
): string {
    const definition = routeDefinitions.find((route) => route.key === key)!;

    return definition[variant].replace(/:(\w+)/g, (_, name: string) => {
        const value = params[name];

        if (value === undefined || value === '.' || value === '..') {
            throw new Error(`Invalid parameter ${name} for route ${key}`);
        }

        return encodeURIComponent(value);
    });
}

// Static routes must win over dynamic IDs (e.g. /vehicles/new).
const matchers = routeDefinitions
    .flatMap((definition) =>
        (['en', 'pl'] as const).map((variant) => ({
            definition,
            pattern: definition[variant],
            expression: new RegExp(
                `^${definition[variant].replace(/:\w+/g, '([^/]+)')}/?$`,
                'i',
            ),
        })),
    )
    .sort((left, right) => {
        const leftParams = (left.pattern.match(/:/g) ?? []).length;
        const rightParams = (right.pattern.match(/:/g) ?? []).length;

        return (
            leftParams - rightParams ||
            right.pattern.length - left.pattern.length
        );
    });

export function matchAppRoute(pathname: string) {
    if (
        !pathname.startsWith('/') ||
        pathname.startsWith('//') ||
        pathname.includes('\\')
    )
        return null;

    for (const matcher of matchers) {
        const match = matcher.expression.exec(pathname);

        if (match)
            return {
                definition: matcher.definition,
                encodedParams: match.slice(1),
            };
    }

    return null;
}

/** Preserve query bytes, repeated query keys and hash; only map a known pathname. */
export function canonicalizeAppUrl(
    url: string,
    variant: RouteVariant = canonicalRouteVariant,
): string {
    const separator = url.search(/[?#]/);
    const pathname = separator < 0 ? url : url.slice(0, separator);
    const suffix = separator < 0 ? '' : url.slice(separator);
    const match = matchAppRoute(pathname);

    if (!match) return url;

    let index = 0;
    const canonicalPath = match.definition[variant].replace(
        /:\w+/g,
        () => match.encodedParams[index++]!,
    );

    return canonicalPath + suffix;
}

export function isAppRoute(pathname: string, key: AppRouteKey): boolean {
    return matchAppRoute(pathname)?.definition.key === key;
}
