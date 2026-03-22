<script setup lang="ts">
export interface NavigationMenuItem {
    label: string;
    href?: string;
    children?: NavigationMenuItem[];
}

export interface MenubarContext {
    closeAllMenus: () => void;
    selectItem: (item: NavigationMenuItem) => void;
    moveToNextMenubarItem: (menubarIndex: number) => void;
    moveToPrevMenubarItem: (menubarIndex: number) => void;
}

interface Props {
    items: NavigationMenuItem[];
    ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Nawigacja',
});

const emit = defineEmits<{
    select: [item: NavigationMenuItem];
}>();

const activeMenubarIndex = ref(0);
const openMenubarIndex = ref<number | null>(null);
const submenuInitialFocus = ref<'first' | 'last' | 'none'>('none');
const navRef = ref<HTMLElement | null>(null);
const menubarItemRefs = ref<(HTMLElement | null)[]>([]);
const hasFocusWithin = ref(false);

function focusMenubarItem(index: number) {
    activeMenubarIndex.value = index;
    nextTick(() => {
        menubarItemRefs.value[index]?.focus();
    });
}

function openMenubarSubmenu(index: number, focus: 'first' | 'last' | 'none') {
    if (props.items[index]?.children?.length) {
        openMenubarIndex.value = index;
        submenuInitialFocus.value = focus;
    } else {
        openMenubarIndex.value = null;
        submenuInitialFocus.value = 'none';
    }
}

function closeAllMenus() {
    openMenubarIndex.value = null;
    submenuInitialFocus.value = 'none';
}

function handleItemSelect(item: NavigationMenuItem) {
    emit('select', item);
}

function handleMenubarItemClick(event: MouseEvent, index: number) {
    event.preventDefault();
    const item = props.items[index];

    if (!item) return;

    if (item.children?.length) {
        if (openMenubarIndex.value === index) {
            closeAllMenus();
        } else {
            openMenubarSubmenu(index, 'first');
        }

        return;
    }

    closeAllMenus();
    handleItemSelect(item);
}

function handleMenubarItemMouseenter(index: number) {
    if (openMenubarIndex.value === null) return;

    if (openMenubarIndex.value === index) return;

    activeMenubarIndex.value = index;
    openMenubarSubmenu(index, 'none');
}

function handleMenubarKeydown(event: KeyboardEvent, index: number) {
    const item = props.items[index];

    if (!item) return;

    const hasChildren = !!item.children?.length;

    switch (event.key) {
        case 'ArrowRight': {
            event.preventDefault();
            const next = (index + 1) % props.items.length;

            focusMenubarItem(next);

            if (openMenubarIndex.value !== null) {
                openMenubarSubmenu(next, 'none');
            }

            break;
        }

        case 'ArrowLeft': {
            event.preventDefault();
            const prev = (index - 1 + props.items.length) % props.items.length;

            focusMenubarItem(prev);

            if (openMenubarIndex.value !== null) {
                openMenubarSubmenu(prev, 'none');
            }

            break;
        }

        case 'ArrowDown': {
            if (!hasChildren) return;

            event.preventDefault();
            openMenubarSubmenu(index, 'first');
            break;
        }

        case 'ArrowUp': {
            if (!hasChildren) return;

            event.preventDefault();
            openMenubarSubmenu(index, 'last');
            break;
        }

        case 'Enter':
        case ' ': {
            event.preventDefault();

            if (hasChildren) {
                if (openMenubarIndex.value === index) {
                    closeAllMenus();
                } else {
                    openMenubarSubmenu(index, 'first');
                }

                return;
            }

            closeAllMenus();
            handleItemSelect(item);
            break;
        }

        case 'Home': {
            event.preventDefault();
            focusMenubarItem(0);
            break;
        }

        case 'End': {
            event.preventDefault();
            focusMenubarItem(props.items.length - 1);
            break;
        }

        case 'Escape': {
            if (openMenubarIndex.value === null) return;

            event.preventDefault();
            closeAllMenus();
            break;
        }

        default: {
            if (event.key.length !== 1) return;

            if (event.ctrlKey || event.altKey || event.metaKey) return;

            const char = event.key.toLowerCase();

            for (let i = 1; i <= props.items.length; i++) {
                const ci = (index + i) % props.items.length;

                if (props.items[ci]?.label.toLowerCase().startsWith(char)) {
                    focusMenubarItem(ci);
                    break;
                }
            }
        }
    }
}

function handleFocusin() {
    hasFocusWithin.value = true;
}

function handleFocusout(event: FocusEvent) {
    if (!navRef.value) return;

    if (navRef.value.contains(event.relatedTarget as Node)) return;

    hasFocusWithin.value = false;
    closeAllMenus();
}

function handleSubmenuClose(menubarIndex: number) {
    closeAllMenus();
    focusMenubarItem(menubarIndex);
}

function handleDocumentClick(event: MouseEvent) {
    if (!navRef.value) return;

    if (navRef.value.contains(event.target as Node)) return;

    closeAllMenus();
}

onMounted(() => {
    document.addEventListener('mousedown', handleDocumentClick);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleDocumentClick);
});

provide<MenubarContext>('menubar-context', {
    closeAllMenus,
    selectItem: handleItemSelect,
    moveToNextMenubarItem(currentMenubarIndex: number) {
        const next = (currentMenubarIndex + 1) % props.items.length;

        closeAllMenus();
        focusMenubarItem(next);
        openMenubarSubmenu(next, 'none');
    },
    moveToPrevMenubarItem(currentMenubarIndex: number) {
        const prev =
            (currentMenubarIndex - 1 + props.items.length) % props.items.length;

        closeAllMenus();
        focusMenubarItem(prev);
        openMenubarSubmenu(prev, 'none');
    },
});
</script>

<template>
    <nav
        ref="navRef"
        :aria-label="ariaLabel"
        @focusin="handleFocusin"
        @focusout="handleFocusout"
    >
        <ul
            role="menubar"
            :aria-label="ariaLabel"
            class="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 transition dark:border-slate-700 dark:bg-slate-900"
            :class="{ 'ring-2 ring-sky-400/50': hasFocusWithin }"
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
                            menubarItemRefs[index] = el as HTMLElement | null;
                        }
                    "
                    role="menuitem"
                    :tabindex="index === activeMenubarIndex ? 0 : -1"
                    :aria-haspopup="item.children?.length ? 'true' : undefined"
                    :aria-expanded="
                        item.children?.length
                            ? String(openMenubarIndex === index)
                            : undefined
                    "
                    :href="item.href ?? '#'"
                    class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 no-underline transition-colors outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                    :class="{
                        'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50':
                            openMenubarIndex === index,
                    }"
                    @click="handleMenubarItemClick($event, index)"
                    @mouseenter="handleMenubarItemMouseenter(index)"
                    @keydown="handleMenubarKeydown($event, index)"
                >
                    {{ item.label }}
                    <Icon
                        v-if="item.children?.length"
                        name="heroicons:chevron-down-20-solid"
                        class="size-4 opacity-60 transition-transform"
                        :class="{
                            'rotate-180': openMenubarIndex === index,
                        }"
                        aria-hidden="true"
                    />
                </a>
                <NavigationMenubarPopup
                    v-if="item.children?.length && openMenubarIndex === index"
                    :items="item.children"
                    :aria-label="item.label"
                    :menubar-index="index"
                    :initial-focus="submenuInitialFocus"
                    :depth="0"
                    @close="handleSubmenuClose(index)"
                />
            </li>
        </ul>
    </nav>
</template>
