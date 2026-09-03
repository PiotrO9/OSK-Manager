<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import type { Component } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

interface RelatedLink {
    label: string;
    description: string;
    to: RouteLocationRaw;
    icon: Component;
}

defineProps<{
    links: RelatedLink[];
    reviewsTo: RouteLocationRaw | null;
    actionDisabledClass: string;
    isDeleting: boolean;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <UiCardTitle class="text-xl font-extrabold">
                Powiazane dane
            </UiCardTitle>
            <UiCardDescription>
                Elementy, ktorych nie można zgubic po redesignie.
            </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-3 p-4">
            <NuxtLink
                v-for="item in links"
                :key="item.label"
                :to="item.to"
                class="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                :class="actionDisabledClass"
                :tabindex="isDeleting ? -1 : 0"
                :aria-disabled="isDeleting"
            >
                <span class="flex min-w-0 items-center gap-3">
                    <span
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                    >
                        <component
                            :is="item.icon"
                            class="size-4"
                            aria-hidden="true"
                        />
                    </span>
                    <span class="min-w-0">
                        <span class="text-foreground block font-semibold">
                            {{ item.label }}
                        </span>
                        <span
                            class="text-muted-foreground mt-0.5 block text-sm"
                        >
                            {{ item.description }}
                        </span>
                    </span>
                </span>
                <StatusBadge label="Widoczne" tone="neutral" subtle />
            </NuxtLink>

            <NuxtLink
                v-if="reviewsTo"
                :to="reviewsTo"
                class="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                :class="actionDisabledClass"
                :tabindex="isDeleting ? -1 : 0"
                :aria-disabled="isDeleting"
            >
                <span class="flex min-w-0 items-center gap-3">
                    <span
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                    >
                        <Star class="size-4" aria-hidden="true" />
                    </span>
                    <span class="min-w-0">
                        <span class="text-foreground block font-semibold">
                            Opinie
                        </span>
                        <span
                            class="text-muted-foreground mt-0.5 block text-sm"
                        >
                            Lista opinii tego instruktora
                        </span>
                    </span>
                </span>
                <StatusBadge label="Widoczne" tone="neutral" subtle />
            </NuxtLink>
        </UiCardContent>
    </UiCard>
</template>
