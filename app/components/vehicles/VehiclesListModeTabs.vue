<script setup lang="ts">
import { LayoutList, Shield } from 'lucide-vue-next';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';

defineProps<{
    activePanel: VehiclesListPanelId;
}>();

defineEmits<{
    tabSelect: [panel: VehiclesListPanelId];
    tabKeydown: [event: KeyboardEvent, panel: VehiclesListPanelId];
}>();
</script>

<template>
    <div
        class="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Widok listy pojazdów"
    >
        <button
            type="button"
            role="tab"
            class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :class="
                activePanel === 'simple'
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
            "
            :aria-selected="activePanel === 'simple'"
            tabindex="0"
            @click="$emit('tabSelect', 'simple')"
            @keydown="$emit('tabKeydown', $event, 'simple')"
        >
            <LayoutList class="size-3.5" aria-hidden="true" />
            Lista
        </button>
        <button
            type="button"
            role="tab"
            class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :class="
                activePanel === 'manager'
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
            "
            :aria-selected="activePanel === 'manager'"
            tabindex="0"
            @click="$emit('tabSelect', 'manager')"
            @keydown="$emit('tabKeydown', $event, 'manager')"
        >
            <Shield class="size-3.5" aria-hidden="true" />
            Status
        </button>
    </div>
</template>
