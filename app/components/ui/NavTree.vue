<script setup lang="ts">
import type { InjectionKey } from 'vue';

export interface NavTreeItem {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    children?: NavTreeItem[];
    badge?: string;
}

interface NavTreeContext {
    expandedIds: Ref<Set<string>>;
    focusedId: Ref<string>;
    activeId: Ref<string>;
    rootEl: Ref<HTMLElement | null>;
    rootItems: Ref<NavTreeItem[]>;
    emitSelect: (item: NavTreeItem) => void;
}

interface Props {
    items: NavTreeItem[];
    activeId?: string;
    depth?: number;
    defaultExpandedIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    activeId: '',
    depth: 0,
    defaultExpandedIds: () => [],
});

const emit = defineEmits<{
    select: [item: NavTreeItem];
}>();

const NAV_TREE_KEY: InjectionKey<NavTreeContext> = Symbol('navTree');

const isRoot = props.depth === 0;
const injectedCtx: NavTreeContext | null = isRoot
    ? null
    : inject(NAV_TREE_KEY, null);

const expandedIds =
    injectedCtx?.expandedIds ??
    ref<Set<string>>(new Set(props.defaultExpandedIds));
const focusedId = injectedCtx?.focusedId ?? ref(props.items[0]?.id ?? '');
const rootEl = injectedCtx?.rootEl ?? ref<HTMLElement | null>(null);

const activeId = injectedCtx?.activeId ?? toRef(props, 'activeId');

const rootItems = injectedCtx?.rootItems ?? toRef(props, 'items');

const effectiveFocusedId = computed(() => {
    const visible = flattenVisible(rootItems.value, expandedIds.value);
    const isFocusedVisible = visible.some((i) => i.id === focusedId.value);

    return isFocusedVisible
        ? focusedId.value
        : (visible[0]?.id ?? focusedId.value);
});

function emitSelect(item: NavTreeItem): void {
    if (injectedCtx) {
        injectedCtx.emitSelect(item);

        return;
    }

    emit('select', item);
}

if (isRoot) {
    provide(NAV_TREE_KEY, {
        expandedIds,
        focusedId,
        activeId,
        rootEl,
        rootItems,
        emitSelect,
    });

    watch(
        () => expandedIds.value,
        (newExpanded) => {
            const visible = flattenVisible(rootItems.value, newExpanded);
            const isFocusedVisible = visible.some(
                (i) => i.id === focusedId.value,
            );

            if (!isFocusedVisible && visible.length) {
                focusedId.value = visible[0]!.id;
            }
        },
    );
}

function isExpanded(id: string): boolean {
    return expandedIds.value.has(id);
}

function isInSubtree(items: NavTreeItem[], targetId: string): boolean {
    for (const item of items) {
        if (item.id === targetId) return true;

        if (item.children?.length && isInSubtree(item.children, targetId)) {
            return true;
        }
    }

    return false;
}

function toggleExpand(id: string): void {
    const next = new Set(expandedIds.value);
    const wasExpanded = next.has(id);

    if (wasExpanded) {
        next.delete(id);
    } else {
        next.add(id);
    }

    expandedIds.value = next;

    if (wasExpanded) {
        const item = findItemById(rootItems.value, id);

        if (
            item?.children?.length &&
            isInSubtree(item.children, focusedId.value)
        ) {
            focusedId.value = id;
        }
    }
}

function findItemById(
    items: NavTreeItem[],
    targetId: string,
): NavTreeItem | undefined {
    for (const item of items) {
        if (item.id === targetId) return item;

        const found = findItemById(item.children ?? [], targetId);

        if (found) return found;
    }

    return undefined;
}

function handleItemClick(item: NavTreeItem): void {
    focusedId.value = item.id;

    if (item.children?.length) {
        toggleExpand(item.id);

        return;
    }

    emitSelect(item);
}

function focusItemById(id: string): void {
    focusedId.value = id;

    nextTick(() => {
        const el = rootEl.value?.querySelector(
            `[data-navtree-id="${id}"]`,
        ) as HTMLElement | null;

        el?.focus();
    });
}

function flattenVisible(
    items: NavTreeItem[],
    expanded: Set<string>,
): NavTreeItem[] {
    const result: NavTreeItem[] = [];

    for (const item of items) {
        result.push(item);

        if (item.children?.length && expanded.has(item.id)) {
            result.push(...flattenVisible(item.children, expanded));
        }
    }

    return result;
}

function findParentItem(
    allItems: NavTreeItem[],
    targetId: string,
): NavTreeItem | undefined {
    for (const item of allItems) {
        if (!item.children?.length) continue;

        for (const child of item.children) {
            if (child.id === targetId) return item;
        }

        const found = findParentItem(item.children, targetId);

        if (found) return found;
    }

    return undefined;
}

function handleRootFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const id = target?.getAttribute?.('data-navtree-id');

    if (id && id !== focusedId.value) {
        focusedId.value = id;
    }
}

