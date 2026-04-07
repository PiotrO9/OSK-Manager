<script setup lang="ts">
import type { DemoMenubarItem } from '~/types/demoMenubar';

defineProps<{
    items: DemoMenubarItem[];
}>();

const emit = defineEmits<{
    select: [item: DemoMenubarItem];
}>();

function handleSelect(item: DemoMenubarItem) {
    emit('select', item);
}
</script>

<template>
    <template v-for="(child, idx) in items" :key="`${idx}-${child.label}`">
        <UiMenubarSub v-if="child.children?.length">
            <UiMenubarSubTrigger>{{ child.label }}</UiMenubarSubTrigger>
            <UiMenubarSubContent>
                <AppDemoMenubarContent
                    :items="child.children"
                    @select="handleSelect"
                />
            </UiMenubarSubContent>
        </UiMenubarSub>

        <UiMenubarItem class="cursor-pointer" @select="handleSelect(child)">
            {{ child.label }}
        </UiMenubarItem>
    </template>
</template>
