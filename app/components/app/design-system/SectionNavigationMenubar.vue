<script setup lang="ts">
interface NavigationMenuItem {
    label: string;
    href?: string;
    children?: NavigationMenuItem[];
}

const { t } = useI18n();
const { addToast } = useAppToast();

const navigationMenuItems: NavigationMenuItem[] = [
    { label: 'Home', href: '/' },
    {
        label: 'Products',
        children: [
            { label: 'All Products', href: '/products' },
            {
                label: 'Categories',
                children: [
                    { label: 'Electronics', href: '/products/electronics' },
                    { label: 'Clothing', href: '/products/clothing' },
                    { label: 'Books', href: '/products/books' },
                ],
            },
            { label: 'Featured', href: '/products/featured' },
            { label: 'On Sale', href: '/products/sale' },
        ],
    },
    {
        label: 'Company',
        children: [
            { label: 'About Us', href: '/about' },
            {
                label: 'Team',
                children: [
                    { label: 'Leadership', href: '/team/leadership' },
                    { label: 'Engineering', href: '/team/engineering' },
                    { label: 'Design', href: '/team/design' },
                ],
            },
            { label: 'Careers', href: '/careers' },
            { label: 'Blog', href: '/blog' },
        ],
    },
    { label: 'Contact', href: '/contact' },
];

function handleNavigationSelect(item: NavigationMenuItem) {
    addToast({
        title: 'Nawigacja',
        description: `Przejdź do: ${item.label}${item.href ? ` (${item.href})` : ''}`,
        variant: 'info',
    });
}
</script>

<template>
    <Card class="lg:col-span-2" aria-label="Card: Navigation Menubar">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Navigation Menubar
            </p>
        </template>

        <div class="space-y-4">
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Fully accessible menubar navigation following the
                <a
                    href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-sky-500 underline hover:text-sky-400"
                    aria-label="WAI-ARIA Menubar Pattern (opens in new tab)"
                >
                    WAI-ARIA Menubar Pattern</a
                >. Supports nested submenus, roving tabindex, and full keyboard
                navigation (Arrow keys, Home, End, Escape, Enter, Space,
                character search).
            </p>

            <NavigationMenubar
                :items="navigationMenuItems"
                aria-label="Demo navigation menubar"
                @select="handleNavigationSelect"
            />

            <div class="space-y-2">
                <p
                    class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
                >
                    Keyboard shortcuts
                </p>
                <div
                    class="grid gap-x-6 gap-y-1.5 text-xs text-slate-600 sm:grid-cols-2 dark:text-slate-400"
                >
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >←</kbd
                        >
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >→</kbd
                        >
                        Navigate between menubar items
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >↓</kbd
                        >
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >↑</kbd
                        >
                        Open submenu / navigate items
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >Enter</kbd
                        >
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >Space</kbd
                        >
                        Activate item / toggle submenu
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >Esc</kbd
                        >
                        Close submenu
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >Home</kbd
                        >
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >End</kbd
                        >
                        First / last item
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >A–Z</kbd
                        >
                        Jump to item by first letter
                    </div>
                </div>
            </div>
        </div>
    </Card>
</template>
