import type { InjectionKey, Ref } from 'vue';
import type { NavTreeItem } from '~/utils/navigation/navTree';

export interface NavTreeContext {
    expandedIds: Ref<Set<string>>;
    focusedId: Ref<string>;
    activeId: Ref<string>;
    rootEl: Ref<HTMLElement | null>;
    rootItems: Ref<NavTreeItem[]>;
    emitSelect: (item: NavTreeItem) => void;
}

export interface UseNavTreeControllerEmit {
    select: [item: NavTreeItem];
}

export const NAV_TREE_KEY: InjectionKey<NavTreeContext> = Symbol('navTree');
