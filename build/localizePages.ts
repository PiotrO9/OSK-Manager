import type { NuxtPage } from '@nuxt/schema';
import { routeDefinitions } from '../shared/routing/routeDefinitions';
import type { RouteVariant } from '../shared/routing/routeDefinitions';

/** Mutate existing records so Nuxt keeps their names, page metadata and children. */
export function localizePages(pages: NuxtPage[], variant: RouteVariant): void {
    for (const page of pages) {
        const file = page.file?.replaceAll('\\', '/');
        const definition = routeDefinitions.find((route) =>
            file?.endsWith(`/pages/${route.file}`),
        );

        if (definition) {
            const alias = definition[variant === 'pl' ? 'en' : 'pl'];

            page.path = definition[variant];

            if (alias !== page.path) {
                const aliases =
                    typeof page.alias === 'string'
                        ? [page.alias]
                        : (page.alias ?? []);

                page.alias = [...new Set([...aliases, alias])];
            }
        }

        if (page.children) localizePages(page.children, variant);
    }
}
