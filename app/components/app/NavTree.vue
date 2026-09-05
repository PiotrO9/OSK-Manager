<script setup lang="ts">
import { useNavTreeController } from '~/composables/navigation/useNavTreeController';
import type { NavTreeItem } from '~/utils/navigation/navTree';

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

const {
    activeId,
    effectiveFocusedId,
    handleItemClick,
    handleRootFocusIn,
    handleRootKeyDown,
    isExpanded,
    isRoot,
    rootEl,
} = useNavTreeController(props, emit);
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
        <NavTreeBranch
            :items="items"
            :depth="depth"
            :active-id="activeId"
            :effective-focused-id="effectiveFocusedId"
            :is-expanded="isExpanded"
            list-role="tree"
            list-aria-label="Navigation"
            :on-item-click="handleItemClick"
        />
    </nav>

    <NavTreeBranch
        v-else
        :items="items"
        :depth="depth"
        :active-id="activeId"
        :effective-focused-id="effectiveFocusedId"
        :is-expanded="isExpanded"
        list-role="group"
        :on-item-click="handleItemClick"
    />
</template>
