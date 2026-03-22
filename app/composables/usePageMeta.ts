import { toValue } from 'vue';

type MaybeRefOrGetter<T> =
    | import('vue').Ref<T>
    | import('vue').ComputedRef<T>
    | (() => T)
    | T;

export interface UsePageMetaOptions {
    /** Tytuł strony */
    title: MaybeRefOrGetter<string>;
    /** Opis strony (meta description, og:description) */
    description?: MaybeRefOrGetter<string>;
    /** Ścieżka do obrazka OG (np. /og-image.png) lub pełny URL */
    image?: string;
}

const DEFAULT_SITE_NAME = 'Frontend Starter';

/**
 * Composable wrapper na useSeoMeta + useHead z domyślnymi wartościami.
 * Ustawia title, description, og:title, og:description, og:image.
 */
export function usePageMeta(options: UsePageMetaOptions): void {
    const config = useRuntimeConfig();
    const siteUrl = config.public.siteUrl as string | undefined;

    const { title, description, image } = options;

    const fullTitle = computed(() => {
        const titleVal = typeof title === 'function' ? title() : toValue(title);
        return titleVal
            ? `${titleVal} | ${DEFAULT_SITE_NAME}`
            : DEFAULT_SITE_NAME;
    });

    const descriptionVal = computed(() =>
        typeof description === 'function'
            ? description()
            : toValue(description ?? ''),
    );

    const ogImageUrl = computed(() => {
        if (!image) return undefined;

        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image;
        }

        const base = siteUrl?.replace(/\/$/, '') ?? '';

        return base
            ? `${base}${image.startsWith('/') ? '' : '/'}${image}`
            : image;
    });

    useSeoMeta({
        title: fullTitle,
        ...(options.description !== undefined && {
            description: descriptionVal,
            ogDescription: descriptionVal,
        }),
        ...(ogImageUrl.value && { ogImage: ogImageUrl }),
        ogTitle: fullTitle,
        ogType: 'website',
    });

    useHead({
        title: fullTitle,
    });
}
