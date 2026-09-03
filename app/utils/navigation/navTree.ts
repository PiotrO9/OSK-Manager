export interface NavTreeItem {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    children?: NavTreeItem[];
    badge?: string;
}

const NAV_TREE_INDENT_CLASSES: Record<number, string> = {
    0: 'pl-3',
    1: 'pl-7',
    2: 'pl-11',
    3: 'pl-15',
    4: 'pl-19',
};

export function flattenVisibleNavTreeItems(
    items: NavTreeItem[],
    expanded: Set<string>,
): NavTreeItem[] {
    const result: NavTreeItem[] = [];

    for (const item of items) {
        result.push(item);

        if (item.children?.length && expanded.has(item.id)) {
            result.push(...flattenVisibleNavTreeItems(item.children, expanded));
        }
    }

    return result;
}

export function findNavTreeItemById(
    items: NavTreeItem[],
    targetId: string,
): NavTreeItem | undefined {
    for (const item of items) {
        if (item.id === targetId) return item;

        const found = findNavTreeItemById(item.children ?? [], targetId);

        if (found) return found;
    }

    return undefined;
}

export function findNavTreeParentItem(
    allItems: NavTreeItem[],
    targetId: string,
): NavTreeItem | undefined {
    for (const item of allItems) {
        if (!item.children?.length) continue;

        for (const child of item.children) {
            if (child.id === targetId) return item;
        }

        const found = findNavTreeParentItem(item.children, targetId);

        if (found) return found;
    }

    return undefined;
}

export function isNavTreeItemInSubtree(
    items: NavTreeItem[],
    targetId: string,
): boolean {
    return Boolean(findNavTreeItemById(items, targetId));
}

export function getNavTreeIndentClass(depth: number): string {
    return NAV_TREE_INDENT_CLASSES[depth] ?? 'pl-23';
}
