<script setup lang="ts">
export interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface Props {
    items: BreadcrumbItem[];
    ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Breadcrumb',
});

function isLastItem(index: number): boolean {
    return index === props.items.length - 1;
}

function getItemAriaLabel(item: BreadcrumbItem, index: number): string {
    if (isLastItem(index)) {
        return `Current page: ${item.label}`;
    }

    return `Go to ${item.label}`;
}
</script>

<template>
    <nav :aria-label="ariaLabel" class="flex items-center gap-2 text-sm">
        <ol class="flex flex-wrap items-center gap-2">
            <li
                v-for="(item, index) in items"
                :key="index"
                class="flex items-center gap-2"
            >
                <NuxtLink
                    v-if="item.to && !isLastItem(index)"
                    :to="item.to"
                    class="text-secondary-600 hover:text-secondary-900 focus-visible:ring-primary-400 dark:text-secondary-400 dark:hover:text-secondary-50 dark:focus-visible:ring-offset-secondary-950 rounded px-1 py-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    :aria-label="getItemAriaLabel(item, index)"
                >
                    {{ item.label }}
                </NuxtLink>
                <span
                    v-else
                    :aria-current="isLastItem(index) ? 'page' : undefined"
                    class="text-secondary-900 dark:text-secondary-50 font-medium"
                >
                    {{ item.label }}
                </span>
                <Icon
                    v-if="!isLastItem(index)"
                    name="heroicons:chevron-right"
                    class="text-secondary-400 dark:text-secondary-500 size-4 shrink-0"
                    aria-hidden="true"
                />
            </li>
        </ol>
    </nav>
</template>
