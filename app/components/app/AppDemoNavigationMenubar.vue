<script setup lang="ts">
import type { DemoMenubarItem } from '~/types/demoMenubar';

const props = withDefaults(
    defineProps<{
        items: DemoMenubarItem[];
        ariaLabel?: string;
    }>(),
    {
        ariaLabel: 'Nawigacja',
    },
);

const emit = defineEmits<{
    select: [item: DemoMenubarItem];
}>();

function handleSelect(item: DemoMenubarItem) {
    emit('select', item);
}
</script>

<template>
    <UiMenubar :aria-label="props.ariaLabel">
        <template
            v-for="(item, index) in items"
            :key="`${index}-${item.label}`"
        >
            <UiMenubarMenu v-if="item.children?.length">
                <UiMenubarTrigger>{{ item.label }}</UiMenubarTrigger>
                <UiMenubarContent>
                    <AppDemoMenubarContent
                        :items="item.children"
                        @select="handleSelect"
                    />
                </UiMenubarContent>
            </UiMenubarMenu>

            <UiMenubarMenu v-else>
                <UiMenubarTrigger
                    class="cursor-pointer"
                    @click="handleSelect(item)"
                >
                    {{ item.label }}
                </UiMenubarTrigger>
            </UiMenubarMenu>
        </template>
    </UiMenubar>
</template>
