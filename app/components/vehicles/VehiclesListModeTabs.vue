<script setup lang="ts">
import { LayoutList, Shield } from 'lucide-vue-next';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';

defineProps<{
    activePanel: VehiclesListPanelId;
}>();

const emit = defineEmits<{
    tabSelect: [panel: VehiclesListPanelId];
}>();

const simpleTab = useTemplateRef<HTMLButtonElement>('simpleTab');
const managerTab = useTemplateRef<HTMLButtonElement>('managerTab');

function selectAndFocus(panel: VehiclesListPanelId) {
    emit('tabSelect', panel);

    void nextTick(() => {
        const target = panel === 'simple' ? simpleTab.value : managerTab.value;

        target?.focus();
    });
}

function handleKeydown(event: KeyboardEvent, panel: VehiclesListPanelId) {
    let target: VehiclesListPanelId | null = null;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        target = panel === 'simple' ? 'manager' : 'simple';
    } else if (event.key === 'Home') {
        target = 'simple';
    } else if (event.key === 'End') {
        target = 'manager';
    }

    if (!target) return;

    event.preventDefault();
    selectAndFocus(target);
}
</script>

<template>
    <div
        class="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Widok listy pojazdów"
    >
        <button
            id="vehicles-list-tab"
            ref="simpleTab"
            type="button"
            role="tab"
            class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :class="
                activePanel === 'simple'
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
            "
            :aria-selected="activePanel === 'simple'"
            aria-controls="vehicles-list-panel"
            :tabindex="activePanel === 'simple' ? 0 : -1"
            @click="emit('tabSelect', 'simple')"
            @keydown="handleKeydown($event, 'simple')"
        >
            <LayoutList class="size-3.5" aria-hidden="true" />
            Lista
        </button>
        <button
            id="vehicles-status-tab"
            ref="managerTab"
            type="button"
            role="tab"
            class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :class="
                activePanel === 'manager'
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
            "
            :aria-selected="activePanel === 'manager'"
            aria-controls="vehicles-status-panel"
            :tabindex="activePanel === 'manager' ? 0 : -1"
            @click="emit('tabSelect', 'manager')"
            @keydown="handleKeydown($event, 'manager')"
        >
            <Shield class="size-3.5" aria-hidden="true" />
            Status
        </button>
    </div>
</template>
