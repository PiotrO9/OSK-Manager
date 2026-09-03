import { describe, expect, it } from 'vitest';
import {
    findNavTreeItemById,
    findNavTreeParentItem,
    flattenVisibleNavTreeItems,
    getNavTreeIndentClass,
    isNavTreeItemInSubtree,
    type NavTreeItem,
} from './navTree';

const items: NavTreeItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
    },
    {
        id: 'manager',
        label: 'Manager',
        children: [
            {
                id: 'students',
                label: 'Students',
            },
            {
                id: 'instructors',
                label: 'Instructors',
                children: [
                    {
                        id: 'availability',
                        label: 'Availability',
                    },
                ],
            },
        ],
    },
];

describe('navTree utilities', () => {
    it('flattens only visible items based on expanded ids', () => {
        expect(
            flattenVisibleNavTreeItems(items, new Set(['manager'])).map(
                (item) => item.id,
            ),
        ).toEqual(['dashboard', 'manager', 'students', 'instructors']);

        expect(
            flattenVisibleNavTreeItems(
                items,
                new Set(['manager', 'instructors']),
            ).map((item) => item.id),
        ).toEqual([
            'dashboard',
            'manager',
            'students',
            'instructors',
            'availability',
        ]);
    });

    it('finds nested items and parent items', () => {
        expect(findNavTreeItemById(items, 'availability')?.label).toBe(
            'Availability',
        );
        expect(findNavTreeParentItem(items, 'availability')?.id).toBe(
            'instructors',
        );
        expect(findNavTreeItemById(items, 'missing')).toBeUndefined();
        expect(findNavTreeParentItem(items, 'dashboard')).toBeUndefined();
    });

    it('detects subtree membership', () => {
        const managerChildren = items[1]!.children!;

        expect(isNavTreeItemInSubtree(managerChildren, 'availability')).toBe(
            true,
        );
        expect(isNavTreeItemInSubtree(managerChildren, 'dashboard')).toBe(
            false,
        );
    });

    it('returns stable indentation classes with fallback for deep levels', () => {
        expect(getNavTreeIndentClass(0)).toBe('pl-3');
        expect(getNavTreeIndentClass(4)).toBe('pl-19');
        expect(getNavTreeIndentClass(5)).toBe('pl-23');
    });
});
