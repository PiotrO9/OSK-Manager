import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import type { NuxtPage } from '@nuxt/schema';
import { localizePages } from './localizePages';
import { routeDefinitions } from '../shared/routing/routeDefinitions';
import { buildRoutePath } from '../shared/routing/routePaths';

describe.each(['en', 'pl'] as const)(
    'Nuxt route adapter (%s release)',
    (variant) => {
        it('keeps names, components, middleware and params for both URL variants', () => {
            const pages: NuxtPage[] = routeDefinitions.map((route) => ({
                name: route.key,
                path: route.en,
                file: `D:/project/app/pages/${route.file}`,
                meta: { middleware: ['manager'], layout: 'app-shell' },
            }));

            localizePages(pages, variant);
            const router = createRouter({
                history: createMemoryHistory(),
                routes: pages.map((page) => ({
                    ...page,
                    component: {},
                })) as RouteRecordRaw[],
            });

            for (const definition of routeDefinitions) {
                for (const inputVariant of ['en', 'pl'] as const) {
                    const path = buildRoutePath(
                        definition.key,
                        { id: 'example id', userId: 'user id' },
                        inputVariant,
                    );
                    const resolved = router.resolve(path);

                    expect(resolved.name).toBe(definition.key);
                    expect(resolved.meta).toEqual({
                        middleware: ['manager'],
                        layout: 'app-shell',
                    });
                    expect(Object.values(resolved.params)).not.toContain('new');
                }
            }
        });

        it('preserves nested course routes and unrelated records', () => {
            const child: NuxtPage = {
                name: 'edit',
                path: 'edit',
                file: '/project/app/pages/manager/courses/[id]/edit.vue',
                meta: { middleware: ['manager'] },
            };
            const parent: NuxtPage = {
                name: 'course',
                path: '/manager/courses/:id',
                file: '/project/app/pages/manager/courses/[id].vue',
                children: [child],
            };
            const untouched: NuxtPage = {
                name: 'extra',
                path: '/extra',
                file: '/module/extra.vue',
            };

            localizePages([parent, untouched], variant);
            expect(parent.children?.[0]).toBe(child);
            expect(child.meta?.middleware).toEqual(['manager']);
            expect(untouched.path).toBe('/extra');
            expect(child.path).toBe(
                buildRoutePath(
                    'managerCourseEdit',
                    { id: ':id' },
                    variant,
                ).replace('%3Aid', ':id'),
            );
        });
    },
);
