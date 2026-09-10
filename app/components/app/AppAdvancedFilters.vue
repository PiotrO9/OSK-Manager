<script setup lang="ts">
import { Plus, SlidersHorizontal, X } from 'lucide-vue-next';
import { useMediaQuery } from '@vueuse/core';
import type { AdvancedFilterChip } from '~~/shared/utils/advancedFilters';

const props = withDefaults(
    defineProps<{
        activeFilters: readonly AdvancedFilterChip[];
        editorTitle: string;
        disabled?: boolean;
        error?: string | null;
        triggerLabel?: string;
        clearLabel?: string;
        activeFiltersLabel?: string;
        editFilterLabelPrefix?: string;
        removeFilterLabelPrefix?: string;
        controlsBaseId?: string;
    }>(),
    {
        error: null,
        triggerLabel: 'Dodaj filtr',
        clearLabel: 'Wyczyść wszystkie',
        activeFiltersLabel: 'Aktywne filtry zaawansowane',
        editFilterLabelPrefix: 'Edytuj filtr',
        removeFilterLabelPrefix: 'Usuń filtr',
        controlsBaseId: 'advanced-filter',
    },
);

const emit = defineEmits<{
    startNew: [];
    startEdit: [filterId: string];
    apply: [];
    cancel: [];
    remove: [filterId: string];
    clear: [];
}>();

defineSlots<{
    editor(props: { apply: () => Promise<void>; cancel: () => void }): unknown;
}>();

const isDesktop = useMediaQuery('(min-width: 768px)');
const isEditorOpen = ref(false);

const filterCount = computed(() => props.activeFilters.length);

const editorId = computed(() => `${props.controlsBaseId}-editor`);
const sheetId = computed(() => `${props.controlsBaseId}-sheet`);

const desktopOpen = computed({
    get: () => isEditorOpen.value && isDesktop.value,
    set: (value: boolean) => {
        isEditorOpen.value = value;

        if (!value) emit('cancel');
    },
});

const mobileOpen = computed({
    get: () => isEditorOpen.value && !isDesktop.value,
    set: (value: boolean) => {
        isEditorOpen.value = value;

        if (!value) emit('cancel');
    },
});

function openNewFilter(): void {
    emit('startNew');
    isEditorOpen.value = true;
}

function openEditFilter(filterId: string): void {
    emit('startEdit', filterId);
    isEditorOpen.value = true;
}

function closeEditor(): void {
    isEditorOpen.value = false;
    emit('cancel');
}

async function handleApply(): Promise<void> {
    emit('apply');
    await nextTick();

    if (!props.error) {
        isEditorOpen.value = false;
    }
}
</script>

<template>
    <div class="space-y-3">
        <div
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
            <div class="hidden md:block">
                <UiPopover v-model:open="desktopOpen">
                    <UiPopoverTrigger as-child>
                        <UiButton
                            type="button"
                            variant="outline"
                            class="h-10 gap-2"
                            :disabled="disabled"
                            :aria-expanded="desktopOpen"
                            :aria-controls="editorId"
                            @click="openNewFilter"
                        >
                            <Plus class="size-4" aria-hidden="true" />
                            {{ triggerLabel }}
                            <span v-if="filterCount > 0">
                                ({{ filterCount }})
                            </span>
                        </UiButton>
                    </UiPopoverTrigger>
                    <UiPopoverContent
                        :id="editorId"
                        align="start"
                        class="w-[min(560px,calc(100vw-2rem))] p-5"
                    >
                        <div class="mb-4 flex items-center gap-2">
                            <SlidersHorizontal
                                class="text-muted-foreground size-4"
                                aria-hidden="true"
                            />
                            <p class="text-sm font-semibold">
                                {{ editorTitle }}
                            </p>
                        </div>
                        <slot
                            name="editor"
                            :apply="handleApply"
                            :cancel="closeEditor"
                        />
                    </UiPopoverContent>
                </UiPopover>
            </div>

            <div class="md:hidden">
                <UiSheet v-model:open="mobileOpen">
                    <UiSheetTrigger as-child>
                        <UiButton
                            type="button"
                            variant="outline"
                            class="h-11 w-full gap-2"
                            :disabled="disabled"
                            :aria-expanded="mobileOpen"
                            :aria-controls="sheetId"
                            @click="openNewFilter"
                        >
                            <Plus class="size-4" aria-hidden="true" />
                            {{ triggerLabel }}
                            <span v-if="filterCount > 0">
                                ({{ filterCount }})
                            </span>
                        </UiButton>
                    </UiSheetTrigger>
                    <UiSheetContent
                        :id="sheetId"
                        side="bottom"
                        class="max-h-[88vh] overflow-y-auto p-5"
                    >
                        <UiSheetHeader class="pr-8 text-left">
                            <UiSheetTitle>{{ editorTitle }}</UiSheetTitle>
                        </UiSheetHeader>
                        <slot
                            name="editor"
                            :apply="handleApply"
                            :cancel="closeEditor"
                        />
                    </UiSheetContent>
                </UiSheet>
            </div>

            <UiButton
                v-if="filterCount > 0"
                type="button"
                variant="ghost"
                size="sm"
                class="h-9 self-start text-xs sm:self-auto"
                :disabled="disabled"
                @click="emit('clear')"
            >
                {{ clearLabel }}
            </UiButton>
        </div>

        <div
            v-if="filterCount > 0"
            class="flex gap-2 overflow-x-auto pb-1"
            role="group"
            :aria-label="activeFiltersLabel"
        >
            <div
                v-for="filter in activeFilters"
                :key="filter.id"
                class="border-border bg-card text-foreground flex max-w-[min(34rem,88vw)] shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs shadow-xs"
            >
                <button
                    type="button"
                    class="focus-visible:ring-ring flex min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-md text-left focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="disabled"
                    :aria-label="`${editFilterLabelPrefix}: ${filter.label}`"
                    :title="filter.label"
                    @click="openEditFilter(filter.id)"
                >
                    <AppAdvancedFilterSegments :segments="filter.segments" />
                </button>
                <button
                    type="button"
                    class="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="disabled"
                    :aria-label="`${removeFilterLabelPrefix}: ${filter.label}`"
                    @click="emit('remove', filter.id)"
                >
                    <X class="size-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    </div>
</template>
