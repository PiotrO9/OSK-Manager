import type { InjectionKey, Ref } from 'vue';
import {
    findNavTreeItemById,
    findNavTreeParentItem,
    flattenVisibleNavTreeItems,
    isNavTreeItemInSubtree,
    type NavTreeItem,
} from '~/utils/navigation/navTree';

interface NavTreeContext {
    expandedIds: Ref<Set<string>>;
    focusedId: Ref<string>;
    activeId: Ref<string>;
    rootEl: Ref<HTMLElement | null>;
    rootItems: Ref<NavTreeItem[]>;
    emitSelect: (item: NavTreeItem) => void;
}

interface UseNavTreeControllerProps {
    items: NavTreeItem[];
    activeId: string;
    depth: number;
    defaultExpandedIds: string[];
}

interface UseNavTreeControllerEmit {
    select: [item: NavTreeItem];
}

const NAV_TREE_KEY: InjectionKey<NavTreeContext> = Symbol('navTree');

export function useNavTreeController(
    props: Readonly<UseNavTreeControllerProps>,
    emit: <K extends keyof UseNavTreeControllerEmit>(
        event: K,
        ...args: UseNavTreeControllerEmit[K]
    ) => void,
) {
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
        const visible = flattenVisibleNavTreeItems(
            rootItems.value,
            expandedIds.value,
        );
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
                const visible = flattenVisibleNavTreeItems(
                    rootItems.value,
                    newExpanded,
                );
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
            const item = findNavTreeItemById(rootItems.value, id);

            if (
                item?.children?.length &&
                isNavTreeItemInSubtree(item.children, focusedId.value)
            ) {
                focusedId.value = id;
            }
        }
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

    function handleRootFocusIn(event: FocusEvent): void {
        const target = event.target as HTMLElement | null;
        const id = target?.getAttribute?.('data-navtree-id');

        if (id && id !== focusedId.value) {
            focusedId.value = id;
        }
    }

    function handleRootKeyDown(event: KeyboardEvent): void {
        const visible = flattenVisibleNavTreeItems(
            rootItems.value,
            expandedIds.value,
        );
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

                if (
                    current.children?.length &&
                    expandedIds.value.has(current.id)
                ) {
                    toggleExpand(current.id);
                } else {
                    const parent = findNavTreeParentItem(
                        rootItems.value,
                        current.id,
                    );

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
                handleTypeaheadKeyDown(event, visible, idx);
            }
        }
    }

    function handleTypeaheadKeyDown(
        event: KeyboardEvent,
        visible: NavTreeItem[],
        focusedIndex: number,
    ): void {
        if (
            event.key.length !== 1 ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {
            return;
        }

        event.preventDefault();
        const char = event.key.toLowerCase();

        for (let i = 1; i <= visible.length; i++) {
            const checkIdx = (focusedIndex + i) % visible.length;

            if (visible[checkIdx]!.label.toLowerCase().startsWith(char)) {
                focusItemById(visible[checkIdx]!.id);
                break;
            }
        }
    }

    return {
        activeId,
        effectiveFocusedId,
        handleItemClick,
        handleRootFocusIn,
        handleRootKeyDown,
        isExpanded,
        isRoot,
        rootEl,
    };
}
