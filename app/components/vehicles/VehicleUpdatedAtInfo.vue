<script setup lang="ts">
import { Info } from 'lucide-vue-next';
import { useId } from 'vue';
import { formatVehicleUpdatedAt } from '~/utils/vehicles/updatedAt';

const props = defineProps<{ updatedAt: string | null }>();
const isOpen = shallowRef(false);
const contentId = useId();
const message = computed(() => formatVehicleUpdatedAt(props.updatedAt));
</script>

<template>
    <UiPopover v-model:open="isOpen">
        <UiPopoverAnchor as-child>
            <button
                type="button"
                class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Informacja o aktualizacji danych pojazdu"
                aria-haspopup="dialog"
                :aria-expanded="isOpen"
                :aria-controls="contentId"
                @mouseenter="isOpen = true"
                @mouseleave="isOpen = false"
                @focus="isOpen = true"
                @click="isOpen = true"
            >
                <Info class="size-4" aria-hidden="true" />
            </button>
        </UiPopoverAnchor>
        <UiPopoverContent
            :id="contentId"
            class="w-max max-w-[min(20rem,calc(100vw-2rem))] p-3 text-sm"
            side="top"
        >
            {{ message }}
        </UiPopoverContent>
    </UiPopover>
</template>
