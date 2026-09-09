<script setup lang="ts">
import {
    getNavTreeIndentClass,
    type NavTreeItem,
} from '~/utils/navigation/navTree';

interface Props {
    activeId: string;
    depth: number;
    effectiveFocusedId: string;
    isExpanded: (id: string) => boolean;
    items: NavTreeItem[];
    listAriaLabel?: string;
    listRole: 'tree' | 'group';
    onItemClick: (item: NavTreeItem) => void;
}

defineProps<Props>();
</script>

<template>
    <ul
        :role="listRole"
        :aria-label="listAriaLabel"
        :class="{ 'py-0.5': listRole === 'group' }"
    >
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
                    'group focus-visible:ring-primary flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors duration-150 outline-none focus-visible:ring-2',
                    getNavTreeIndentClass(depth),
                    activeId === item.id
                        ? 'bg-primary/10 text-primary dark:bg-primary/15 font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ]"
                @click="onItemClick(item)"
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
                    class="bg-primary/15 text-primary flex-none rounded-full px-2 py-0.5 text-xs font-medium"
                >
                    {{ item.badge }}
                </span>

                <Icon
                    v-if="item.children?.length"
                    name="heroicons:chevron-right"
                    class="text-muted-foreground size-4 flex-none transition-transform duration-200"
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
                    <NavTreeBranch
                        :items="item.children"
                        :depth="depth + 1"
                        :active-id="activeId"
                        :effective-focused-id="effectiveFocusedId"
                        :is-expanded="isExpanded"
                        list-role="group"
                        :on-item-click="onItemClick"
                    />
                </div>
            </div>
        </li>
    </ul>
</template>
