<script setup lang="ts">
import type { NavTreeItem } from '~/components/ui/NavTree.vue';

const { t } = useI18n();
const { addToast } = useToast();

const navActiveId = ref('dashboard');

const navTreeItems: NavTreeItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'heroicons:home' },
    {
        id: 'projects',
        label: 'Projects',
        icon: 'heroicons:folder',
        badge: '5',
        children: [
            {
                id: 'projects-all',
                label: 'All projects',
                icon: 'heroicons:squares-2x2',
            },
            {
                id: 'projects-starred',
                label: 'Starred',
                icon: 'heroicons:star',
                badge: '2',
            },
            {
                id: 'projects-archived',
                label: 'Archived',
                icon: 'heroicons:archive-box',
            },
        ],
    },
    {
        id: 'team',
        label: 'Team',
        icon: 'heroicons:user-group',
        children: [
            {
                id: 'team-members',
                label: 'Members',
                icon: 'heroicons:users',
                children: [
                    {
                        id: 'team-members-active',
                        label: 'Active',
                        icon: 'heroicons:check-circle',
                    },
                    {
                        id: 'team-members-invited',
                        label: 'Invited',
                        icon: 'heroicons:envelope',
                        badge: '3',
                    },
                ],
            },
            {
                id: 'team-roles',
                label: 'Roles & permissions',
                icon: 'heroicons:shield-check',
            },
        ],
    },
    { id: 'reports', label: 'Reports', icon: 'heroicons:chart-bar' },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'heroicons:cog-6-tooth',
        children: [
            {
                id: 'settings-general',
                label: 'General',
                icon: 'heroicons:adjustments-horizontal',
            },
            {
                id: 'settings-notifications',
                label: 'Notifications',
                icon: 'heroicons:bell',
            },
            {
                id: 'settings-integrations',
                label: 'Integrations',
                icon: 'heroicons:puzzle-piece',
            },
        ],
    },
];

function handleNavSelect(item: NavTreeItem) {
    navActiveId.value = item.id;

    addToast({
        title: 'Nawigacja',
        description: `Wybrano: ${item.label} (${item.id})`,
        variant: 'info',
    });
}
</script>

<template>
    <Card aria-label="Card: Navigation">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Navigation (NavTree)
            </p>
        </template>

        <div class="space-y-6">
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Recursive, collapsible tree navigation following the
                <a
                    href="https://www.w3.org/WAI/ARIA/apg/patterns/treeview/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-sky-500 underline hover:text-sky-400"
                    aria-label="WAI-ARIA Tree View Pattern (opens in new tab)"
                >
                    WAI-ARIA Tree View Pattern</a
                >. Supports nested items, icons, badges, roving tabindex, and
                full keyboard navigation. Tab focus never enters collapsed
                sections.
            </p>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Expanded by default
                </p>
                <div
                    class="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50"
                >
                    <NavTree
                        :items="navTreeItems"
                        :active-id="navActiveId"
                        :default-expanded-ids="[
                            'projects',
                            'team',
                            'team-members',
                        ]"
                        @select="handleNavSelect"
                    />
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    All collapsed
                </p>
                <div
                    class="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50"
                >
                    <NavTree
                        :items="navTreeItems"
                        :active-id="navActiveId"
                        @select="handleNavSelect"
                    />
                </div>
            </div>

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
                            >↓</kbd
                        >
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >↑</kbd
                        >
                        Next / previous item
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >→</kbd
                        >
                        Expand / focus first child
                    </div>
                    <div class="flex items-center gap-2">
                        <kbd
                            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800"
                            >←</kbd
                        >
                        Collapse / focus parent
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
                        Activate / toggle expand
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
