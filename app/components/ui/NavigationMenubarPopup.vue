<script setup lang="ts">
interface NavigationMenuItem {
    label: string;
    href?: string;
    children?: NavigationMenuItem[];
}

interface MenubarContext {
    closeAllMenus: () => void;
    selectItem: (item: NavigationMenuItem) => void;
    moveToNextMenubarItem: (menubarIndex: number) => void;
    moveToPrevMenubarItem: (menubarIndex: number) => void;
}

interface Props {
    items: NavigationMenuItem[];
    ariaLabel: string;
    menubarIndex: number;
    initialFocus: 'first' | 'last' | 'none';
    depth: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    close: [];
}>();

const menubarContext = inject<MenubarContext>('menubar-context')!;

const activeItemIndex = ref(0);
const openSubmenuIndex = ref<number | null>(null);
const nestedInitialFocus = ref<'first' | 'last' | 'none'>('none');
const itemRefs = ref<(HTMLElement | null)[]>([]);

function focusItem(index: number) {
    activeItemIndex.value = index;
    nextTick(() => {
        itemRefs.value[index]?.focus();
    });
}

function openNestedSubmenu(index: number, focus: 'first' | 'last' | 'none') {
    if (!props.items[index]?.children?.length) return;

    openSubmenuIndex.value = index;
    nestedInitialFocus.value = focus;
}

function closeNestedSubmenu() {
    const prevIndex = openSubmenuIndex.value;

    openSubmenuIndex.value = null;
    nestedInitialFocus.value = 'none';

    if (prevIndex !== null) {
        focusItem(prevIndex);
    }
}

function handleItemKeydown(event: KeyboardEvent, index: number) {
    const item = props.items[index];

    if (!item) return;

    const hasChildren = !!item.children?.length;

    switch (event.key) {
        case 'ArrowDown': {
            event.preventDefault();
            event.stopPropagation();
            focusItem((index + 1) % props.items.length);
            break;
        }

        case 'ArrowUp': {
            event.preventDefault();
            event.stopPropagation();
            focusItem((index - 1 + props.items.length) % props.items.length);
            break;
        }

        case 'ArrowRight': {
            event.preventDefault();
            event.stopPropagation();

            if (hasChildren) {
                openNestedSubmenu(index, 'first');

                return;
            }

            menubarContext.moveToNextMenubarItem(props.menubarIndex);
            break;
        }

        case 'ArrowLeft': {
            event.preventDefault();
            event.stopPropagation();

            if (props.depth === 0) {
                menubarContext.moveToPrevMenubarItem(props.menubarIndex);

                return;
            }

            emit('close');
            break;
        }

        case 'Enter':
        case ' ': {
            event.preventDefault();
            event.stopPropagation();

            if (hasChildren) {
                openNestedSubmenu(index, 'first');

                return;
            }

            menubarContext.closeAllMenus();
            menubarContext.selectItem(item);
            break;
        }

        case 'Escape': {
            event.preventDefault();
            event.stopPropagation();
            emit('close');
            break;
        }

        case 'Home': {
            event.preventDefault();
            event.stopPropagation();
            focusItem(0);
            break;
        }

        case 'End': {
            event.preventDefault();
            event.stopPropagation();
            focusItem(props.items.length - 1);
            break;
        }

        default: {
            if (event.key.length !== 1) return;

            if (event.ctrlKey || event.altKey || event.metaKey) return;

            event.stopPropagation();
            const char = event.key.toLowerCase();

            for (let i = 1; i <= props.items.length; i++) {
                const ci = (index + i) % props.items.length;

                if (props.items[ci]?.label.toLowerCase().startsWith(char)) {
                    focusItem(ci);
                    break;
                }
            }
        }
    }
}

function handleItemClick(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const item = props.items[index];

    if (!item) return;

    if (item.children?.length) {
        if (openSubmenuIndex.value === index) {
            openSubmenuIndex.value = null;

            return;
        }

        openNestedSubmenu(index, 'none');

        return;
    }

    menubarContext.closeAllMenus();
    menubarContext.selectItem(item);
}

function handleItemMouseenter(index: number) {
    if (props.items[index]?.children?.length) {
        openNestedSubmenu(index, 'none');

        return;
    }

    openSubmenuIndex.value = null;
}

watch(
    () => props.initialFocus,
    (newFocus) => {
        if (newFocus === 'first') {
            focusItem(0);
        } else if (newFocus === 'last') {
            focusItem(props.items.length - 1);
        }
    },
);

onMounted(() => {
    if (props.initialFocus === 'first') {
        focusItem(0);
    } else if (props.initialFocus === 'last') {
        focusItem(props.items.length - 1);
    }
});
</script>

<template>
    <ul
        role="menu"
        :aria-label="ariaLabel"
        class="absolute z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        :class="
            depth === 0
                ? 'top-full left-0 mt-1'
                : 'top-0 left-full -mt-1 ml-0.5'
        "
    >
        <li
            v-for="(item, index) in items"
            :key="index"
            role="none"
            class="relative"
        >
            <a
                :ref="
                    (el) => {
                        itemRefs[index] = el as HTMLElement | null;
                    }
                "
                role="menuitem"
                :tabindex="index === activeItemIndex ? 0 : -1"
                :aria-haspopup="item.children?.length ? 'true' : undefined"
                :aria-expanded="
                    item.children?.length
                        ? String(openSubmenuIndex === index)
                        : undefined
                "
                :href="item.href ?? '#'"
                class="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-slate-700 no-underline transition-colors outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-inset dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                :class="{
                    'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50':
                        openSubmenuIndex === index,
                }"
                @click="handleItemClick($event, index)"
                @mouseenter="handleItemMouseenter(index)"
                @keydown="handleItemKeydown($event, index)"
            >
                {{ item.label }}
                <Icon
                    v-if="item.children?.length"
                    name="heroicons:chevron-right-20-solid"
                    class="size-4 opacity-60"
                    aria-hidden="true"
                />
            </a>
            <NavigationMenubarPopup
                v-if="item.children?.length && openSubmenuIndex === index"
                :items="item.children"
                :aria-label="item.label"
                :menubar-index="menubarIndex"
                :initial-focus="nestedInitialFocus"
                :depth="depth + 1"
                @close="closeNestedSubmenu"
            />
        </li>
    </ul>
</template>