function handleRootKeyDown(event: KeyboardEvent): void {
    const visible = flattenVisible(rootItems.value, expandedIds.value);
    const idx = visible.findIndex((i) => i.id === focusedId.value);

    if (idx === -1) return;

    const current = visible[idx]!;

    switch (event.key) {
        case 'ArrowDown': {
            event.preventDefault();

            if (idx < visible.length - 1) {
                focusItemById(visible[idx + 1]!.id);
            }

            break;
        }

        case 'ArrowUp': {
            event.preventDefault();

            if (idx > 0) {
                focusItemById(visible[idx - 1]!.id);
            }

            break;
        }

        case 'ArrowRight': {
            event.preventDefault();

            if (!current.children?.length) break;

            if (!expandedIds.value.has(current.id)) {
                toggleExpand(current.id);
            } else {
                focusItemById(current.children[0]!.id);
            }

            break;
        }

        case 'ArrowLeft': {
            event.preventDefault();

            if (current.children?.length && expandedIds.value.has(current.id)) {
                toggleExpand(current.id);
            } else {
                const parent = findParentItem(rootItems.value, current.id);

                if (parent) {
                    focusItemById(parent.id);
                }
            }

            break;
        }

        case 'Home': {
            event.preventDefault();

            if (visible.length) {
                focusItemById(visible[0]!.id);
            }

            break;
        }

        case 'End': {
            event.preventDefault();

            if (visible.length) {
                focusItemById(visible[visible.length - 1]!.id);
            }

            break;
        }

        case 'Enter':
        case ' ': {
            event.preventDefault();
            handleItemClick(current);
            break;
        }

        default: {
            if (
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.altKey &&
                !event.metaKey
            ) {
                event.preventDefault();
                const char = event.key.toLowerCase();

                for (let i = 1; i <= visible.length; i++) {
                    const checkIdx = (idx + i) % visible.length;

                    if (
                        visible[checkIdx]!.label.toLowerCase().startsWith(char)
                    ) {
                        focusItemById(visible[checkIdx]!.id);
                        break;
                    }
                }
            }
        }
    }
}

const indentClasses: Record<number, string> = {
    0: 'pl-3',
    1: 'pl-7',
    2: 'pl-11',
    3: 'pl-15',
    4: 'pl-19',
};

function getIndentClass(depth: number): string {
    return indentClasses[depth] ?? 'pl-23';
}
</script>

<template>
    <nav
        v-if="isRoot"
        ref="rootEl"
        aria-label="Tree navigation"
        class="w-full"
        @keydown="handleRootKeyDown"
        @focusin="handleRootFocusIn"
    >
        <ul role="tree" aria-label="Navigation">
            <li
                v-for="item in items"
                :key="item.id"
                role="treeitem"
                :aria-expanded="
                    item.children?.length ? isExpanded(item.id) : undefined
                "
            >
                <span
                    :data-navtree-id="item.id"
                    :tabindex="effectiveFocusedId === item.id ? 0 : -1"
                    :aria-current="activeId === item.id ? 'page' : undefined"
                    :class="[
                        'group flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                        getIndentClass(depth),
                        activeId === item.id
                            ? 'bg-sky-500/10 font-semibold text-sky-600 dark:bg-sky-500/15 dark:text-sky-400'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    ]"
                    @click="handleItemClick(item)"
                >
                    <Icon
                        v-if="item.icon"
                        :name="item.icon"
                        class="size-5 flex-none opacity-70"
                        aria-hidden="true"
                    />

                    <span class="min-w-0 flex-1 truncate">
                        {{ item.label }}
                    </span>

                    <span
                        v-if="item.badge"
                        class="flex-none rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
                    >
                        {{ item.badge }}
                    </span>

                    <Icon
                        v-if="item.children?.length"
                        name="heroicons:chevron-right"
                        class="size-4 flex-none text-slate-400 transition-transform duration-200 dark:text-slate-500"
                        :class="{ 'rotate-90': isExpanded(item.id) }"
                        aria-hidden="true"
                    />
                </span>

                <div
                    v-if="item.children?.length"
                    class="grid transition-[grid-template-rows] duration-200 ease-in-out"
                    :class="
                        isExpanded(item.id)
                            ? 'grid-rows-[1fr]'
                            : 'grid-rows-[0fr]'
                    "
                >
                    <div class="overflow-hidden">
                        <NavTree :items="item.children" :depth="depth + 1" />
                    </div>
                </div>
            </li>
        </ul>
    </nav>

    <ul v-else role="group" class="py-0.5">
        <li
            v-for="item in items"
            :key="item.id"
            role="treeitem"
            :aria-expanded="
                item.children?.length ? isExpanded(item.id) : undefined
            "
        >
            <span
                :data-navtree-id="item.id"
                :tabindex="effectiveFocusedId === item.id ? 0 : -1"
                :aria-current="activeId === item.id ? 'page' : undefined"
                :class="[
                    'group flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                    getIndentClass(depth),
                    activeId === item.id
                        ? 'bg-sky-500/10 font-semibold text-sky-600 dark:bg-sky-500/15 dark:text-sky-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ]"
                @click="handleItemClick(item)"
            >
                <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="size-5 flex-none opacity-70"
                    aria-hidden="true"
                />

                <span class="min-w-0 flex-1 truncate">
                    {{ item.label }}
                </span>

                <span
                    v-if="item.badge"
                    class="flex-none rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
                >
                    {{ item.badge }}
                </span>

                <Icon
                    v-if="item.children?.length"
                    name="heroicons:chevron-right"
                    class="size-4 flex-none text-slate-400 transition-transform duration-200 dark:text-slate-500"
                    :class="{ 'rotate-90': isExpanded(item.id) }"
                    aria-hidden="true"
                />
            </span>

            <div
                v-if="item.children?.length"
                class="grid transition-[grid-template-rows] duration-200 ease-in-out"
                :class="
                    isExpanded(item.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                "
            >
                <div class="overflow-hidden">
                    <NavTree :items="item.children" :depth="depth + 1" />
                </div>
            </div>
        </li>
    </ul>
</template>
